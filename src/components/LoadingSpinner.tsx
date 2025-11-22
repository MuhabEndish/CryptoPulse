import React from "react";

type LoadingSpinnerProps = {
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
  message?: string;
};

export default function LoadingSpinner({
  size = "medium",
  fullScreen = false,
  message = "",
}: LoadingSpinnerProps) {
  const sizes = {
    small: "24px",
    medium: "40px",
    large: "60px",
  };

  const spinnerSize = sizes[size];

  const spinner = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        className="spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: "4px solid rgba(139, 92, 246, 0.2)",
          borderTop: "4px solid var(--accent)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {message && (
        <p
          style={{
            color: "var(--accent)",
            fontSize: "0.9rem",
            opacity: 0.8,
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(17, 24, 39, 0.9)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {spinner}
    </div>
  );
}
