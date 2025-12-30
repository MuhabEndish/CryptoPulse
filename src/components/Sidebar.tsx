import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineMessage,
  AiOutlineStar,
  AiOutlineSearch,
  AiOutlineSetting,
  AiOutlineMenu
} from 'react-icons/ai';
import { SiBitcoin } from 'react-icons/si';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { pathname } = useLocation();

  const navItems = [
    { icon: <AiOutlineDashboard />, label: "Dashboard", path: "/" },
    { icon: <AiOutlineMessage />, label: "Social", path: "/feed" },
    { icon: <AiOutlineStar />, label: "Watchlist", path: "/favorites" },
    { icon: <AiOutlineSearch />, label: "Search", path: "/search" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-dark-card border-r border-dark-border transition-all duration-300 z-40 hidden md:flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <SiBitcoin className="text-2xl text-orange-500" />
              <span className="font-bold text-lg text-white">CryptoTracker</span>
            </div>
          )}
          {isCollapsed && <SiBitcoin className="text-2xl mx-auto text-orange-500" />}


        </div>
{/* Collapse Button for Desktop */}
  <div className="p-4 border-t border-dark-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-start gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <AiOutlineMenu className="text-lg" /> : <AiOutlineSetting className="text-lg" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 mb-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? "bg-primary text-white shadow-glow"
                  : "text-gray-400 hover:bg-dark-card hover:text-white"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse Button for Desktop */}
        {/* <div className="p-4 border-t border-dark-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-lg">{isCollapsed ? <AiOutlineMenu /> : <AiOutlineSetting />}</span>
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div> */}
      </aside>

      {/* Mobile Bottom Navigation */}
      {/* <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-50 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive(item.path)
                  ? "text-primary"
                  : "text-gray-400"
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav> */}
    </>
  );
}
