import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";

interface Notification {
  id: string;
  type: "like" | "comment";
  post_id: string;
  post_content: string;
  actor_username: string;
  comment_text?: string;
  created_at: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showUserMenu || showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserMenu, showNotifications]);

  // Clear unread count when opening notifications
  useEffect(() => {
    if (showNotifications && user) {
      // Mark all current notifications as seen
      const notificationIds = notifications.map(n => n.id);
      const seenKey = `seen_notifications_${user.id}`;
      const existingSeen = JSON.parse(localStorage.getItem(seenKey) || '[]');
      const allSeen = [...new Set([...existingSeen, ...notificationIds])];
      localStorage.setItem(seenKey, JSON.stringify(allSeen));
      setUnreadCount(0);
    }
  }, [showNotifications, notifications, user]);

  // Load notifications
  useEffect(() => {
    if (!user) return;
    loadNotifications();

    // Real-time subscription for new likes and comments
    const likesChannel = supabase
      .channel("navbar-likes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "likes",
        },
        () => loadNotifications()
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("navbar-comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
        },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user]);

  async function loadNotifications() {
    if (!user) return;

    try {
      // Get user's posts
      const { data: userPosts, error: postsError } = await supabase
        .from("posts")
        .select("id, content")
        .eq("user_id", user.id);

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return;
      }

      if (!userPosts || userPosts.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const postIds = userPosts.map((p) => p.id);

      // Get recent likes on user's posts with actor profile
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("id, post_id, user_id")
        .in("post_id", postIds)
        .neq("user_id", user.id)
        .limit(10);

      if (likesError) {
        console.error("Error fetching likes:", likesError);
      }

      // Get recent comments on user's posts with actor profile
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("id, post_id, user_id, content, created_at")
        .in("post_id", postIds)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      }

      // Fetch profiles for all actors
      const allUserIds = [
        ...(likesData || []).map((l) => l.user_id),
        ...(commentsData || []).map((c) => c.user_id),
      ];
      const uniqueUserIds = [...new Set(allUserIds)];

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, email")
        .in("id", uniqueUserIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.id, p.username || p.email?.split("@")[0] || "User"])
      );

      const postsMap = new Map(userPosts.map((p) => [p.id, p.content]));

      // Combine and sort notifications
      const allNotifications: Notification[] = [
        ...(likesData || []).map((like) => ({
          id: like.id,
          type: "like" as const,
          post_id: like.post_id,
          post_content: postsMap.get(like.post_id) || "",
          actor_username: profilesMap.get(like.user_id) || "User",
          created_at: new Date().toISOString(), // likes don't have created_at
        })),
        ...(commentsData || []).map((comment) => ({
          id: comment.id,
          type: "comment" as const,
          post_id: comment.post_id,
          post_content: postsMap.get(comment.post_id) || "",
          actor_username: profilesMap.get(comment.user_id) || "User",
          comment_text: comment.content,
          created_at: comment.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications.slice(0, 10));

      // Calculate unread count based on unseen notifications
      if (user) {
        const seenKey = `seen_notifications_${user.id}`;
        const seenIds = JSON.parse(localStorage.getItem(seenKey) || '[]');
        const unseenCount = allNotifications.filter(n => !seenIds.includes(n.id)).length;
        setUnreadCount(unseenCount);
      } else {
        setUnreadCount(allNotifications.length);
      }

      console.log("Notifications loaded:", allNotifications.length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  function getTimeAgo(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <nav className="sticky top-0 z-30 bg-dark-card border-b border-dark-border backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo (Mobile Only) */}
          <div className="flex items-center md:hidden">
            <span className="text-2xl">₿</span>
          </div>

          {/* Center: Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search coins, posts, or hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark rounded-lg border border-dark-border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark transition-all"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              <span className="text-xl">{darkMode ? "🌙" : "☀️"}</span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark transition-all relative"
                title="Notifications"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && user && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-lg shadow-glow-lg overflow-hidden">
                  <div className="p-4 border-b border-dark-border">
                    <h3 className="font-bold text-white">Notifications</h3>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <span className="text-4xl mb-2 block">🔔</span>
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            navigate(`/post/${notification.post_id}`);
                            setShowNotifications(false);
                          }}
                          className="w-full p-4 text-left hover:bg-dark transition-colors border-b border-dark-border last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">
                              {notification.type === "like" ? "❤️" : "💬"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm mb-1">
                                <span className="font-semibold text-primary">
                                  {notification.actor_username}
                                </span>
                                {notification.type === "like"
                                  ? " liked your post"
                                  : " commented on your post"}
                              </p>
                              {notification.comment_text && (
                                <p className="text-gray-400 text-xs mb-1 line-clamp-2">
                                  "{notification.comment_text}"
                                </p>
                              )}
                              <p className="text-gray-500 text-xs line-clamp-1">
                                {notification.post_content}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {getTimeAgo(notification.created_at)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark transition-all"
                >
                  <span className="text-xl">👤</span>
                  <span className="hidden sm:inline text-sm font-medium text-white">
                    Profile
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-glow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-dark transition-colors"
                    >
                      👤 My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/favorites");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-dark transition-colors"
                    >
                      ⭐ Watchlist
                    </button>
                    <button
                      onClick={() => {
                        navigate("/alerts");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-dark transition-colors"
                    >
                      🔔 Price Alerts
                    </button>
                    <hr className="border-dark-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
