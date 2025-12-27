import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, uploadAvatar } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastProvider";

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
      navigate("/auth");
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
        });
      } else {
        setProfile(userData);
        setUsername(userData.username || "");
        setBio(userData.bio || "");
      }

      // Fetch user posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          likes(id, user_id),
          comments(id),
          profiles(username, avatar_url)
        `)
        .eq("user_id", profileUserId)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error loading posts:", postsError);
      } else {
        const postsWithAuthor = (postsData || []).map((post) => ({
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
          .upsert({
            id: currentUser.id,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          });

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
    <div className="space-y-6">
      {/* Profile Header */}
      <div
        className="card"
        style={{
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        {/* Avatar */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
          <div
            style={{
              width: "clamp(80px, 15vw, 120px)",
              height: "clamp(80px, 15vw, 120px)",
              borderRadius: "50%",
              background: profile.avatar_url
                ? `url(${profile.avatar_url}) center/cover`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(2rem, 6vw, 3rem)",
              fontWeight: "700",
              color: "white",
              boxShadow: "0 8px 20px rgba(139, 92, 246, 0.4)",
              position: "relative",
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
                right: "0",
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
              {uploadingAvatar ? "⏳" : "📷"}
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
        {!isEditing ? (
          <>
            <h2
              style={{
                margin: "10px 0",
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
              }}
            >
              {profile.username || profile.email?.split("@")[0] || "User"}
            </h2>
            <p
              style={{
                opacity: 0.6,
                fontSize: "clamp(13px, 2.5vw, 15px)",
                marginBottom: "10px",
              }}
            >
              {profile.email}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  background: "rgba(139, 92, 246, 0.1)",
                  borderRadius: "8px",
                  fontSize: "clamp(13px, 2.5vw, 15px)",
                  lineHeight: "1.6",
                }}
              >
                {profile.bio}
              </p>
            )}
          </>
        ) : (
          <div style={{ marginTop: "20px" }}>
            {/* Edit Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                background: "var(--card)",
                color: "white",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "8px",
                fontSize: "clamp(14px, 2.5vw, 16px)",
              }}
            />

            {/* Edit Bio */}
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                background: "var(--card)",
                color: "white",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "8px",
                fontSize: "clamp(13px, 2.5vw, 15px)",
                minHeight: "80px",
                resize: "vertical",
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: "clamp(12px, 2vw, 13px)",
                opacity: 0.6,
                marginBottom: "15px",
              }}
            >
              {bio.length}/150
            </div>
          </div>
        )}

        {/* Stats */}
        <div
          className="flex-responsive"
          style={{
            marginTop: "20px",
            justifyContent: "center",
            gap: "clamp(15px, 4vw, 30px)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
                color: "var(--accent)",
              }}
            >
              {stats.postsCount}
            </div>
            <div
              style={{
                fontSize: "clamp(12px, 2vw, 14px)",
                opacity: 0.7,
              }}
            >
              Posts
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
                color: "#10b981",
              }}
            >
              {stats.likesReceived}
            </div>
            <div
              style={{
                fontSize: "clamp(12px, 2vw, 14px)",
                opacity: 0.7,
              }}
            >
              Likes
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
                color: "#f59e0b",
              }}
            >
              {stats.commentsReceived}
            </div>
            <div
              style={{
                fontSize: "clamp(12px, 2vw, 14px)",
                opacity: 0.7,
              }}
            >
              Comments
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {isOwnProfile && (
          <div
            className="flex-responsive"
            style={{
              marginTop: "20px",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {!isEditing ? (
              <button
                className="btn-touch"
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 30px)",
                  background: "var(--accent)",
                  borderRadius: "8px",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "clamp(14px, 2.5vw, 15px)",
                }}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button
                  className="btn-touch"
                  onClick={saveProfile}
                  style={{
                    padding: "clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 30px)",
                    background: "#10b981",
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "clamp(14px, 2.5vw, 15px)",
                  }}
                >
                  💾 Save
                </button>
                <button
                  className="btn-touch"
                  onClick={() => {
                    setIsEditing(false);
                    setUsername(profile.username || "");
                    setBio(profile.bio || "");
                  }}
                  style={{
                    padding: "clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 30px)",
                    background: "#6b7280",
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "clamp(14px, 2.5vw, 15px)",
                  }}
                >
                  ✕ Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* Join Date */}
        <p
          style={{
            marginTop: "20px",
            fontSize: "clamp(12px, 2vw, 13px)",
            opacity: 0.5,
          }}
        >
          Joined {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* User's Posts */}
      <div style={{ marginTop: "30px" }}>
        <h3
          style={{
            marginBottom: "20px",
            fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
          }}
        >
          {isOwnProfile ? "Your Posts" : "Posts"}
        </h3>

        {posts.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "40px",
              opacity: 0.6,
            }}
          >
            <p>No posts yet</p>
            {isOwnProfile && (
              <button
                onClick={() => navigate("/feed")}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  background: "var(--accent)",
                  borderRadius: "8px",
                  color: "white",
                }}
              >
                Create your first post
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onChange={loadProfile} />
          ))
        )}
      </div>
    </div>
  );
}
