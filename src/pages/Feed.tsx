import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import NewPost from "../components/NewPost";
import PostCard from "../components/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";

export default function Feed() {
  const user = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    setLoading(true);

    // جلب قائمة المستخدمين المحظورين
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

    // التأكد من أن البيانات موجودة قبل المعالجة
    if (!data || data.length === 0) {
      console.log("No posts found");
      setPosts([]);
      setLoading(false);
      return;
    }

    // فلترة المنشورات من المستخدمين المحظورين
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
    loadPosts();

    // ✅ Real-time subscription للمنشورات
    const postsChannel = supabase
      .channel("posts-channel")
      .on(
        "postgres_changes",
        {
          event: "*", // الاستماع لكل التغييرات (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("Real-time post change:", payload);
          // إعادة تحميل المنشورات عند أي تغيير
          loadPosts();
        }
      )
      .subscribe();

    // ✅ Real-time subscription للإعجابات
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

    // ✅ Real-time subscription للتعليقات
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

    // تنظيف الاشتراكات عند مغادرة الصفحة
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  if (!user) return <a href="/auth">Login to continue</a>;

  return (
    <div className="container">
      <Navbar />
      <NewPost onPost={loadPosts} />
      {loading ? (
        <LoadingSpinner size="medium" message="Loading posts..." />
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
          <p>No posts yet. Be the first to post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onChange={loadPosts} />
        ))
      )}
    </div>
  );
}
