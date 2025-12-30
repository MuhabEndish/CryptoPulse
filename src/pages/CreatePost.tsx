import React from "react";
import { useNavigate } from "react-router-dom";
import NewPost from "../components/NewPost";
import { useAuth } from "../hooks/useAuth";
import { AiOutlineArrowLeft } from "react-icons/ai";

import { AiOutlineBulb } from "react-icons/ai";

export default function CreatePost() {
  const navigate = useNavigate();
  const user = useAuth();

  // Redirect if not authenticated
  if (user === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePostCreated = () => {
    // Navigate back to feed after post is created
    navigate('/feed');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
        >
          <AiOutlineArrowLeft className="text-xl" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Create Post</h1>
        <p className="text-gray-400">Share your crypto insights with the community</p>
      </div>

      {/* Post Composer */}
      <NewPost onPost={handlePostCreated} />

      {/* Tips Section */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-3">
        <h3 className="text-white font-bold flex items-center gap-2">
          <AiOutlineBulb />
          Tips for Great Posts
        </h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Choose the right coin to help others find your insights</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Express your sentiment (Bullish/Bearish/Neutral) clearly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Add images to make your post more engaging</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Be respectful and follow community guidelines</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
