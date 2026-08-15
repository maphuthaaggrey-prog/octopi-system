import React, { useState } from "react";
import { C, fontMono, fontSerif } from "../theme";
import { SectionTitle } from "../components/ui";
import { useApp } from "../context/AppContext";
import { findEmployee, employees } from "../data/mockData";
import { Search } from "lucide-react";

export default function Performance() {
  const { role, currentEmployee, reviews } = useApp();
  const [search, setSearch] = useState("");
  const list = role === "Employee" ? reviews.filter((r) => r.employeeId === currentEmployee?.id) : reviews;

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

  const filtered = list.filter((r) => {
    const emp = findEmployee(r.employeeId);
    const q = search.toLowerCase();
    return emp && (emp.name.toLowerCase().includes(q) || emp.dept.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <div className="head">
        <SectionTitle eyebrow="Technical Review Cycle · H1 2026" title="Performance tracking" />
      </div>

      {role !== "Employee" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border">
          <Search size={15} color={C.inkSoft} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or department"
            className="bg-transparent outline-none text-sm w-full text-ink"
          />
        </div>
      )}

      {list.length === 0 && <p className="text-sm text-muted">No review on record for this cycle yet.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((r) => {
          const emp = findEmployee(r.employeeId);
          const progressClass = `progress-${Math.round(r.progress / 5) * 5}`;
          const progressColor = r.progress > 75 ? "bg-teal" : r.progress > 50 ? "bg-brass" : "bg-rust";
          return (
            <div key={r.employeeId} className="rounded-xl border p-5 bg-card border-line">
              <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif font-semibold">{highlightText(emp?.name || "", search)}</p>
                    <p className="text-xs text-muted">{highlightText(`${emp?.title || ""} · ${emp?.dept || ""}`, search)}</p>
                  </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brassSoft text-brass font-mono">{r.score}/100</span>
              </div>
              <p className="text-xs mt-1 text-muted">{r.cycle}</p>
              <p className="text-sm mt-4">{r.goal}</p>
              <div className="h-1.5 rounded-full mt-2 bg-line progress-bar">
                <div className={`h-1.5 rounded-full progress-fill ${progressClass} ${progressColor}`} />
              </div>
              <p className="text-[11px] mt-1 text-right text-muted">{r.progress}% to goal</p>

              <div className="mt-4 pt-4 border-top-line">
                <p className="text-[11px] uppercase tracking-wider text-muted font-mono mb-2">Technical competencies</p>
                <div className="space-y-2">
                  {emp?.skills?.map((skill) => {
                    const skillColor = skill.level > 75 ? "bg-teal" : skill.level > 50 ? "bg-brass" : "bg-rust";
                    return (
                      <div key={skill.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted">{skill.name}</span>
                          <span className="font-mono">{skill.level}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-line progress-bar">
                          <div className={`h-1 rounded-full progress-fill progress-${Math.round(skill.level / 5) * 5} ${skillColor}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
