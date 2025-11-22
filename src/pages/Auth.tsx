import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setErrorMsg("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return setErrorMsg(error.message);
      return navigate("/");
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return setErrorMsg(error.message);
    return navigate("/");
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "15px",
              borderRadius: "8px",
              background: "var(--card)",
              color: "white",
            }}
            placeholder="Email"
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              borderRadius: "8px",
              background: "var(--card)",
              color: "white",
            }}
            placeholder="Password"
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMsg && (
            <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
              {errorMsg}
            </p>
          )}

          <button
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              background: "var(--accent)",
              borderRadius: "8px",
              color: "white",
              fontWeight: "600",
            }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
            cursor: "pointer",
            opacity: 0.8,
          }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Need an account?" : "Already have an account?"}
        </p>
      </div>
    </div>
  );
}
