import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, checkIfUserBanned } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";
import ReportModal from "./ReportModal";
import ConfirmModal from "./ConfirmModal";
import {
  AiFillFire as FireOutlined,
  AiFillHeart as HeartFilled,
  AiOutlineHeart as HeartOutlined,
  AiOutlineMessage as MessageOutlined,
  AiOutlineBarChart as BarChartOutlined,
  AiFillStar as StarFilled,
  AiOutlineEdit as EditOutlined,
  AiOutlineDelete as DeleteOutlined,
  AiOutlineWarning as WarningOutlined,
  AiOutlineRise as RiseOutlined,
  AiOutlineFall as FallOutlined,
  AiOutlineMinus as MinusOutlined,
  AiOutlineDollarCircle as DollarOutlined,
  AiOutlineArrowRight as ArrowRightOutlined,
  AiOutlineSave as SaveOutlined,
  AiOutlineClose as CloseOutlined,
  AiOutlineEllipsis as EllipsisOutlined
} from 'react-icons/ai';
import { BiComment as CommentOutlined } from 'react-icons/bi';

type PostCardProps = {
  post: any;
  onChange: () => Promise<void>;
};

export default function PostCard({ post, onChange }: PostCardProps) {
  const user = useAuth();
  const { showToast } = useToast();
  const liked = post.likes?.some((l: any) => l.user_id === user?.id);
  const likesCount = post.likes?.length || 0;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if post author allows social interactions
  const authorPrivacySettings = post.profiles?.privacy_settings || {};
  const allowSocialInteractions = authorPrivacySettings.allowSocialInteractions ?? true;

  const coin = post.coin || "BTC";
  const sentiment = post.sentiment || "Neutral";

  // Map coin symbols to CoinGecko IDs
  const coinIdMap: { [key: string]: string } = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    BNB: "binancecoin",
    ADA: "cardano",
    DOT: "polkadot",
    MATIC: "matic-network",
    AVAX: "avalanche-2"
  };

  const coinId = coinIdMap[coin] || coin.toLowerCase();

  const sentimentColors = {
    Bullish: { bg: "#10b981", text: "text-green-400", icon: RiseOutlined },
    Bearish: { bg: "#ef4444", text: "text-red-400", icon: FallOutlined },
    Neutral: { bg: "#6b7280", text: "text-gray-400", icon: MinusOutlined }
  };

  const currentSentiment = sentimentColors[sentiment as keyof typeof sentimentColors] || sentimentColors.Neutral;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  async function toggleLike() {
    if (!user) return;

    // 🚫 Check if user is banned
    const banStatus = await checkIfUserBanned();
    if (banStatus.isBanned) {
      const message = banStatus.banType === 'permanent'
        ? `❌ You are permanently banned from the platform.\n📋 Reason: ${banStatus.reason}`
        : `❌ You are temporarily banned until ${new Date(banStatus.bannedUntil!).toLocaleDateString()}.\n📋 Reason: ${banStatus.reason}`;
      showToast(message, "error");
      return;
    }

    if (liked) {
      await supabase.from("likes").delete().match({
        post_id: post.id,
        user_id: user.id,
      });
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: user.id,
      });
    }

    await onChange(); // ✅ refresh list
  }

  async function deletePost() {
    await supabase.from("posts").delete().eq("id", post.id);
    showToast("Post deleted successfully!", "success");
    await onChange(); // ✅ refresh list
  }

  async function saveEdit() {
    if (!editContent.trim()) {
      showToast("Post content cannot be empty!", "error");
      return;
    }

    await supabase
      .from("posts")
      .update({
        content: editContent,
        updated_at: new Date().toISOString()
      })
      .eq("id", post.id);

    post.content = editContent;
    post.updated_at = new Date().toISOString();
    setIsEditing(false);
    showToast("Post updated successfully!", "success");
    await onChange(); // ✅ refresh list
  }

  function cancelEdit() {
    setEditContent(post.content);
    setIsEditing(false);
  }

  const isOwner = user?.id === post.user_id;
  const navigate = useNavigate();

  // Calculate if post is high impact
  const impactScore = (post.likes_count || 0) + (post.comments_count || 0) * 2;
  const isHighImpact = impactScore >= 10;

  // Load comments when shown
  async function loadComments() {
    if (comments.length > 0) return; // Already loaded

    setLoadingComments(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading comments:", error);
    } else {
      setComments(data || []);
    }
    setLoadingComments(false);
  }

  // Toggle comments display
  function toggleComments() {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3 hover:border-primary/30 hover:shadow-glow transition-all">
      {/* High Impact Badge */}
      {isHighImpact && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
          <FireOutlined className="text-yellow-400 text-lg" />
          <span className="text-yellow-400 text-xs font-bold">HIGH IMPACT</span>
        </div>
      )}

      {/* Header: Avatar, Username, Time, and Menu */}
      <div className="flex items-start justify-between">
        {/* Avatar and Username */}
        <Link
          to={`/profile/${post.user_id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-primary to-pink-500 flex-shrink-0"
            style={{
              backgroundImage: post.avatar_url ? `url(${post.avatar_url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!post.avatar_url && (post.author_email?.[0]?.toUpperCase() || "U")}
          </div>
          <div>
            <div className="font-semibold text-white">{post.author_email}</div>
            <div className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString()} · {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {post.updated_at && post.updated_at !== post.created_at && (
                <span className="text-gray-500 ml-1">
                  • Edited {new Date(post.updated_at).toLocaleDateString()} · {new Date(post.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* 3-Dot Menu (for owner only) */}
        {isOwner && !isEditing && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-dark rounded-lg transition-all text-gray-400 hover:text-white"
            >
              <EllipsisOutlined className="text-xl" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-dark-card border border-dark-border rounded-lg shadow-glow-lg overflow-hidden z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-dark transition-colors flex items-center gap-2"
                >
                  <EditOutlined className="text-base" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark transition-colors flex items-center gap-2"
                >
                  <DeleteOutlined className="text-base" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coin Tag & Sentiment Badge */}
      <div className="flex items-center gap-2">
        <Link
          to={`/coin/${coinId}`}
          className="px-3 py-1 bg-primary/20 hover:bg-primary/30 rounded-full text-primary text-sm font-semibold transition-all flex items-center gap-1"
        >
          <DollarOutlined className="text-base" /> {coin}
        </Link>
        <div
          className="px-3 py-1 rounded-full text-white text-sm font-semibold flex items-center gap-1"
          style={{ backgroundColor: currentSentiment.bg }}
        >
          {React.createElement(currentSentiment.icon, { className: "text-base" })} {sentiment}
        </div>
      </div>

      {/* Content or Edit Mode */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[80px] p-3 rounded-lg border border-primary/30 bg-dark text-white resize-vertical"
          />
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all flex items-center gap-2"
            >
              <SaveOutlined className="text-base" /> Save
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <CloseOutlined className="text-base" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-white leading-relaxed">{post.content}</p>

          {/* Post Image */}
          {post.image_url && (
            <div
              className="rounded-lg overflow-hidden border border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
              style={{ width: '100%', minHeight: '500px', maxHeight: '600px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={post.image_url}
                alt="Post image"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
        </>
      )}

      {/* Engagement Row */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-border">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 transition-all ${
              liked ? "text-primary" : "text-gray-400 hover:text-white"
            }`}
          >
            {liked ? <HeartFilled className="text-xl" /> : <HeartOutlined className="text-xl" />}
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={allowSocialInteractions ? toggleComments : undefined}
            disabled={!allowSocialInteractions}
            className={`flex items-center gap-2 transition-all ${
              allowSocialInteractions
                ? "text-gray-400 hover:text-white cursor-pointer"
                : "text-gray-600 cursor-not-allowed opacity-50"
            }`}
            title={allowSocialInteractions ? "View comments" : "Comments disabled by author"}
          >
            <CommentOutlined className="text-xl" />
            <span className="text-sm font-medium">{post.comments?.length ?? 0}</span>
          </button>

          {/* View Coin */}
          <button
            onClick={() => navigate(`/coin/${coinId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all"
            title={`View ${coin} details`}
          >
            <BarChartOutlined className="text-xl" />
            <span className="text-sm font-medium hidden sm:inline">View Coin</span>
          </button>

          {/* Follow Coin */}
          <button
            onClick={async () => {
              // TODO: Implement follow coin functionality
              showToast(`${coin} added to watchlist!`, "success");
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-all"
            title={`Add ${coin} to watchlist`}
          >
            <StarFilled className="text-xl" />
            <span className="text-sm font-medium hidden sm:inline">Follow</span>
          </button>
        </div>

        {/* Report Button */}
        {!isOwner && user && (
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            title="Report this post"
          >
            <WarningOutlined className="text-xl" />
          </button>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="post"
        contentId={post.id}
        reportedUserId={post.user_id}
      />

      {/* Inline Comments Section */}
      {showComments && allowSocialInteractions && (
        <div className="mt-4 pt-4 border-t border-dark-border space-y-4 animate-in slide-in-from-top">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <CommentOutlined className="text-lg" />
              Comments ({comments.length})
            </h4>
            <Link
              to={`/post/${post.id}`}
              className="text-primary hover:text-primary-dark text-sm font-medium transition-all flex items-center gap-1"
            >
              View Full Discussion <ArrowRightOutlined className="text-sm" />
            </Link>
          </div>

          {loadingComments ? (
            <div className="text-center py-4 text-gray-400">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {comments.slice(0, 3).map((comment: any) => (
                <div key={comment.id} className="bg-dark/50 rounded-lg p-3 border border-dark-border/50">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-primary to-pink-500 flex-shrink-0"
                      style={{
                        backgroundImage: comment.profiles?.avatar_url ? `url(${comment.profiles.avatar_url})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!comment.profiles?.avatar_url && (comment.profiles?.username?.[0]?.toUpperCase() || "U")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">
                          {comment.profiles?.username || "User"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length > 3 && (
                <Link
                  to={`/post/${post.id}`}
                  className="block text-center text-primary hover:text-primary-dark text-sm font-medium py-2 transition-all"
                >
                  View {comments.length - 3} more comments
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Image Modal */}
      {showImageModal && post.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-dark-card/80 hover:bg-dark-card text-white rounded-lg transition-all"
              title="Close"
            >
              <CloseOutlined className="text-2xl" />
            </button>
            <img
              src={post.image_url}
              alt="Post image"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
