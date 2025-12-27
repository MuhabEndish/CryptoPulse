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
        .select("id, username, email, bio, avatar_url, created_at")
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);

      if (error) {
        console.error("Error searching users:", error);
        throw error;
      }

      console.log("Users search results:", data);

      // Manually get post counts for each user
      const usersWithCounts = await Promise.all(
        (data || []).map(async (user) => {
          const { count: postsCount } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          return {
            ...user,
            posts_count: postsCount || 0,
            followers_count: 0, // You can implement followers later
          };
        })
      );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🔍 Search Results</h1>
        <p className="text-gray-400">
          Searching for: <span className="text-primary font-semibold">{query || "..."}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-dark-card border border-dark-border rounded-lg p-1">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
            activeTab === "posts"
              ? "bg-primary text-white shadow-glow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          💬 Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
            activeTab === "users"
              ? "bg-primary text-white shadow-glow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          👤 Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("cryptos")}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
            activeTab === "cryptos"
              ? "bg-primary text-white shadow-glow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          🪙 Cryptos ({cryptos.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" message="Searching..." />
        </div>
      ) : (
        <div>
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
                  <p className="text-gray-400">No posts found 🔍</p>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} onChange={searchPosts} />)
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
                  <p className="text-gray-400">No users found 🔍</p>
                </div>
              ) : (
                users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-4 p-6 bg-dark-card border border-dark-border rounded-xl hover:shadow-glow transition-all group"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shrink-0"
                      style={{
                        background: user.avatar_url
                          ? `url(${user.avatar_url}) center/cover`
                          : "linear-gradient(135deg, var(--accent), #ec4899)",
                      }}
                    >
                      {!user.avatar_url && "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                        {user.username}
                      </h3>
                      {user.bio && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{user.bio}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📝 {user.posts_count} posts</span>
                        <span>👥 {user.followers_count} followers</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Cryptos Tab */}
          {activeTab === "cryptos" && (
            <div className="space-y-4">
              {cryptos.length === 0 ? (
                <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
                  <p className="text-gray-400">No cryptocurrencies found 🔍</p>
                </div>
              ) : (
                cryptos.map((crypto) => (
                  <Link
                    key={crypto.id}
                    to={`/coin/${crypto.id}`}
                    className="flex items-center gap-4 p-6 bg-dark-card border border-dark-border rounded-xl hover:shadow-glow transition-all group"
                  >
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-14 h-14 rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                        {crypto.name}
                      </h3>
                      <p className="text-sm text-gray-400 uppercase mt-1">{crypto.symbol}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        ${crypto.current_price.toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium mt-1 ${
                        crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
