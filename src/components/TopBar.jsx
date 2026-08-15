import React, { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { C, fontSerif, fontMono } from "../theme";
import { useApp } from "../context/AppContext";
import { CURRENT_USERS, ROLES } from "../data/mockData";
import logo from "../images/Primary-Logo.avif";

export default function TopBar({ title, subtitle, onMenuClick }) {
  const { role, setRole, user } = useApp();
  const [open, setOpen] = useState(false);

  const changeRole = (r) => {
    setRole(r);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-5 border-b border-line bg-paper">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-line text-muted">
          <Menu size={18} />
        </button>
        <div>
          <p className="text-xl leading-tight font-serif font-semibold">{title}</p>
          <p className="text-xs text-muted">{subtitle || `Welcome back, ${user.name.split(" ")[0]}.`}</p>
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-line bg-card"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs bg-tealSoft text-teal font-mono">
            {user.initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm leading-tight text-ink">{user.name}</p>
            <p className="text-[11px] leading-tight text-muted">{role}</p>
          </div>
          <ChevronDown size={14} className="text-muted" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border shadow-sm overflow-hidden z-10 border-line bg-card">
            <p className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-wider text-muted font-mono">Switch demo role</p>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => changeRole(r)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left btn-role ${role === r ? "btn-role-active" : "btn-role-inactive"}`}
              >
                {CURRENT_USERS[r].name}
                <span className={role === r ? "text-[11px] text-brass" : "text-[11px] text-muted"}>{r}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
