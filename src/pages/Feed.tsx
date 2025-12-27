import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewPost from "../components/NewPost";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";

export default function Feed() {
  const navigate = useNavigate();
  const user = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        profiles(username, avatar_url)
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
    const filteredData = data.filter((post: any) =>
      !bannedUserIds.includes(post.user_id)
    );

    setPosts(
      filteredData.map((post: any) => ({
        ...post,
        author_email: post.profiles?.username || "User",
        avatar_url: post.profiles?.avatar_url || null,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0,
      }))
    );
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

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="medium" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    navigate('/auth')
    window.location.href = "/auth";
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Social Feed</h1>
        <p className="text-gray-400">Share your thoughts and insights about crypto</p>
      </div>

      <NewPost onPost={loadPosts} />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" message="Loading posts..." />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <p className="text-gray-400">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onChange={loadPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
