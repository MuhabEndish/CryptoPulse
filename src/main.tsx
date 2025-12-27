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
import Alerts from "./pages/Alerts";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminManagement from "./pages/admin/AdminManagement";
import { ToastProvider } from "./components/ToastProvider";
import Layout from "./components/Layout";
import AlertMonitor from "./components/AlertMonitor";


function App() {
  return (
    <ToastProvider>
      <AlertMonitor>
        <BrowserRouter>
        <Routes>
          {/* Auth routes without Layout */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Main app routes with Layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
          <Route path="/coin/:id" element={<Layout><CoinDetail /></Layout>} />
          <Route path="/feed" element={<Layout><Feed /></Layout>} />
          <Route path="/post/:id" element={<Layout><PostView /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/profile/:userId" element={<Layout><Profile /></Layout>} />
          <Route path="/search" element={<Layout><Search /></Layout>} />
          <Route path="/alerts" element={<Layout><Alerts /></Layout>} />

          {/* Admin routes without Layout (they have their own layout) */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/management" element={<AdminManagement />} />
        </Routes>
      </BrowserRouter>
      </AlertMonitor>
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
