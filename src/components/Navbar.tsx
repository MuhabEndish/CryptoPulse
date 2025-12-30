import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import PriceAlertModal from "./PriceAlertModal";
import { useToast } from "./ToastProvider";
import {
  AiOutlineDashboard as DashboardOutlined,
  AiOutlineGlobal as GlobalOutlined,
  AiOutlineMessage as MessageOutlined,
  AiOutlineStar as StarOutlined,
  AiOutlineBell as BellOutlined,
  AiOutlineSearch as SearchOutlined,
  AiOutlineMoon as MoonOutlined,
  AiOutlineSun as SunOutlined,
  AiOutlinePlus as PlusOutlined,
  AiOutlineUser as UserOutlined,
  AiOutlineLogout as LogoutOutlined,
  AiOutlineEdit as EditOutlined,
  AiOutlineWarning as WarningOutlined,
  AiOutlineHeart as HeartOutlined,
  AiOutlineArrowUp as ArrowUpOutlined,
  AiOutlineArrowDown as ArrowDownOutlined,
  AiOutlineMinus as MinusOutlined,
  AiOutlineMenu as MenuOutlined,
  AiOutlineComment as CommentOutlined
} from 'react-icons/ai';

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
  const { pathname } = useLocation();
  const user = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [marketSentiment, setMarketSentiment] = useState<"Bullish" | "Bearish" | "Neutral">("Neutral");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState<{avatar_url?: string} | null>(null);
  const [showCoinSelector, setShowCoinSelector] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [coins, setCoins] = useState<any[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const { showToast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  const primaryNavItems = [
    { icon: <DashboardOutlined />, label: "Dashboard", path: "/" },
    { icon: <GlobalOutlined />, label: "Market", path: "/market" },
    { icon: <MessageOutlined />, label: "Social", path: "/feed" },
  ];

  const secondaryNavItems = [
    { icon: <StarOutlined />, label: "Watchlist", path: "/favorites" },
    { icon: <BellOutlined />, label: "Alerts", path: "/alerts" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

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
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setShowQuickAction(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setShowMobileMenu(false);
      }
    }

    if (showUserMenu || showNotifications || showMobileMenu || showQuickAction) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserMenu, showNotifications, showMobileMenu, showQuickAction]);

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
    loadUserProfile();

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

  // Fetch market sentiment
  useEffect(() => {
    async function fetchMarketSentiment() {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/global"
        );
        const data = await response.json();

        const marketCapChangePercentage = data.data.market_cap_change_percentage_24h_usd;

        if (marketCapChangePercentage > 2) {
          setMarketSentiment("Bullish");
        } else if (marketCapChangePercentage < -2) {
          setMarketSentiment("Bearish");
        } else {
          setMarketSentiment("Neutral");
        }
      } catch (error) {
        console.error("Error fetching market sentiment:", error);
        setMarketSentiment("Neutral");
      }
    }

    fetchMarketSentiment();
    // Update every 5 minutes
    const interval = setInterval(fetchMarketSentiment, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadUserProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      setUserProfile(data);
    }
  }

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
    navigate("/login");
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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ========== LEFT ZONE: Logo + Navigation ========== */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center mr-2">
              <img
                src="/images/CryptoPulseLogo.png"
                alt="CryptoPulse Logo"
                className="h-15 w-auto"
              />
              <span className="hidden sm:inline-block text-white font-bold text-lg -ml-2">
                CryptoPulse
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              ref={mobileButtonRef}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark transition-all"
            >
              <MenuOutlined className="text-2xl" />
            </button>

            {/* Primary Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-glow"
                      : "text-gray-400 hover:bg-dark hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ========== CENTER ZONE: Search + Market Context ========== */}
          <div className="flex-1 flex items-center gap-3 max-w-2xl">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  <SearchOutlined />
                </span>
                <input
                  type="text"
                  placeholder="Search coins, posts, users (⌘K)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-dark rounded-lg border border-dark-border text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Market Pulse Indicator - Desktop */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-dark border border-dark-border">
              <span className={`text-xl ${
                marketSentiment === "Bullish" ? "text-green-500" :
                marketSentiment === "Bearish" ? "text-red-500" :
                "text-gray-400"
              }`}>
                {marketSentiment === "Bullish" ? <ArrowUpOutlined /> :
                 marketSentiment === "Bearish" ? <ArrowDownOutlined /> :
                 <MinusOutlined />}
              </span>
              <span className="text-xs text-gray-400">
                Market: <span className={
                  marketSentiment === "Bullish" ? "text-green-400" :
                  marketSentiment === "Bearish" ? "text-red-400" :
                  "text-gray-400"
                }>{marketSentiment}</span>
              </span>
            </div>
          </div>

          {/* ========== RIGHT ZONE: Actions ========== */}
          <div className="flex items-center gap-2">

            {/* Quick Action Button (+) */}
            {user && (
              <div className="relative" ref={quickActionRef}>
                <button
                  onClick={() => setShowQuickAction(!showQuickAction)}
                  className="p-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition-all"
                  title="Quick Actions"
                >
                  <PlusOutlined className="text-xl" />
                </button>

                {showQuickAction && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-glow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        navigate("/create-post");
                        setShowQuickAction(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-dark transition-colors flex items-center gap-3"
                    >
                      <EditOutlined className="text-lg" />
                      <span className="text-sm font-medium">Create Post</span>
                    </button>
                    <button
                      onClick={async () => {
                        console.log("Create Alert clicked!");
                        setShowQuickAction(false);
                        setShowCoinSelector(true);
                        setLoadingCoins(true);
                        console.log("showCoinSelector set to true");
                        try {
                          const response = await fetch(
                            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false"
                          );
                          const data = await response.json();
                          setCoins(data);
                          console.log("Coins loaded:", data.length);
                        } catch (error) {
                          console.error("Error loading coins:", error);
                          showToast("Failed to load coins", "error");
                        } finally {
                          setLoadingCoins(false);
                        }
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-dark transition-colors flex items-center gap-3"
                    >
                      <BellOutlined className="text-lg" />
                      <span className="text-sm font-medium">Create Alert</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/favorites");
                        setShowQuickAction(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-dark transition-colors flex items-center gap-3"
                    >
                      <StarOutlined className="text-lg" />
                      <span className="text-sm font-medium">Add to Watchlist</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hidden sm:block p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark transition-all"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <MoonOutlined className="text-xl" /> : <SunOutlined className="text-xl" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark transition-all relative"
                title="Notifications"
              >
                <BellOutlined className="text-xl" />
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
                        <BellOutlined className="text-5xl mb-2" />
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
                              {notification.type === "like" ? <HeartOutlined style={{color: '#ef4444'}} /> : <CommentOutlined style={{color: '#8b5cf6'}} />}
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
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark transition-all"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                      <UserOutlined className="text-base" />
                    </div>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-glow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-dark transition-colors flex items-center gap-2"
                    >
                      <UserOutlined className="text-lg" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/favorites");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-dark transition-colors flex items-center gap-2"
                    >
                      <StarOutlined className="text-lg" /> Watchlist
                    </button>
                    <button
                      onClick={() => {
                        navigate("/alerts");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-dark transition-colors flex items-center gap-2"
                    >
                      <BellOutlined className="text-lg" /> Price Alerts
                    </button>
                    <hr className="border-dark-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark transition-colors flex items-center gap-2"
                    >
                      <LogoutOutlined className="text-lg" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div ref={mobileMenuRef} className="lg:hidden border-t border-dark-border bg-dark-card">
          <div className="px-4 py-2 space-y-1">
            {/* Primary Navigation */}
            {primaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-primary text-white shadow-glow"
                    : "text-gray-400 hover:bg-dark hover:text-white"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Secondary Navigation */}
            <div className="pt-2 border-t border-dark-border">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-glow"
                      : "text-gray-400 hover:bg-dark hover:text-white"
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coin Selector Modal */}
      {showCoinSelector && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 99999 }}
          onClick={() => {
            console.log("Backdrop clicked");
            setShowCoinSelector(false);
          }}
        >
          <div
            className="bg-dark-card border border-primary/30 rounded-xl max-w-2xl w-full max-h-[85vh] my-auto overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border bg-gradient-to-r from-primary/10 to-pink-500/10">
              <div>
                <h2 className="text-xl font-bold text-white">Select Cryptocurrency</h2>
                <p className="text-gray-400 text-sm mt-1">Choose a coin to create a price alert</p>
              </div>
              <button
                onClick={() => setShowCoinSelector(false)}
                className="text-gray-400 hover:text-white hover:bg-dark rounded-lg p-2 transition-colors text-2xl"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Coin List */}
            <div className="overflow-y-auto flex-1 p-4">
              {loadingCoins ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                  <p className="text-gray-400">Loading coins...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coins.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => {
                        setSelectedCoin({
                          id: coin.id,
                          name: coin.name,
                          symbol: coin.symbol,
                          current_price: coin.current_price
                        });
                        setShowCoinSelector(false);
                        setShowAlertModal(true);
                      }}
                      className="w-full flex items-center gap-4 p-4 bg-dark rounded-lg hover:bg-dark-card border border-dark-border hover:border-primary/50 transition-all text-left group"
                    >
                      <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold group-hover:text-primary transition-colors">{coin.name}</span>
                          <span className="text-gray-400 uppercase text-sm">{coin.symbol}</span>
                        </div>
                        <span className="text-primary font-bold text-lg">
                          ${coin.current_price.toLocaleString()}
                        </span>
                      </div>
                      <BellOutlined className="text-gray-400 group-hover:text-primary text-xl transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Price Alert Modal */}
      {showAlertModal && selectedCoin && user && (
        <PriceAlertModal
          isOpen={showAlertModal}
          onClose={() => {
            setShowAlertModal(false);
            setSelectedCoin(null);
          }}
          coin={selectedCoin}
          userId={user.id}
        />
      )}
    </nav>
  );
}
