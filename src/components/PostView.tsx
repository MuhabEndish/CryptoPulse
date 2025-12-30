import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import NewComment from "./NewComment";
import CommentCard from "./CommentCard";
import LoadingSpinner from "./LoadingSpinner";
import { useToast } from "./ToastProvider";
import ConfirmModal from "./ConfirmModal";
import {
  AiOutlineEdit as EditOutlined,
  AiOutlineDelete as DeleteOutlined,
  AiOutlineMessage as MessageOutlined,
  AiFillHeart as HeartFilled,
  AiOutlineHeart as HeartOutlined,
  AiOutlineEllipsis as EllipsisOutlined,
  AiOutlineArrowLeft as ArrowLeftOutlined
} from 'react-icons/ai';
import { BiComment as CommentOutlined } from 'react-icons/bi';

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
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function loadPost() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles(username, avatar_url, privacy_settings)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const privacySettings = data.profiles?.privacy_settings || {};
        const allowSocialInteractions = privacySettings.allowSocialInteractions ?? true;

        const postData = {
          ...data,
          author_email: data.profiles?.username || "Unknown User",
          avatar_url: data.profiles?.avatar_url || null,
          allowSocialInteractions,
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
      .update({
        content: editContent,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    setIsEditing(false);
    showToast("Post updated successfully!", "success");
    await loadPost();
  }

  function cancelEdit() {
    setEditContent(post.content);
    setIsEditing(false);
  }

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
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          <a href="/login" style={{ color: "var(--accent)" }}>
            Login to continue
          </a>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner size="medium" message="Loading post..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          Post not found
        </p>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <div className="container">
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
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <ArrowLeftOutlined /> Back to Feed
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                background: post.avatar_url ? `url(${post.avatar_url})` : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                flexShrink: 0,
              }}
            >
              {!post.avatar_url && (post.author_email?.[0]?.toUpperCase() || "U")}
            </div>
            <div style={{ fontWeight: 600, fontSize: "1rem" }}>
              {post.author_email}
            </div>
          </div>
          {isOwner && !isEditing && (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                <EllipsisOutlined style={{ fontSize: '1.2rem' }} />
              </button>
              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "8px",
                    width: "140px",
                    background: "var(--card)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                    overflow: "hidden",
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      color: "#60a5fa",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <EditOutlined style={{ fontSize: '1rem' }} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <DeleteOutlined style={{ fontSize: '1rem' }} /> Delete
                  </button>
                </div>
              )}
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
          <>
            <p style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "15px" }}>
              {post.content}
            </p>

            {/* Post Image */}
            {post.image_url && (
              <div
                style={{
                  width: '100%',
                  height: '400px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'var(--bg)',
                  cursor: 'pointer',
                  marginBottom: '15px'
                }}
                onClick={() => window.open(post.image_url, '_blank')}
              >
                <img
                  src={post.image_url}
                  alt="Post image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}
          </>
        )}

        <div style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "15px" }}>
          {new Date(post.created_at).toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {post.updated_at && post.updated_at !== post.created_at && (
            <span style={{ color: "#9ca3af", marginLeft: "8px" }}>
              • Edited {new Date(post.updated_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
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
            {liked ?
              <HeartFilled style={{ color: "var(--accent)", fontSize: '1.1rem' }} /> :
              <HeartOutlined style={{ color: "gray", fontSize: '1.1rem' }} />
            }
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
            <CommentOutlined style={{ fontSize: '1.1rem' }} />
            <span style={{ fontSize: "0.9rem" }}>{comments.length}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <h3 style={{ marginBottom: "15px", fontSize: "1.2rem" }}>
          Comments ({comments.length})
        </h3>

        {post?.allowSocialInteractions === false ? (
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
            <CommentOutlined className="text-4xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Comments have been disabled for this post by the author.</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

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
    </div>
  );
}
