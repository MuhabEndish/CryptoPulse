import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  AiFillFire as FireOutlined,
  AiFillHeart as HeartFilled,
  AiOutlineMessage as MessageOutlined,
  AiOutlineSearch as SearchOutlined,
  AiOutlineEdit as EditOutlined,
  AiOutlineClockCircle as ClockOutlined,
  AiOutlineRise as RiseOutlined,
  AiOutlineFall as FallOutlined,
  AiOutlineMinus as MinusOutlined,
  AiOutlineDollarCircle as DollarOutlined,
  AiOutlineBarChart as BarChartOutlined,
  AiOutlineTeam as TeamOutlined,
  AiOutlineGlobal as GlobalOutlined
} from 'react-icons/ai';
import { BiComment as CommentOutlined } from 'react-icons/bi';

export default function Feed() {
  const navigate = useNavigate();
  const user = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "comments">("latest");
  const [filterCoin, setFilterCoin] = useState<string>("all");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [showFollowing, setShowFollowing] = useState(false);
  const [sentimentStats, setSentimentStats] = useState({ bullish: 0, bearish: 0, neutral: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const coins = ["all", "BTC", "ETH", "SOL", "BNB", "ADA", "DOT", "MATIC", "AVAX"];

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilters]);

  async function loadPosts() {
    setLoading(true);

    // Fetch list of banned users
    const { data: bannedUsers } = await supabase
      .from('banned_users')
      .select('user_id');

    const bannedUserIds = bannedUsers?.map(b => b.user_id) || [];

    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        likes(id),
        comments(id),
        profiles(username, avatar_url, privacy_settings)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
      setLoading(false);
      return;
    }

    console.log("Posts loaded:", data);

    // Make sure data exists before processing
    if (!data || data.length === 0) {
      console.log("No posts found");
      setPosts([]);
      setLoading(false);
      return;
    }

    // Filter posts from banned users
    let filteredData = data.filter((post: any) =>
      !bannedUserIds.includes(post.user_id)
    );

    // Filter posts based on privacy settings - hide posts from users with showActivity disabled
    filteredData = filteredData.filter((post: any) => {
      // Always show own posts
      if (post.user_id === user?.id) return true;

      // Check if user has showActivity enabled
      const privacySettings = post.profiles?.privacy_settings || {};
      const showActivity = privacySettings.showActivity ?? true; // Default to true
      return showActivity;
    });

    let processedPosts = filteredData.map((post: any) => ({
      ...post,
      author_email: post.profiles?.username || "User",
      avatar_url: post.profiles?.avatar_url || null,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.length || 0,
      coin: post.coin || "BTC",
      sentiment: post.sentiment || "Neutral"
    }));

    // Apply filters
    if (filterCoin !== "all") {
      processedPosts = processedPosts.filter((post: any) => post.coin === filterCoin);
    }
    if (filterSentiment !== "all") {
      processedPosts = processedPosts.filter((post: any) => post.sentiment === filterSentiment);
    }

    // Apply sorting
    if (sortBy === "likes") {
      processedPosts.sort((a: any, b: any) => b.likes_count - a.likes_count);
    } else if (sortBy === "comments") {
      processedPosts.sort((a: any, b: any) => b.comments_count - a.comments_count);
    }
    // "latest" is already sorted by created_at DESC from the query

    // Calculate sentiment stats for displayed posts
    const stats = { bullish: 0, bearish: 0, neutral: 0 };
    processedPosts.forEach((post: any) => {
      if (post.sentiment === "Bullish") stats.bullish++;
      else if (post.sentiment === "Bearish") stats.bearish++;
      else stats.neutral++;
    });
    setSentimentStats(stats);

    setPosts(processedPosts);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;

    loadPosts();

    // ✅ Real-time subscription for posts
    const postsChannel = supabase
      .channel("posts-channel")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("Real-time post change:", payload);
          // Reload posts on any change
          loadPosts();
        }
      )
      .subscribe();

    // ✅ Real-time subscription for likes
    const likesChannel = supabase
      .channel("likes-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
        },
        (payload) => {
          console.log("Real-time like change:", payload);
          loadPosts();
        }
      )
      .subscribe();

    // ✅ Real-time subscription for comments
    const commentsChannel = supabase
      .channel("comments-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        (payload) => {
          console.log("Real-time comment change:", payload);
          loadPosts();
        }
      )
      .subscribe();

    // Cleanup subscriptions when leaving page
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user]);

  // Reload posts when filters or sorting changes
  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [sortBy, filterCoin, filterSentiment, showFollowing]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="medium" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header Bar */}
      <div className={`sticky top-16 z-20 bg-dark-card border-b border-dark-border backdrop-blur-sm bg-opacity-95 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-6'
      }`}>
        <div className="w-full px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Left: Market Stats */}
            <div className="flex items-center gap-6">
              {/* Trending Coin */}
              <div className={`transition-all duration-300 ${isScrolled ? 'text-center' : ''}`}>
                <div className={`text-gray-400 transition-all duration-300 flex items-center gap-1 justify-center ${
                  isScrolled ? 'text-xs' : 'text-sm mb-1'
                }`}>
                  <FireOutlined className={`text-orange-500 ${isScrolled ? 'text-base' : 'text-lg'}`} />
                  {!isScrolled && 'Trending Coin'}
                </div>
                <div className={`font-bold text-white transition-all duration-300 ${
                  isScrolled ? 'text-base' : 'text-xl'
                }`}>
                  BTC
                </div>
              </div>

              {/* Market Mood */}
              <div className={`transition-all duration-300 ${isScrolled ? 'text-center' : ''}`}>
                <div className={`text-gray-400 transition-all duration-300 flex items-center gap-1 justify-center ${
                  isScrolled ? 'text-xs' : 'text-sm mb-1'
                }`}>
                  <BarChartOutlined className={`${isScrolled ? 'text-base' : 'text-lg'}`} />
                  {!isScrolled && 'Market Mood'}
                </div>
                <div className={`font-bold text-green-400 transition-all duration-300 ${
                  isScrolled ? 'text-base' : 'text-xl'
                }`}>
                  Bullish
                </div>
              </div>

              {/* Sentiment Snapshot */}
              {!loading && posts.length > 0 && (
                <div className={`flex items-center transition-all duration-300 ${
                  isScrolled ? 'gap-3' : 'gap-4 px-4 py-2 bg-primary/10 rounded-lg'
                }`}>
                  {!isScrolled && (
                    <span className="text-white font-semibold text-sm flex items-center gap-1">
                      <BarChartOutlined className="text-lg" /> Sentiment:
                    </span>
                  )}
                  {isScrolled && <BarChartOutlined className="text-gray-400 text-base" />}

                  <div className="flex items-center gap-1">
                    <RiseOutlined className={`text-green-400 ${isScrolled ? 'text-base' : 'text-lg'}`} />
                    <span className={`text-green-400 font-bold ${isScrolled ? 'text-sm' : 'text-base'}`}>
                      {sentimentStats.bullish > 0 ? Math.round((sentimentStats.bullish / posts.length) * 100) : 0}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <FallOutlined className={`text-red-400 ${isScrolled ? 'text-base' : 'text-lg'}`} />
                    <span className={`text-red-400 font-bold ${isScrolled ? 'text-sm' : 'text-base'}`}>
                      {sentimentStats.bearish > 0 ? Math.round((sentimentStats.bearish / posts.length) * 100) : 0}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <MinusOutlined className={`text-gray-400 ${isScrolled ? 'text-base' : 'text-lg'}`} />
                    <span className={`text-gray-400 font-bold ${isScrolled ? 'text-sm' : 'text-base'}`}>
                      {sentimentStats.neutral > 0 ? Math.round((sentimentStats.neutral / posts.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`bg-dark hover:bg-dark-border text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 border border-dark-border ${
                    isScrolled ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
                  }`}
                >
                  <SearchOutlined className={isScrolled ? 'text-lg' : 'text-xl'} />
                  <span>Filters</span>
                </button>

                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-glow-lg overflow-hidden z-30">
                    <div className="p-4 space-y-4">
                      {/* Sort By Section */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <ClockOutlined className="text-lg" />
                          Sort By
                        </h4>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => { setSortBy("latest"); setShowFilters(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-2 ${
                              sortBy === "latest"
                                ? "bg-primary text-white"
                                : "bg-dark text-gray-400 hover:text-white hover:bg-dark-border"
                            }`}
                          >
                            <ClockOutlined className="text-base" /> Latest Posts
                          </button>
                          <button
                            onClick={() => { setSortBy("likes"); setShowFilters(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-2 ${
                              sortBy === "likes"
                                ? "bg-primary text-white"
                                : "bg-dark text-gray-400 hover:text-white hover:bg-dark-border"
                            }`}
                          >
                            <HeartFilled className="text-base" /> Most Liked
                          </button>
                          <button
                            onClick={() => { setSortBy("comments"); setShowFilters(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-2 ${
                              sortBy === "comments"
                                ? "bg-primary text-white"
                                : "bg-dark text-gray-400 hover:text-white hover:bg-dark-border"
                            }`}
                          >
                            <CommentOutlined className="text-base" /> Most Discussed
                          </button>
                        </div>
                      </div>

                      <hr className="border-dark-border" />

                      {/* Filter By Coin */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <DollarOutlined className="text-lg" />
                          Filter by Coin
                        </h4>
                        <select
                          value={filterCoin}
                          onChange={(e) => setFilterCoin(e.target.value)}
                          className="w-full bg-dark text-white px-4 py-2 rounded-lg border border-dark-border focus:border-primary focus:outline-none"
                        >
                          {coins.map((coin) => (
                            <option key={coin} value={coin}>
                              {coin === "all" ? "All Coins" : coin}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Filter By Sentiment */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <BarChartOutlined className="text-lg" />
                          Filter by Sentiment
                        </h4>
                        <select
                          value={filterSentiment}
                          onChange={(e) => setFilterSentiment(e.target.value)}
                          className="w-full bg-dark text-white px-4 py-2 rounded-lg border border-dark-border focus:border-primary focus:outline-none"
                        >
                          <option value="all">All Sentiments</option>
                          <option value="Bullish">Bullish</option>
                          <option value="Bearish">Bearish</option>
                          <option value="Neutral">Neutral</option>
                        </select>
                      </div>

                      <hr className="border-dark-border" />

                      {/* Following Toggle */}
                      <button
                        onClick={() => { setShowFollowing(!showFollowing); setShowFilters(false); }}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          showFollowing
                            ? "bg-primary text-white"
                            : "bg-dark text-gray-400 hover:text-white hover:bg-dark-border"
                        }`}
                      >
                        {showFollowing ? (
                          <><TeamOutlined className="text-lg" /> Following</>
                        ) : (
                          <><GlobalOutlined className="text-lg" /> All Posts</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Create Post Button */}
              <button
                onClick={() => navigate('/create-post')}
                className={`bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-glow transition-all duration-300 flex items-center gap-2 ${
                  isScrolled ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'
                }`}
              >
                <EditOutlined className={isScrolled ? 'text-lg' : 'text-xl'} />
                <span>Create Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Body - Two Column Layout */}
      <div className="flex gap-6 px-4">
        {/* Left Side - Posts */}
        <div className="flex-1 min-w-0 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="medium" message="Loading posts..." />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
              <p className="text-gray-400">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-6 w-full max-w-4xl">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onChange={loadPosts} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Empty for now */}
        <div className="w-80 flex-shrink-0 sticky top-4 h-fit hidden lg:block">
          {/* Content will go here */}
        </div>
      </div>
    </div>
  );
}
