import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, uploadAvatar } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { AiOutlineFileText } from "react-icons/ai";
import { useToast } from "../components/ToastProvider";
import {
  AiOutlineCamera,
  AiOutlineClockCircle,
  AiOutlineEdit,
  AiOutlineSave,
  AiOutlineClose,
  AiOutlineLock
} from "react-icons/ai";

export default function Profile() {
  const { userId } = useParams();
  const currentUser = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    postsCount: 0,
    likesReceived: 0,
    commentsReceived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Determine if this is your own profile
  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  useEffect(() => {
    // If there's a userId in the URL, load profile directly
    if (userId) {
      loadProfile();

      // ✅ Real-time subscriptions
      const postsChannel = supabase
        .channel(`profile-posts-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "posts",
            filter: `user_id=eq.${userId}`,
          },
          () => loadProfile()
        )
        .subscribe();

      const likesChannel = supabase
        .channel(`profile-likes-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "likes",
          },
          () => loadProfile()
        )
        .subscribe();

      const commentsChannel = supabase
        .channel(`profile-comments-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "comments",
          },
          () => loadProfile()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(postsChannel);
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(commentsChannel);
      };
    }

    // If there’s no userId, wait until currentUser is loaded
    if (currentUser) {
      loadProfile();

      // ✅ Real-time subscriptions for current user
      const postsChannel = supabase
        .channel(`my-posts-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "posts",
            filter: `user_id=eq.${currentUser.id}`,
          },
          () => loadProfile()
        )
        .subscribe();

      const likesChannel = supabase
        .channel(`my-likes-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "likes",
          },
          () => loadProfile()
        )
        .subscribe();

      const commentsChannel = supabase
        .channel(`my-comments-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "comments",
          },
          () => loadProfile()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(postsChannel);
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(commentsChannel);
      };
    }
  }, [profileUserId, currentUser, userId]);

  // Redirect to auth if not logged in (after loading)
  useEffect(() => {
    if (currentUser === null && !userId) {
      // Only redirect if trying to view own profile and not authenticated
      navigate("/login");
    }
  }, [currentUser, userId, navigate]);

  async function loadProfile() {
    if (!profileUserId) return;

    setLoading(true);

    try {
      // Fetch user information
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileUserId)
        .maybeSingle();

      if (userError && userError.code !== "PGRST116") {
        console.error("Error loading profile:", userError);
      }

      // If no profile exists, use email from auth
      if (!userData) {
        const { data: authData } = await supabase.auth.getUser();
        setProfile({
          id: profileUserId,
          email: authData?.user?.email || "User",
          username: authData?.user?.email?.split("@")[0] || "User",
          bio: "",
          created_at: authData?.user?.created_at,
          privacy_settings: { isProfilePublic: true, showActivity: true, showWatchlist: false, allowSocialInteractions: true }
        });
      } else {
        setProfile(userData);
        setUsername(userData.username || "");
        setBio(userData.bio || "");

        // Check if profile is private and user is viewing someone else's profile
        if (!isOwnProfile) {
          const privacySettings = userData.privacy_settings || {};
          const isProfilePublic = privacySettings.isProfilePublic ?? true;

          if (!isProfilePublic) {
            setProfile({ ...userData, isPrivate: true });
            setLoading(false);
            return;
          }
        }
      }

      // Fetch user posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          likes(id, user_id),
          comments(id),
          profiles(username, avatar_url, privacy_settings)
        `)
        .eq("user_id", profileUserId)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error loading posts:", postsError);
      } else {
        // Filter posts based on showActivity setting if viewing someone else's profile
        let filteredPosts = postsData || [];
        if (!isOwnProfile && userData) {
          const privacySettings = userData.privacy_settings || {};
          const showActivity = privacySettings.showActivity ?? true;
          if (!showActivity) {
            filteredPosts = [];
          }
        }

        const postsWithAuthor = filteredPosts.map((post) => ({
          ...post,
          author_email: post.profiles?.username || userData?.username || "User",
          avatar_url: post.profiles?.avatar_url || userData?.avatar_url || null,
        }));
        setPosts(postsWithAuthor);

        // Calculate statistics
        const postsCount = postsData?.length || 0;
        const likesReceived = postsData?.reduce(
          (sum, post) => sum + (post.likes?.length || 0),
          0
        ) || 0;
        const commentsReceived = postsData?.reduce(
          (sum, post) => sum + (post.comments?.length || 0),
          0
        ) || 0;

        setStats({ postsCount, likesReceived, commentsReceived });
      }
    } catch (error) {
      console.error("Error in loadProfile:", error);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Verify file type
    if (!file.type.startsWith('image/')) {
      showToast("Please select an image only!", "error");
      return;
    }

    // Verify file size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size is too large! Maximum 2 MB", "error");
      return;
    }

    // 🚫 Verify filename
    const { moderateContent, INAPPROPRIATE_CONTENT_MESSAGE } = await import("../utils/contentModeration");
    const moderation = moderateContent("", file.name);
    if (!moderation.isClean) {
      showToast(INAPPROPRIATE_CONTENT_MESSAGE, "error");
      return;
    }

    setUploadingAvatar(true);

    try {
      const avatarUrl = await uploadAvatar(file, currentUser.id);

      if (avatarUrl) {
        // Update database
        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentUser.id);

        if (error) throw error;

        showToast("Profile picture updated successfully!", "success");
        loadProfile();
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      showToast(error.message || "Failed to upload image. Try again.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveProfile() {
    if (!currentUser) return;

    try {
      // Use UPDATE instead of UPSERT to avoid NOT NULL constraint issues
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
      loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("Failed to update profile", "error");
    }
  }

  // Show loading while checking auth or loading profile
  if (currentUser === undefined || loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" message="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
        <p className="text-gray-400 mb-4">Profile not found</p>
        <button
          onClick={() => navigate("/feed")}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingBottom: "80px",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Two-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 350px) 1fr",
          gap: "40px",
          alignItems: "start",
        }}
        className="profile-layout"
      >
        {/* Check if profile is private */}
        {profile?.isPrivate ? (
          <div className="col-span-2" style={{ gridColumn: "1 / -1" }}>
            <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
              <AiOutlineLock className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">This Profile is Private</h3>
              <p className="text-gray-400">This user has chosen to keep their profile private.</p>
            </div>
          </div>
        ) : (
          <>
        <div
          style={{
            position: "sticky",
            top: "80px",
            alignSelf: "start",
            height: "calc(100vh - 80px)",
          }}
        >
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "32px 24px",
            }}
          >
            {/* Avatar */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: profile.avatar_url
                    ? `url(${profile.avatar_url}) center/cover`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  fontWeight: "700",
                  color: "white",
                  boxShadow: "0 8px 20px rgba(139, 92, 246, 0.4)",
                  margin: "0 auto",
                }}
              >
                {!profile.avatar_url && (profile.username || profile.email || "U")[0].toUpperCase()}
              </div>

              {/* Change picture button (for own profile only) */}
              {isOwnProfile && (
                <label
                  htmlFor="avatar-upload"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "calc(50% - 60px)",
                    background: "var(--accent)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: uploadingAvatar ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    transition: "all 0.3s ease",
                    opacity: uploadingAvatar ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingAvatar) {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {uploadingAvatar ? (
                    <AiOutlineClockCircle style={{ fontSize: "20px", color: "white" }} className="animate-spin" />
                  ) : (
                    <AiOutlineCamera style={{ fontSize: "20px", color: "white" }} />
                  )}
                </label>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                style={{ display: "none" }}
              />
            </div>

            {/* Username & Email */}
            <h2
              style={{
                margin: "10px 0",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
            >
              {profile.username || profile.email?.split("@")[0] || "User"}
            </h2>
            <p
              style={{
                opacity: 0.6,
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {profile.email}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p
                style={{
                  fontSize: "14px",
                  opacity: 0.8,
                  marginBottom: "20px",
                  lineHeight: "1.5",
                  fontStyle: "italic",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* Stats - Compact Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginBottom: "24px",
                padding: "20px 0",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "var(--accent)",
                  }}
                >
                  {stats.postsCount}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginTop: "4px",
                  }}
                >
                  Posts
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#10b981",
                  }}
                >
                  {stats.likesReceived}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginTop: "4px",
                  }}
                >
                  Likes
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#f59e0b",
                  }}
                >
                  {stats.commentsReceived}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginTop: "4px",
                  }}
                >
                  Comments
                </div>
              </div>
            </div>

            {/* Join Date */}
            <p
              style={{
                fontSize: "13px",
                opacity: 0.5,
                marginBottom: "24px",
              }}
            >
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>

            {/* Primary Actions - Full Width Buttons */}
            {isOwnProfile && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  className="btn-touch"
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    background: "var(--accent)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                >
                  <AiOutlineEdit /> Edit Profile
                </button>
                <button
                  className="btn-touch"
                  onClick={() => navigate("/privacy-security")}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    background: "#6366f1",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                >
                  <AiOutlineLock /> Privacy & Security
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT PANEL: Content Feed ========== */}
        <div>
          {/* Edit Profile Form */}
          {isEditing && isOwnProfile && (
            <div className="card" style={{ marginBottom: "24px" }}>
              <h3 style={{ marginBottom: "20px", fontSize: "1.25rem", fontWeight: "600" }}>Edit Profile</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Username */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "var(--card)",
                      color: "white",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "8px",
                      fontSize: "15px",
                    }}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Bio
                  </label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={150}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "var(--card)",
                      color: "white",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "8px",
                      fontSize: "15px",
                      minHeight: "100px",
                      resize: "vertical",
                    }}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "12px",
                      opacity: 0.6,
                      marginTop: "5px",
                    }}
                  >
                    {bio.length}/150
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn-touch"
                    onClick={saveProfile}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#10b981",
                      borderRadius: "8px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <AiOutlineSave /> Save
                  </button>
                  <button
                    className="btn-touch"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(profile.username || "");
                      setBio(profile.bio || "");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#6b7280",
                      borderRadius: "8px",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <AiOutlineClose /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User's Posts Section */}
          <div>
            <h3
              style={{
                marginBottom: "20px",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
            >
              {isOwnProfile ? "Your Posts" : "Posts"}
            </h3>

            {posts.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "60px 40px",
                }}
              >
                <AiOutlineFileText style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }} className="mx-auto" />
                <p style={{ fontSize: "16px", opacity: 0.6, marginBottom: "8px" }}>No posts yet</p>
                {isOwnProfile && (
                  <>
                    <p style={{ fontSize: "14px", opacity: 0.5, marginBottom: "20px" }}>
                      Share your thoughts with the community
                    </p>
                    <button
                      className="btn-touch"
                      onClick={() => navigate("/feed")}
                      style={{
                        padding: "12px 24px",
                        background: "var(--accent)",
                        borderRadius: "8px",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "15px",
                      }}
                    >
                      Create your first post
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onChange={loadProfile} />
                ))}
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
