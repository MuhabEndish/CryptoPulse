import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import ReportModal from "./ReportModal";

type CommentCardProps = {
  comment: any;
  onDelete: () => void;
};

export default function CommentCard({ comment, onDelete }: CommentCardProps) {
  const user = useAuth();
  const isOwner = user?.id === comment.user_id;
  const [showReportModal, setShowReportModal] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    await supabase.from("comments").delete().eq("id", comment.id);
    onDelete();
  }

  return (
    <div
      style={{
        background: "var(--card)",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "10px",
        border: "1px solid rgba(139, 92, 246, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <Link
          to={`/profile/${comment.user_id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: comment.avatar_url
                ? `url(${comment.avatar_url})`
                : "linear-gradient(135deg, var(--accent), #ec4899)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            {!comment.avatar_url && (comment.author_email?.[0]?.toUpperCase() || "U")}
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9 }}>
            {comment.author_email}
          </div>
        </Link>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isOwner && (
            <button
              onClick={handleDelete}
              style={{
                background: "transparent",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "0.85rem",
                padding: "4px 8px",
              }}
            >
              Delete
            </button>
          )}

          {/* زر الإبلاغ - Report Button */}
          {!isOwner && user && (
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#aaa",
                cursor: "pointer",
                fontSize: "14px",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#aaa";
                e.currentTarget.style.background = "transparent";
              }}
              title="الإبلاغ عن هذا التعليق"
            >
              🚨
            </button>
          )}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.95 }}>
        {comment.content}
      </p>

      <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "6px" }}>
        {new Date(comment.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="comment"
        contentId={comment.id}
        reportedUserId={comment.user_id}
      />
    </div>
  );
}
