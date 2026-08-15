import React from "react";
import { ArrowUpRight, Lock } from "lucide-react";
import { C, fontMono, fontSerif } from "../theme";
import { useApp } from "../context/AppContext";

export function Stamp({ meta }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] tracking-wide uppercase whitespace-nowrap stamp ${meta.variant}`}>
      <span className="w-1.5 h-1.5 rounded-full stamp-dot" />
      {meta.label}
    </span>
  );
}

export function KPI({ label, value, sub, accentClass }) {
  return (
    <div className="rounded-xl p-5 border bg-card border-line">
      <p className="text-[11px] uppercase tracking-wider text-muted font-mono">{label}</p>
      <p className="mt-2 text-3xl font-serif font-semibold text-ink">{value}</p>
      {sub && (
        <p className={`mt-1 text-xs flex items-center gap-1 ${accentClass || "text-teal"}`}>
          <ArrowUpRight size={13} /> {sub}
        </p>
      )}
    </div>
  );
}

export function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-brass font-mono">{eyebrow}</p>
      <h1 className="text-xl font-serif font-semibold text-ink">{title}</h1>
    </div>
  );
}

export function AccessDenied({ role }) {
  return (
    <div className="rounded-xl border p-8 text-center bg-card border-line">
      <Lock size={22} className="mx-auto mb-3 text-muted" />
      <p className="text-lg font-serif font-semibold">Access restricted</p>
      <p className="text-sm mt-1 text-muted">
        The {role} role doesn't have permission to view this page.
      </p>
    </div>
  );
}

export function Protected({ allow, children }) {
  const { role } = useApp();
  if (!allow.includes(role)) return <AccessDenied role={role} />;
  return children;
}
