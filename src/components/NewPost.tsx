import React, { useState } from "react";
import { supabase, uploadPostImage, checkIfUserBanned } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";
import { moderateContent, INAPPROPRIATE_CONTENT_MESSAGE } from "../utils/contentModeration";
import {
  AiOutlineRise,
  AiOutlineFall,
  AiOutlineMinus,
  AiOutlineBarChart,
  AiOutlineClockCircle,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlineFileText
} from "react-icons/ai";
import { BiCoin, BiImageAlt } from "react-icons/bi";

export default function NewPost({ onPost }: { onPost: () => void }) {
  const user = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<string>("BTC");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("Neutral");

  const coins = ["BTC", "ETH", "SOL", "BNB", "ADA", "DOT", "MATIC", "AVAX"];
  const sentiments = [
    { value: "Bullish", icon: AiOutlineRise, color: "#10b981" },
    { value: "Bearish", icon: AiOutlineFall, color: "#ef4444" },
    { value: "Neutral", icon: AiOutlineMinus, color: "#6b7280" }
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast("Please select an image only!", "error");
      return;
    }

    // Check file size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image is too large! Maximum 5 MB", "error");
      return;
    }

    // 🚫 Check filename
    const moderation = moderateContent("", file.name);
    if (!moderation.isClean) {
      showToast(INAPPROPRIATE_CONTENT_MESSAGE, "error");
      return;
    }

    setSelectedImage(file);

    // Create image preview
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

    // Check if user is banned
    const banStatus = await checkIfUserBanned();
    if (banStatus.isBanned) {
      const message = banStatus.banType === 'permanent'
        ? `You are permanently banned from the platform.\nReason: ${banStatus.reason}`
        : `You are temporarily banned until ${new Date(banStatus.bannedUntil!).toLocaleDateString()}.\nReason: ${banStatus.reason}`;
      showToast(message, "error");
      return;
    }

    // 🚫 Check content before posting
    const contentModeration = moderateContent(content, selectedImage?.name);
    if (!contentModeration.isClean) {
      showToast(INAPPROPRIATE_CONTENT_MESSAGE, "error");
      if (contentModeration.foundWords && contentModeration.foundWords.length > 0) {
        console.warn("Blocked words detected:", contentModeration.foundWords);
      }
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;

      // Upload image if exists
      if (selectedImage) {
        imageUrl = await uploadPostImage(selectedImage, user.id);
      }

      // Create post
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content,
        image_url: imageUrl,
        coin: selectedCoin,
        sentiment: selectedSentiment
      });

      if (error) throw error;

      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedCoin("BTC");
      setSelectedSentiment("Neutral");
      showToast("Post published successfully!", "success");
      onPost();
    } catch (error: any) {
      console.error("Error creating post:", error);
      showToast(error.message || "فشل إنشاء المنشور. حاول مرة أخرى.", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={submitPost} className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-4">
      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        placeholder="What's happening in crypto?"
        className="w-full bg-dark text-white p-4 rounded-lg resize-none min-h-[100px] border border-dark-border focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all"
      />

      {/* Coin Selector & Sentiment Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Coin Selector */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <BiCoin className="text-lg" /> Coin:
          </span>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-dark text-white px-3 py-1.5 rounded-lg border border-dark-border focus:border-primary focus:outline-none cursor-pointer"
          >
            {coins.map((coin) => (
              <option key={coin} value={coin}>{coin}</option>
            ))}
          </select>
        </div>

        {/* Sentiment Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <AiOutlineBarChart className="text-lg" /> Sentiment:
          </span>
          <div className="flex gap-2">
            {sentiments.map((sentiment) => {
              const IconComponent = sentiment.icon;
              return (
                <button
                  key={sentiment.value}
                  type="button"
                  onClick={() => setSelectedSentiment(sentiment.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedSentiment === sentiment.value
                      ? "ring-2 ring-offset-2 ring-offset-dark-card"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: selectedSentiment === sentiment.value ? sentiment.color : `${sentiment.color}33`,
                    color: "white",
                    ringColor: sentiment.color
                  }}
                >
                  <IconComponent className="text-base" /> {sentiment.value}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* معاينة الصورة */}
      {imagePreview && (
        <div className="relative rounded-lg overflow-hidden border-2 border-primary/30">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-h-[300px] object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/70 hover:bg-red-500/90 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
          >
            ×
          </button>
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Image Button */}
          <label
            htmlFor="post-image"
            className="cursor-pointer px-3 py-1.5 bg-primary/20 hover:bg-primary/30 rounded-lg flex items-center gap-2 transition-all text-sm"
          >
            <BiImageAlt className="text-lg" /> Image
          </label>
          <input
            id="post-image"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Character Count */}
          <span className="text-xs text-gray-400">{content.length}/280</span>
        </div>

        {/* Post Button */}
        <button
          type="submit"
          disabled={uploading || !content.trim()}
          className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-glow flex items-center gap-2"
        >
          {uploading ? (
            <>
              <AiOutlineClockCircle className="text-lg animate-spin" /> Publishing...
            </>
          ) : (
            <>
              <AiOutlineSend className="text-lg" /> Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
