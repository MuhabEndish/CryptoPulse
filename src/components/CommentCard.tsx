import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastProvider";
import ReportModal from "./ReportModal";
import ConfirmModal from "./ConfirmModal";
import {
  AiOutlineEdit as EditOutlined,
  AiOutlineDelete as DeleteOutlined,
  AiOutlineWarning as WarningOutlined,
  AiOutlineEllipsis as EllipsisOutlined
} from 'react-icons/ai';

type CommentCardProps = {
  comment: any;
  onDelete: () => void;
};

export default function CommentCard({ comment, onDelete }: CommentCardProps) {
  const user = useAuth();
  const { showToast } = useToast();
  const isOwner = user?.id === comment.user_id;
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  async function handleDelete() {
    const { error } = await supabase.from("comments").delete().eq("id", comment.id);
    if (!error) {
      showToast("Comment deleted successfully!", "success");
      onDelete();
    } else {
      showToast("Failed to delete comment. Please try again.", "error");
    }
  }

  async function handleEdit() {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from("comments")
      .update({
        content: editContent,
        updated_at: new Date().toISOString()
      })
      .eq("id", comment.id);

    if (!error) {
      comment.content = editContent;
      comment.updated_at = new Date().toISOString();
      setIsEditing(false);
    }
  }

  function handleCancelEdit() {
    setEditContent(comment.content);
    setIsEditing(false);
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <Link
          to={`/profile/${comment.user_id}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-primary to-pink-500 flex-shrink-0"
            style={{
              backgroundImage: comment.avatar_url ? `url(${comment.avatar_url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!comment.avatar_url && (comment.author_email?.[0]?.toUpperCase() || "U")}
          </div>
          <div className="text-sm font-semibold text-white opacity-90">
            {comment.author_email}
          </div>
        </Link>

        {/* 3-Dot Menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-dark rounded-lg transition-all text-gray-400 hover:text-white"
            >
              <EllipsisOutlined className="text-lg" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-dark-card border border-dark-border rounded-lg shadow-glow-lg overflow-hidden z-10">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditing(true);
                      }}
                      className="w-full px-4 py-2 text-left text-blue-400 hover:bg-dark transition-colors flex items-center gap-2"
                    >
                      <EditOutlined className="text-base" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark transition-colors flex items-center gap-2"
                    >
                      <DeleteOutlined className="text-base" /> Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowReportModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-dark transition-colors flex items-center gap-2"
                  >
                    <WarningOutlined className="text-base" /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-dark border border-dark-border rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-dark rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={!editContent.trim()}
              className="px-4 py-1.5 text-sm bg-primary hover:bg-primary/80 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white text-sm leading-relaxed mb-2">
          {comment.content}
        </p>
      )}

      <div className="text-xs text-gray-500">
        {new Date(comment.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {comment.updated_at && comment.updated_at !== comment.created_at && (
          <span className="text-gray-400 ml-2">
            • Edited {new Date(comment.updated_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="comment"
        contentId={comment.id}
        reportedUserId={comment.user_id}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
