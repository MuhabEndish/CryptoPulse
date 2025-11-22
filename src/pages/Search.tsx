import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { searchCryptos } from "../services/cryptoApi";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";

type SearchTab = "posts" | "users" | "cryptos";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  crypto_symbol: string | null;
  profiles: {
    username: string;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

interface User {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  posts_count: number;
  followers_count: number;
}

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<SearchTab>("posts");
  const [loading, setLoading] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);

  useEffect(() => {
    if (query) {
      searchAll();
    }

    // Real-time subscriptions
    const postsChannel = supabase
      .channel("search-posts-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          console.log("Real-time post change in search:", payload);
          if (activeTab === "posts" && query) {
            searchPosts();
          }
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel("search-likes-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        (payload) => {
          console.log("Real-time like change in search:", payload);
          if (activeTab === "posts" && query) {
            searchPosts();
          }
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("search-comments-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          console.log("Real-time comment change in search:", payload);
          if (activeTab === "posts" && query) {
            searchPosts();
          }
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel("search-profiles-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          console.log("Real-time profile change in search:", payload);
          if (activeTab === "users" && query) {
            searchUsers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [query, activeTab]);

  const searchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        searchPosts(),
        searchUsers(),
        searchCryptosData(),
      ]);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles!inner(username, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const likesCount = post.likes?.[0]?.count || 0;
          const commentsCount = post.comments?.[0]?.count || 0;

          let userHasLiked = false;
          if (currentUser?.user) {
            const { data: likeData } = await supabase
              .from("likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", currentUser.user.id)
              .single();
            userHasLiked = !!likeData;
          }

          return {
            ...post,
            author_email: post.profiles?.username || "User",
            avatar_url: post.profiles?.avatar_url || null,
            likes_count: likesCount,
            comments_count: commentsCount,
            user_has_liked: userHasLiked,
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error("Error searching posts:", error);
      setPosts([]);
    }
  };

  const searchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          posts:posts(count),
          followers:profiles(count)
        `)
        .ilike("username", `%${query}%`)
        .limit(20);

      if (error) throw error;

      const usersWithCounts = (data || []).map((user) => ({
        ...user,
        posts_count: user.posts?.[0]?.count || 0,
        followers_count: user.followers?.[0]?.count || 0,
      }));

      setUsers(usersWithCounts);
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    }
  };

  const searchCryptosData = async () => {
    try {
      const results = await searchCryptos(query);
      setCryptos(results);
    } catch (error) {
      console.error("Error searching cryptos:", error);
      setCryptos([]);
    }
  };

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: active ? "var(--accent)" : "var(--card)",
    color: "white",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: active ? "0 4px 12px rgba(139, 92, 246, 0.4)" : "none",
  });

  return (
    <div style={{ padding: "clamp(15px, 3vw, 20px)", maxWidth: "900px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 20px",
          borderRadius: "10px",
          border: "none",
          background: "var(--card)",
          color: "white",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateX(-5px)";
          e.currentTarget.style.background = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.background = "var(--card)";
        }}
      >
        ← الرجوع للصفحة الرئيسية
      </button>

      <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", marginBottom: "10px" }}>
        🔍 نتائج البحث
      </h1>
      <p style={{ color: "#aaa", marginBottom: "30px", fontSize: "clamp(14px, 2.5vw, 16px)" }}>
        البحث عن: <strong style={{ color: "var(--accent)" }}>{query}</strong>
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <button
          style={tabStyle(activeTab === "posts")}
          onClick={() => setActiveTab("posts")}
        >
          💬 منشورات ({posts.length})
        </button>
        <button
          style={tabStyle(activeTab === "users")}
          onClick={() => setActiveTab("users")}
        >
          👤 مستخدمين ({users.length})
        </button>
        <button
          style={tabStyle(activeTab === "cryptos")}
          onClick={() => setActiveTab("cryptos")}
        >
          🪙 عملات ({cryptos.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {posts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", padding: "40px" }}>
                  لم يتم العثور على منشورات 🔍
                </p>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} onChange={searchPosts} />)
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {users.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", padding: "40px" }}>
                  لم يتم العثور على مستخدمين 🔍
                </p>
              ) : (
                users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.id}`}
                    style={{
                      textDecoration: "none",
                      background: "var(--card)",
                      borderRadius: "12px",
                      padding: "20px",
                      transition: "all 0.3s ease",
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: user.avatar_url
                          ? `url(${user.avatar_url}) center/cover`
                          : "linear-gradient(135deg, var(--accent), #ec4899)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        flexShrink: 0,
                      }}
                    >
                      {!user.avatar_url && "👤"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: "18px", color: "white" }}>
                        {user.username}
                      </h3>
                      {user.bio && (
                        <p style={{ margin: "5px 0 0", color: "#aaa", fontSize: "14px" }}>
                          {user.bio}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "15px", marginTop: "10px", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>
                          📝 {user.posts_count} منشورات
                        </span>
                        <span style={{ color: "#888" }}>
                          👥 {user.followers_count} متابعين
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Cryptos Tab */}
          {activeTab === "cryptos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {cryptos.length === 0 ? (
                <p style={{ textAlign: "center", color: "#aaa", padding: "40px" }}>
                  لم يتم العثور على عملات رقمية 🔍
                </p>
              ) : (
                cryptos.map((crypto) => (
                  <Link
                    key={crypto.id}
                    to={`/coin/${crypto.id}`}
                    style={{
                      textDecoration: "none",
                      background: "var(--card)",
                      borderRadius: "12px",
                      padding: "20px",
                      transition: "all 0.3s ease",
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      style={{ width: "50px", height: "50px", borderRadius: "50%", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: "18px", color: "white" }}>
                        {crypto.name}
                      </h3>
                      <p style={{ margin: "5px 0 0", color: "#aaa", fontSize: "14px" }}>
                        {crypto.symbol.toUpperCase()}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>
                        ${crypto.current_price.toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: crypto.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444",
                          marginTop: "5px",
                        }}
                      >
                        {crypto.price_change_percentage_24h >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
