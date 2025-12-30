import React, { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main className="w-full px-4 md:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
