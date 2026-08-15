import React, { useState } from "react";
import { Check, X, Lock, Search } from "lucide-react";
import { C, fontMono } from "../theme";
import { SectionTitle, Protected } from "../components/ui";
import { useApp } from "../context/AppContext";
import { ROLES, PERMISSIONS } from "../data/mockData";

function Matrix() {
  const { role } = useApp();
  const [search, setSearch] = useState("");

  function highlightText(text, q) {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-tealSoft text-ink rounded-sm px-0.5">{part}</mark>
        : part
    );
  }

  const filtered = PERMISSIONS.filter((p) => {
    const q = search.toLowerCase();
    return p.label.toLowerCase().includes(q);
  });
  return (
    <div className="space-y-4">
      <div className="head">
        <SectionTitle eyebrow="Security Ledger" title="Role-based access control" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border mb-4">
        <Search size={15} color={C.inkSoft} />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permissions"
          className="bg-transparent outline-none text-sm w-full text-ink"
        />
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.line, background: C.card }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
              <th className="text-left font-normal px-4 py-2.5" style={{ color: C.paper }}>Permission</th>
              {ROLES.map((r) => (
                <th key={r} className="px-4 py-2.5 font-normal text-left" style={{ color: C.paper }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.label} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                <td className="px-4 py-3">{highlightText(p.label, search)}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-4 py-3 text-left">
                    {p.grants[r]
                      ? <Check size={16} color={C.teal} className="inline" />
                      : <X size={16} color={C.rust} className="inline opacity-50" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs flex items-center gap-1.5" style={{ color: C.inkSoft }}>
        <Lock size={12} /> Viewing as {role}. Only Admin accounts can reassign roles or edit this matrix.
      </p>
    </div>
  );
}

export default function AccessControl() {
  return (
    <Protected allow={["Admin"]}>
      <Matrix />
    </Protected>
  );
}
