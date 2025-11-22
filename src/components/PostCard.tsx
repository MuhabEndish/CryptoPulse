import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase, checkIfUserBanned } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";
import ReportModal from "./ReportModal";

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

  async function toggleLike() {
    if (!user) return;

    // 🚫 التحقق من حظر المستخدم
    const banStatus = await checkIfUserBanned();
    if (banStatus.isBanned) {
      const message = banStatus.banType === 'permanent'
        ? `❌ تم حظرك نهائياً من المنصة.\n📋 السبب: ${banStatus.reason}`
        : `❌ تم حظرك مؤقتاً حتى ${new Date(banStatus.bannedUntil!).toLocaleDateString('ar-SA')}.\n📋 السبب: ${banStatus.reason}`;
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
    if (!window.confirm("Are you sure you want to delete this post?")) return;

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
      .update({ content: editContent })
      .eq("id", post.id);

    setIsEditing(false);
    showToast("Post updated successfully!", "success");
    await onChange(); // ✅ refresh list
  }

  function cancelEdit() {
    setEditContent(post.content);
    setIsEditing(false);
  }

  const isOwner = user?.id === post.user_id;

  return (
    <div
      style={{
        background: "var(--card)",
        padding: "18px",
        borderRadius: "12px",
        marginBottom: "12px",
        boxShadow: "0 0 10px rgba(139,92,246,0.2)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Avatar and Username */}
        <Link
          to={`/profile/${post.user_id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit"
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: post.avatar_url
                ? `url(${post.avatar_url})`
                : "linear-gradient(135deg, var(--accent), #ec4899)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            {!post.avatar_url && (post.author_email?.[0]?.toUpperCase() || "U")}
          </div>
          <div style={{ fontWeight: 600 }}>{post.author_email}</div>
        </Link>
        {isOwner && !isEditing && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: "var(--accent)",
                padding: "4px 12px",
                borderRadius: "6px",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Edit
            </button>
            <button
              onClick={deletePost}
              style={{
                background: "#ef4444",
                padding: "4px 12px",
                borderRadius: "6px",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={{ marginTop: "12px" }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: "var(--bg)",
              color: "white",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
            <button
              onClick={saveEdit}
              style={{
                background: "var(--accent)",
                padding: "6px 16px",
                borderRadius: "6px",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              style={{
                background: "#6b7280",
                padding: "6px 16px",
                borderRadius: "6px",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p style={{ marginTop: "8px" }}>{post.content}</p>

          {/* عرض الصورة المرفقة */}
          {post.image_url && (
            <div style={{
              marginTop: "12px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}>
              <img
                src={post.image_url}
                alt="Post image"
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  display: "block",
                  cursor: "pointer",
                }}
                onClick={() => window.open(post.image_url, '_blank')}
              />
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: "10px", display: "flex", gap: "15px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div
            onClick={toggleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              cursor: "pointer",
              color: liked ? "var(--accent)" : "gray",
            }}
          >
            <span style={{ fontSize: "20px" }}>♥</span>
            <span style={{ fontSize: "0.9rem" }}>{likesCount}</span>
          </div>

          <Link
            to={`/post/${post.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "gray",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "20px" }}>💬</span>
            <span style={{ fontSize: "0.9rem" }}>{post.comments?.length ?? 0}</span>
          </Link>
        </div>

        {/* زر الإبلاغ - Report Button */}
        {!isOwner && user && (
          <button
            onClick={() => setShowReportModal(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              fontSize: "18px",
              padding: "4px 8px",
              borderRadius: "6px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#aaa";
              e.currentTarget.style.background = "transparent";
            }}
            title="الإبلاغ عن هذا المنشور"
          >
            🚨
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
    </div>
  );
}
