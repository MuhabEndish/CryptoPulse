import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  function linkStyle(active: boolean) {
    return {
      padding: "clamp(8px, 2vw, 10px) clamp(14px, 3vw, 18px)",
      borderRadius: "8px",
      background: active ? "var(--accent)" : "var(--card)",
      color: "white",
      textDecoration: "none",
      fontWeight: 600,
      fontSize: "clamp(13px, 2.5vw, 15px)",
      transition: "all 0.3s ease",
      boxShadow: active ? "0 4px 12px rgba(139, 92, 246, 0.4)" : "none",
    };
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile/");

  return (
    <div
      style={{
        margin: "20px auto",
        maxWidth: "1200px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        padding: "0 clamp(10px, 3vw, 20px)",
      }}
    >
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 ابحث عن منشورات، مستخدمين، أو عملات رقمية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)",
              paddingLeft: "40px",
              borderRadius: "12px",
              border: "2px solid var(--card)",
              background: "var(--card)",
              color: "white",
              fontSize: "clamp(13px, 2.5vw, 15px)",
              outline: "none",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--card)";
              e.target.style.boxShadow = "none";
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
        </div>
        <button
          type="submit"
          style={{
            padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)",
            borderRadius: "12px",
            border: "none",
            background: "var(--accent)",
            color: "white",
            fontSize: "clamp(13px, 2.5vw, 15px)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(139, 92, 246, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.4)";
          }}
        >
          بحث
        </button>
      </form>

      {/* Navigation Links */}
      <div
        className="flex-responsive"
        style={{
          justifyContent: "center",
          gap: "clamp(8px, 2vw, 12px)",
        }}
      >
        <Link to="/" style={linkStyle(pathname === "/")}>🏠 Home</Link>
        <Link to="/favorites" style={linkStyle(pathname === "/favorites")}>⭐ Favorites</Link>
        <Link to="/feed" style={linkStyle(pathname === "/feed")}>💬 Feed</Link>
        <Link to="/profile" style={linkStyle(isProfileActive)}>👤 Profile</Link>
      </div>
    </div>
  );
}
