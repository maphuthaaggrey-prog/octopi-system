import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { C } from "../theme";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import TopBar from "../components/TopBar";
import { NAV_ITEMS } from "../components/Sidebar";

export default function Layout() {
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find((i) => (i.end ? pathname === i.path : pathname.startsWith(i.path))) || NAV_ITEMS[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-paper text-ink font-sans">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <TopBar title={current.label} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="px-4 sm:px-8 py-6 max-w-5xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
