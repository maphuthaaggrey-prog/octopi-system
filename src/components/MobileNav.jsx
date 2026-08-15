import React from "react";
import { NavLink } from "react-router-dom";
import { C } from "../theme";
import { useApp } from "../context/AppContext";
import { NAV_ITEMS } from "./Sidebar";

export default function MobileNav() {
  const { role } = useApp();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <nav className="flex sm:hidden gap-1 px-4 pt-3 overflow-x-auto border-b border-line">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap -mb-px border-b-2 ${isActive ? "mobile-nav-link-active" : "mobile-nav-link"}`}
          >
            <Icon size={14} /> {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
