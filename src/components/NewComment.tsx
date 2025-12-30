import React, { useState } from "react";
import { supabase, checkIfUserBanned } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";
import { moderateContent, INAPPROPRIATE_CONTENT_MESSAGE } from "../utils/contentModeration";

type NewCommentProps = {
  postId: string;
  onCommentAdded: () => void;
};

export default function NewComment({ postId, onCommentAdded }: NewCommentProps) {
  const user = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !user || isSubmitting) return;

    // 🚫 Check if user is banned
    const banStatus = await checkIfUserBanned();
    if (banStatus.isBanned) {
      const message = banStatus.banType === 'permanent'
        ? `❌ You have been permanently banned from the platform.\n📋 Reason: ${banStatus.reason}`
        : `❌ You have been temporarily banned until ${new Date(banStatus.bannedUntil!).toLocaleDateString('en-US')}.\n📋 Reason: ${banStatus.reason}`;
      showToast(message, "error");
      return;
    }

    // 🚫 فحص المحتوى قبل الإرسال
    const moderation = moderateContent(content.trim());
    if (!moderation.isClean) {
      showToast(INAPPROPRIATE_CONTENT_MESSAGE, "error");
      if (moderation.foundWords && moderation.foundWords.length > 0) {
        console.warn("كلمات محظورة تم اكتشافها:", moderation.foundWords);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;

      setContent("");
      showToast("Comment added successfully!", "success");
      onCommentAdded();
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Failed to add comment. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        maxLength={500}
        disabled={isSubmitting}
        style={{
          width: "100%",
          background: "var(--card)",
          color: "white",
          padding: "12px",
          borderRadius: "8px",
          resize: "none",
          minHeight: "60px",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          opacity: isSubmitting ? 0.6 : 1,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
          {content.length}/500
        </span>

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          style={{
            padding: "8px 20px",
            background: content.trim() && !isSubmitting ? "var(--accent)" : "#555",
            borderRadius: "6px",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: content.trim() && !isSubmitting ? "pointer" : "not-allowed",
            opacity: content.trim() && !isSubmitting ? 1 : 0.5,
          }}
        >
          {isSubmitting ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  );
}
