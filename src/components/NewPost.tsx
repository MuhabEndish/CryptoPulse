import React, { useState } from "react";
import { supabase, uploadPostImage, checkIfUserBanned } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";
import { moderateContent, INAPPROPRIATE_CONTENT_MESSAGE } from "../utils/contentModeration";

export default function NewPost({ onPost }: { onPost: () => void }) {
  const user = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      showToast("الرجاء اختيار صورة فقط!", "error");
      return;
    }

    // التحقق من حجم الملف (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("حجم الصورة كبير جداً! الحد الأقصى 5 ميجابايت", "error");
      return;
    }

    // 🚫 التحقق من اسم الملف
    const moderation = moderateContent("", file.name);
    if (!moderation.isClean) {
      showToast(INAPPROPRIATE_CONTENT_MESSAGE, "error");
      return;
    }

    setSelectedImage(file);

    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  async function submitPost(e: any) {
    e.preventDefault();
    if (!content.trim() || !user) return;

    // 🚫 التحقق من حظر المستخدم
    const banStatus = await checkIfUserBanned();
    if (banStatus.isBanned) {
      const message = banStatus.banType === 'permanent'
        ? `❌ تم حظرك نهائياً من المنصة.\n📋 السبب: ${banStatus.reason}`
        : `❌ تم حظرك مؤقتاً حتى ${new Date(banStatus.bannedUntil!).toLocaleDateString('ar-SA')}.\n📋 السبب: ${banStatus.reason}`;
      showToast(message, "error");
      return;
    }

    // 🚫 فحص المحتوى قبل النشر
    const contentModeration = moderateContent(content, selectedImage?.name);
    if (!contentModeration.isClean) {
      showToast(INAPPROPRIATE_CONTENT_MESSAGE, "error");
      if (contentModeration.foundWords && contentModeration.foundWords.length > 0) {
        console.warn("كلمات محظورة تم اكتشافها:", contentModeration.foundWords);
      }
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;

      // رفع الصورة إذا كانت موجودة
      if (selectedImage) {
        imageUrl = await uploadPostImage(selectedImage, user.id);
      }

      // إنشاء المنشور
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content,
        image_url: imageUrl
      });

      if (error) throw error;

      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      showToast("تم نشر المنشور بنجاح!", "success");
      onPost();
    } catch (error: any) {
      console.error("Error creating post:", error);
      showToast(error.message || "فشل إنشاء المنشور. حاول مرة أخرى.", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={submitPost} style={{ marginBottom: "20px" }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        placeholder="What's happening?"
        style={{
          width: "100%",
          background: "var(--card)",
          color: "white",
          padding: "clamp(12px, 3vw, 16px)",
          borderRadius: "10px",
          resize: "none",
          minHeight: "clamp(70px, 15vw, 100px)",
          fontSize: "clamp(14px, 2.5vw, 16px)",
          lineHeight: "1.6",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          transition: "all 0.3s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(139, 92, 246, 0.6)";
          e.target.style.boxShadow = "0 0 10px rgba(139, 92, 246, 0.3)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(139, 92, 246, 0.2)";
          e.target.style.boxShadow = "none";
        }}
      />

      {/* معاينة الصورة */}
      {imagePreview && (
        <div style={{
          marginTop: "15px",
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
          border: "2px solid rgba(139, 92, 246, 0.3)",
        }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "300px",
              objectFit: "cover",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={removeImage}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "8px",
        fontSize: "clamp(12px, 2vw, 14px)",
        opacity: 0.7,
      }}>
        <span>{content.length}/280</span>

        {/* زر إضافة صورة */}
        <label
          htmlFor="post-image"
          style={{
            cursor: "pointer",
            padding: "6px 12px",
            background: "rgba(139, 92, 246, 0.2)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139, 92, 246, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
          }}
        >
          🖼️ صورة
        </label>
        <input
          id="post-image"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />
      </div>

      <button
        className="btn-touch"
        disabled={uploading}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "clamp(10px, 2.5vw, 14px)",
          background: uploading ? "#666" : "var(--accent)",
          borderRadius: "8px",
          color: "white",
          fontWeight: 600,
          fontSize: "clamp(14px, 2.5vw, 16px)",
          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
          transition: "all 0.3s ease",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.4)";
          }
        }}
      >
        {uploading ? "⏳ جاري النشر..." : "نشر"}
      </button>
    </form>
  );
}
