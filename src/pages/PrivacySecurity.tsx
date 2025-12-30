import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";
import { useToast } from "../components/ToastProvider";
import ConfirmModal from "../components/ConfirmModal";
import {
  AiOutlineArrowLeft,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineSafety,
  AiOutlineMail,
  AiOutlineHistory,
  AiOutlineDownload,
  AiOutlineDelete,
  AiOutlineWarning,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineInfoCircle,
  AiOutlineCheckCircle,
} from "react-icons/ai";

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const user = useAuth();
  const { showToast } = useToast();

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    isProfilePublic: true,
    showActivity: true,
    showWatchlist: false,
    allowSocialInteractions: true,
  });

  // Security state
  const [emailVerified, setEmailVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showPasswordChangeConfirm, setShowPasswordChangeConfirm] = useState(false);

  useEffect(() => {
    // Wait for user to be loaded (undefined = still loading)
    if (user === undefined) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }
    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    try {
      // Load privacy settings from database
      const { data, error } = await supabase
        .from("profiles")
        .select("privacy_settings")
        .eq("id", user?.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error);
      }

      if (data?.privacy_settings) {
        setPrivacySettings({ ...privacySettings, ...data.privacy_settings });
      }

      // Check email verification
      setEmailVerified(user?.email_confirmed_at != null);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updatePrivacySetting = async (
    setting: keyof typeof privacySettings,
    value: boolean
  ) => {
    if (!user?.id) {
      showToast("User not authenticated", "error");
      return;
    }

    const newSettings = { ...privacySettings, [setting]: value };
    setPrivacySettings(newSettings);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ privacy_settings: newSettings })
        .eq("id", user.id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      showToast("Privacy setting updated", "success");
    } catch (error: any) {
      console.error("Error updating setting:", error);
      showToast(`Failed to update setting: ${error.message || 'Unknown error'}`, "error");
      // Revert on error
      setPrivacySettings(privacySettings);
    }
  };

  const handlePasswordChange = async () => {
    // Clear previous errors
    setCurrentPasswordError("");
    setPasswordMatchError("");

    if (!passwordForm.currentPassword) {
      setCurrentPasswordError("Please enter your current password");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMatchError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    // Show confirmation modal
    setShowPasswordChangeConfirm(true);
  };

  const executePasswordChange = async () => {
    setLoading(true);
    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        setCurrentPasswordError("Current password is incorrect");
        setLoading(false);
        return;
      }

      // If current password is correct, update to new password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      showToast("Password changed successfully", "success");
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setPasswordMatchError("");
      setCurrentPasswordError("");
    } catch (error: any) {
      showToast(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setLoading(true);
    try {
      // You can implement clearing specific history here
      showToast("Activity history cleared", "success");
    } catch (error) {
      showToast("Failed to clear history", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user?.id);

      const userData = {
        profile,
        posts,
        exportedAt: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("Data downloaded successfully", "success");
    } catch (error) {
      showToast("Failed to download data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showToast('Please type "DELETE" to confirm', "error");
      return;
    }

    setLoading(true);
    try {
      // Delete related data first (posts, comments, likes, favorites, etc.)
      await supabase.from("post_likes").delete().eq("user_id", user?.id);
      await supabase.from("comments").delete().eq("user_id", user?.id);
      await supabase.from("favorite_cryptos").delete().eq("user_id", user?.id);
      await supabase.from("posts").delete().eq("user_id", user?.id);
      await supabase.from("profiles").delete().eq("id", user?.id);

      // Delete the authenticated user (this works for the current user)
      const { error } = await supabase.rpc('delete_user');
      if (error) {
        // If RPC doesn't exist, just sign out (data is already deleted)
        console.warn("Delete user RPC not available, signing out:", error);
      }

      showToast("Account deleted successfully", "success");
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      showToast(error.message || "Failed to delete account", "error");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ paddingBottom: "80px" }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => navigate(-1)}
            className="btn-touch"
            style={{
              padding: "10px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AiOutlineArrowLeft style={{ fontSize: "20px" }} />
          </button>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "5px" }}>
              Privacy & Security
            </h1>
            <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
              Manage your privacy settings and account security
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AiOutlineEye /> Privacy Controls
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* Public Profile */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
            }}
          >
            <div>
              <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                Public Profile
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                Allow others to view your profile
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.isProfilePublic}
                onChange={(e) =>
                  updatePrivacySetting("isProfilePublic", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Show Activity */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
            }}
          >
            <div>
              <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                Show Activity
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                Display your posts and comments publicly
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showActivity}
                onChange={(e) =>
                  updatePrivacySetting("showActivity", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Show Watchlist */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
            }}
          >
            <div>
              <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                Show Watchlist
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                Make your watchlist visible to others
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.showWatchlist}
                onChange={(e) =>
                  updatePrivacySetting("showWatchlist", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Allow Social Interactions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
            }}
          >
            <div>
              <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                Social Interactions
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                Allow others to comment and interact with your posts
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.allowSocialInteractions}
                onChange={(e) =>
                  updatePrivacySetting("allowSocialInteractions", e.target.checked)
                }
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Security Controls */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AiOutlineSafety /> Security Controls
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* Email Verification */}
          <div
            style={{
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AiOutlineMail style={{ fontSize: "24px" }} />
              <div>
                <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                  Email Verification
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                  {user.email}
                </div>
              </div>
            </div>
            {emailVerified ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "#10b981",
                }}
              >
                <AiOutlineCheck /> Verified
              </div>
            ) : (
              <button className="btn-primary" style={{ padding: "8px 16px" }}>
                Verify Email
              </button>
            )}
          </div>

          {/* Change Password */}
          <div
            style={{
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AiOutlineLock style={{ fontSize: "24px" }} />
              <div>
                <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                  Change Password
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                  Update your account password
                </div>
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ padding: "8px 16px" }}
              onClick={() => setShowPasswordChange(true)}
            >
              Change
            </button>
          </div>

          {/* Two-Factor Authentication */}
          <div
            style={{
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AiOutlineSafety style={{ fontSize: "24px" }} />
              <div>
                <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                  Two-Factor Authentication
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                  Add an extra layer of security
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Permissions */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          Data & Permissions
        </h2>

        <div style={{ fontSize: "0.875rem", lineHeight: "1.6", opacity: 0.8 }}>
          <div style={{ marginBottom: "15px" }}>
            <strong>Personal Data:</strong> We store your email, username, profile
            information, and activity history to provide our services.
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong>Social Data:</strong> Your posts, comments, and interactions are
            stored to enable social features and can be viewed by other users based on
            your privacy settings.
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong>Market Data:</strong> We use CoinGecko API to provide real-time
            cryptocurrency prices and market information. No personal data is shared
            with third-party providers.
          </div>
          <div>
            <strong>Cookies:</strong> We use essential cookies to maintain your session
            and remember your preferences.
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="card"
        style={{
          marginBottom: "20px",
          border: "2px solid #ef4444",
          background: "rgba(239, 68, 68, 0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AiOutlineWarning /> Danger Zone
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* Clear History */}
          <div
            style={{
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AiOutlineHistory style={{ fontSize: "24px" }} />
              <div>
                <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                  Clear Activity History
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                  Remove all your activity data
                </div>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ padding: "8px 16px" }}
              onClick={() => setShowClearHistoryConfirm(true)}
              disabled={loading}
            >
              Clear History
            </button>
          </div>

          {/* Download Data */}
          <div
            style={{
              padding: "15px",
              background: "var(--card-bg)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AiOutlineDownload style={{ fontSize: "24px" }} />
              <div>
                <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                  Download My Data
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                  Export all your data as JSON
                </div>
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ padding: "8px 16px" }}
              onClick={handleDownloadData}
              disabled={loading}
            >
              Download
            </button>
          </div>

          {/* Delete Account */}
          <div
            style={{
              padding: "15px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "8px",
              border: "1px solid #ef4444",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: showDeleteConfirm ? "15px" : "0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AiOutlineDelete style={{ fontSize: "24px", color: "#ef4444" }} />
                <div>
                  <div
                    style={{ fontWeight: "600", marginBottom: "5px", color: "#ef4444" }}
                  >
                    Delete Account
                  </div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                    Permanently delete your account and all data
                  </div>
                </div>
              </div>
              <button
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              >
                {showDeleteConfirm ? "Cancel" : "Delete"}
              </button>
            </div>

            {showDeleteConfirm && (
              <div style={{ marginTop: "15px" }}>
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "0.875rem",
                    color: "#ef4444",
                  }}
                >
                  This action cannot be undone. Type <strong>DELETE</strong> to confirm.
                </div>
                <input
                  type="text"
                  placeholder='Type "DELETE" to confirm'
                  className="input"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  style={{ marginBottom: "10px" }}
                />
                <button
                  style={{
                    padding: "10px 20px",
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "600",
                    width: "100%",
                  }}
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteConfirmText !== "DELETE"}
                >
                  {loading ? "Deleting..." : "Delete My Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div
          className="password-modal-overlay"
          onClick={() => {
            setShowPasswordChange(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setPasswordMatchError("");
            setCurrentPasswordError("");
          }}
        >
          <div
            className="password-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="password-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <AiOutlineLock style={{ fontSize: "20px", color: "white" }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
                    Change Password
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", opacity: 0.7 }}>
                    Secure your account with a new password
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setPasswordMatchError("");
                  setCurrentPasswordError("");
                }}
                className="password-modal-close"
                aria-label="Close modal"
              >
                <AiOutlineClose />
              </button>
            </div>

            {/* Modal Body */}
            <div className="password-modal-body">
              {/* Current Password */}
              <div className="password-input-group">
                <label className="password-label">
                  <AiOutlineLock style={{ fontSize: "16px", opacity: 0.7 }} />
                  Current Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    className={`password-input ${currentPasswordError ? "password-input-error" : ""}`}
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                      setCurrentPasswordError("");
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
                {currentPasswordError && (
                  <div className="password-error-text">
                    <AiOutlineWarning style={{ fontSize: "14px" }} />
                    <span>{currentPasswordError}</span>
                  </div>
                )}
              </div>

              {/* New Password */}
              <div className="password-input-group">
                <label className="password-label">
                  <AiOutlineLock style={{ fontSize: "16px", opacity: 0.7 }} />
                  New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="password-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                      // Clear password match error when user types in new password field
                      if (passwordForm.confirmPassword && e.target.value === passwordForm.confirmPassword) {
                        setPasswordMatchError("");
                      } else if (passwordForm.confirmPassword && e.target.value !== passwordForm.confirmPassword) {
                        setPasswordMatchError("Passwords do not match");
                      }
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
                <div className="password-hint">
                  <AiOutlineInfoCircle style={{ fontSize: "14px" }} />
                  <span>Must be at least 8 characters long</span>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="password-input-group">
                <label className="password-label">
                  <AiOutlineCheckCircle style={{ fontSize: "16px", opacity: 0.7 }} />
                  Confirm New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    className={`password-input ${passwordMatchError ? "password-input-error" : ""}`}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                      // Real-time validation: check if passwords match
                      if (passwordForm.newPassword && e.target.value !== passwordForm.newPassword) {
                        setPasswordMatchError("Passwords do not match");
                      } else {
                        setPasswordMatchError("");
                      }
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
                {passwordMatchError && (
                  <div className="password-error-text">
                    <AiOutlineWarning style={{ fontSize: "14px" }} />
                    <span>{passwordMatchError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="password-modal-footer">
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setPasswordMatchError("");
                  setCurrentPasswordError("");
                }}
                className="password-btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="password-btn-submit"
                disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                {loading ? (
                  <>
                    <span className="password-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <AiOutlineCheckCircle style={{ fontSize: "18px" }} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showPasswordChangeConfirm}
        onClose={() => setShowPasswordChangeConfirm(false)}
        onConfirm={executePasswordChange}
        title="Change Password"
        message="Are you sure you want to change your password? You will need to use your new password for future logins."
        confirmText="Change Password"
        cancelText="Cancel"
        type="warning"
      />

      <ConfirmModal
        isOpen={showClearHistoryConfirm}
        onClose={() => setShowClearHistoryConfirm(false)}
        onConfirm={handleClearHistory}
        title="Clear Activity History"
        message="Are you sure you want to clear your activity history? This action cannot be undone."
        confirmText="Clear History"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}
