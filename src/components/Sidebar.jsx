import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Users, ClipboardCheck, CalendarClock, Wallet, TrendingUp, ShieldCheck, CalendarX, CalendarDays,
} from "lucide-react";
import { C, fontMono, fontSerif } from "../theme";
import { useApp } from "../context/AppContext";
import logo from "../images/Primary-Logo.avif"

export const NAV_ITEMS = [
  { path: "/", label: "Home", icon: LayoutGrid, roles: ["Admin", "HR Manager", "Employee"], end: true },
  { path: "/employees", label: "Employees", icon: Users, roles: ["Admin", "HR Manager"] },
  { path: "/attendance", label: "Attendance", icon: ClipboardCheck, roles: ["Admin", "HR Manager", "Employee"] },
  { path: "/leave", label: "Leave", icon: CalendarClock, roles: ["Admin", "HR Manager", "Employee"] },
  { path: "/payslips", label: "Payslips", icon: Wallet, roles: ["Admin", "HR Manager", "Employee"] },
  { path: "/performance", label: "Performance", icon: TrendingUp, roles: ["Admin", "HR Manager", "Employee"] },
  { path: "/absenteeism", label: "Absenteeism", icon: CalendarX, roles: ["Admin", "HR Manager", "Employee"] },
  { path: "/access-control", label: "Access Control", icon: ShieldCheck, roles: ["Admin"] },
];

export default function Sidebar({ open, onClose }) {
  const { role } = useApp();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={onClose} />
      )}
      <aside className={`
                        fixed top-0 left-0 h-screen w-60 border-r border-line bg-card z-30 flex flex-col
                        transition-transform duration-200
                        ${open ? 'translate-x-0' : '-translate-x-full'}
                        md:sticky md:top-0 md:h-screen md:z-30 md:flex md:flex-col md:w-60 md:translate-x-0 md:transition-none
                      `}>
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div>
              <img src={logo} alt="Company Logo" className="h-6" />
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto sidebar">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "sidebar-link-active" : "sidebar-link"}`}
              >
                <Icon size={16} /> {item.label}
              </NavLink>
            );
          })}
        </nav>


      </aside>
    </>
  );
}
