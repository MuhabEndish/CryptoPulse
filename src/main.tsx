import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import CoinDetail from "./pages/CoinDetail";
import Feed from "./pages/Feed";
import PostView from "./components/PostView";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminManagement from "./pages/admin/AdminManagement";
import { ToastProvider } from "./components/ToastProvider";


function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/coin/:id" element={<CoinDetail />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/post/:id" element={<PostView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/management" element={<AdminManagement />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
