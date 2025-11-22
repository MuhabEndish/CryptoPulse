import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "./Navbar";
import NewComment from "./NewComment";
import CommentCard from "./CommentCard";
import LoadingSpinner from "./LoadingSpinner";
import { useToast } from "./ToastProvider";

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  async function loadPost() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const postData = {
          ...data,
          author_email: data.profiles?.username || "Unknown User",
          avatar_url: data.profiles?.avatar_url || null,
        };
        setPost(postData);
        setEditContent(data.content);
        await loadLikes();
      }
    } catch (error) {
      console.error("Error loading post:", error);
      showToast("Post not found", "error");
      navigate("/feed");
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    if (!id) return;

    // جلب قائمة المستخدمين المحظورين
    const { data: bannedUsers } = await supabase
      .from('banned_users')
      .select('user_id');

    const bannedUserIds = bannedUsers?.map(b => b.user_id) || [];

    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    // فلترة التعليقات من المستخدمين المحظورين
    const filteredData = (data || []).filter((comment: any) =>
      !bannedUserIds.includes(comment.user_id)
    );

    setComments(
      filteredData.map((comment: any) => ({
        ...comment,
        author_email: comment.profiles?.username || "Unknown User",
        avatar_url: comment.profiles?.avatar_url || null,
      }))
    );
  }

  async function loadLikes() {
    if (!id) return;

    // Get total likes count
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", id);

    setLikesCount(count || 0);

    // Check if current user liked
    if (user) {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      setLiked(!!data);
    }
  }

  async function toggleLike() {
    if (!user || !id) return;

    if (liked) {
      await supabase.from("likes").delete().match({
        post_id: id,
        user_id: user.id,
      });
    } else {
      await supabase.from("likes").insert({
        post_id: id,
        user_id: user.id,
      });
    }

    await loadLikes();
  }

  async function deletePost() {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    await supabase.from("posts").delete().eq("id", id);
    showToast("Post deleted successfully!", "success");
    navigate("/feed");
  }

  async function saveEdit() {
    if (!editContent.trim()) {
      showToast("Post content cannot be empty!", "error");
      return;
    }

    await supabase
      .from("posts")
      .update({ content: editContent })
      .eq("id", id);

    setIsEditing(false);
    showToast("Post updated successfully!", "success");
    await loadPost();
  }

  function cancelEdit() {
    setEditContent(post.content);
    setIsEditing(false);
  }

  useEffect(() => {
    loadPost();
    loadComments();

    // ✅ Real-time subscription للتعليقات
    const commentsChannel = supabase
      .channel(`comments-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time comment change:", payload);
          loadComments();
        }
      )
      .subscribe();

    // ✅ Real-time subscription للإعجابات
    const likesChannel = supabase
      .channel(`likes-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `post_id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time like change:", payload);
          loadLikes();
        }
      )
      .subscribe();

    // ✅ Real-time subscription للمنشور نفسه (للتعديلات)
    const postChannel = supabase
      .channel(`post-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time post update:", payload);
          loadPost();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(postChannel);
    };
  }, [id]);

  useEffect(() => {
    if (post) {
      loadLikes();
    }
  }, [user, post]);

  if (!user) {
    return (
      <div className="container">
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          <a href="/auth" style={{ color: "var(--accent)" }}>
            Login to continue
          </a>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <Navbar />
        <LoadingSpinner size="medium" message="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          Post not found
        </p>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <div className="container">
      <Navbar />

      {/* Back Button */}
      <button
        onClick={() => navigate("/feed")}
        style={{
          background: "var(--card)",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          color: "white",
          cursor: "pointer",
          marginBottom: "20px",
          fontSize: "0.9rem",
        }}
      >
        ← Back to Feed
      </button>

      {/* Post Card */}
      <div
        style={{
          background: "var(--card)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "25px",
          boxShadow: "0 0 15px rgba(139,92,246,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "1rem" }}>
            {post.author_email}
          </div>
          {isOwner && !isEditing && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: "var(--accent)",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Edit Post
              </button>
              <button
                onClick={deletePost}
                style={{
                  background: "#ef4444",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Delete Post
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div style={{ marginBottom: "15px" }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                background: "var(--bg)",
                color: "white",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
                lineHeight: "1.6",
              }}
            />
            <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
              <button
                onClick={saveEdit}
                style={{
                  background: "var(--accent)",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Save Changes
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  background: "#6b7280",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "15px" }}>
            {post.content}
          </p>
        )}

        <div style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "15px" }}>
          {new Date(post.created_at).toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Like and Comment Count */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <div
            onClick={toggleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            <span style={{ color: liked ? "var(--accent)" : "gray" }}>♥</span>
            <span style={{ fontSize: "0.9rem" }}>{likesCount}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "1.1rem",
              color: "gray",
            }}
          >
            <span>💬</span>
            <span style={{ fontSize: "0.9rem" }}>{comments.length}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <h3 style={{ marginBottom: "15px", fontSize: "1.2rem" }}>
          Comments ({comments.length})
        </h3>

        <NewComment postId={id!} onCommentAdded={loadComments} />

        {comments.length === 0 && (
          <p style={{ textAlign: "center", opacity: 0.6, marginTop: "20px" }}>
            No comments yet. Be the first to comment!
          </p>
        )}

        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onDelete={loadComments}
          />
        ))}
      </div>
    </div>
  );
}
