import React, { useState } from "react";
import { Search, ChevronRight, Check } from "lucide-react";
import { C, STAGES, fontSerif, fontMono } from "../theme";
import { SectionTitle, Stamp, Protected } from "../components/ui";
import { useApp } from "../context/AppContext";

const STAGE_CLASSES = {
  onboarding: { current: "stage-onboarding-current", reached: "stage-onboarding-reached" },
  active: { current: "stage-active-current", reached: "stage-active-reached" },
  review: { current: "stage-review-current", reached: "stage-review-reached" },
  leave: { current: "stage-leave-current", reached: "stage-leave-reached" },
  offboarding: { current: "stage-offboarding-current", reached: "stage-offboarding-reached" },
};

const STAGE_TEXT_COLORS = {
  leave: "text-brass",
  review: "text-brass",
  active: "text-teal",
  offboarding: "text-rust",
  onboarding: "text-slate",
};

function EmployeeDetail({ emp, onClose }) {
  const timeline = ["onboarding", "active", "review", "leave", "offboarding"];
  return (
    <div className="rounded-xl border p-5 card card-border">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm bg-brassSoft text-brass font-mono">{emp.initials}</div>
          <div>
            <p className="text-lg font-serif font-semibold">{emp.name}</p>
            <p className="text-xs text-muted">{emp.title} · {emp.dept}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-xs px-2 py-1 rounded border border-line text-muted">Close</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-3 text-brass font-mono">Employment details</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Employee ID</span>
              <span className="font-mono">{emp.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Position</span>
              <span>{emp.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Department</span>
              <span>{emp.dept}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Start date</span>
              <span className="font-mono">{emp.start}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Status</span>
              <Stamp meta={STAGES[emp.stage] || { label: emp.stage || "Unknown", variant: "active" }} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider mb-3 text-brass font-mono">Contact</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Email</span>
              <span className="truncate ml-4">{emp.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Phone</span>
              <span className="font-mono">{emp.phone}</span>
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-wider mt-6 mb-3 text-brass font-mono">Leave balances</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Annual</span>
              <span className="font-mono">{emp.leaveBalances?.annual ?? 0} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Sick</span>
              <span className="font-mono">{emp.leaveBalances?.sick ?? 0} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Family responsibility</span>
              <span className="font-mono">{emp.leaveBalances?.family ?? 0} days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-wider mb-3 text-brass font-mono">Lifecycle</p>
        <div className="flex items-center">
          {timeline.map((t, i) => {
            const reached = timeline.indexOf(emp.stage) >= i || (emp.stage === "leave" && t === "review");
            const isCurrent = t === emp.stage;
            const stageClass = STAGE_CLASSES[t]?.[isCurrent ? "current" : "reached"] || "";
            const textColorClass = STAGE_TEXT_COLORS[t] || "text-slate";
            return (
              <React.Fragment key={t}>
                <div className="flex flex-col items-center min-w-74">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${isCurrent ? 'stage-current' : 'stage-reached'} ${stageClass}`}>
                    {reached && !isCurrent ? <Check size={14} className={textColorClass} /> : <span className={`text-[11px] font-mono ${isCurrent ? textColorClass : 'text-muted'}`}>{i + 1}</span>}
                  </div>
                  <span className="text-[10px] mt-1 text-center text-muted">{STAGES[t].label}</span>
                </div>
                {i < timeline.length - 1 && <div className="flex-1 h-px" style={{ background: C.line }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="rounded-lg border p-3 card card-border">
          <div className="review-score">
            <p className="text-[10px] uppercase tracking-wider text-muted font-mono">Last review score</p>
            <p className="text-lg font-serif font-semibold text-ink mt-1">{emp.score}/100</p>
          </div>

        </div>
      </div>
    </div>
  );
}

function EmployeesList() {
  const { employees } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

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

  const filtered = employees.filter((e) => {
    const matchesQuery = e.name.toLowerCase().includes(query.toLowerCase()) || e.dept.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || e.stage === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <>


      <div className="space-y-4">
        <div className="head">
          <SectionTitle eyebrow="Personnel Index" title="Employee lifecycle" />
        </div>

        {selected && <EmployeeDetail emp={selected} onClose={() => setSelected(null)} />}

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border">
            <Search size={15} color={C.inkSoft} />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or department"
              className="bg-transparent outline-none text-sm w-full text-ink"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {["all", ...Object.keys(STAGES)].map((k) => (
              <button
                key={k} onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-full text-xs border ${filter === k ? 'bg-brassSoft text-brass border-brass' : 'bg-transparent text-muted border-line'}`}
              >
                {k === "all" ? "All" : STAGES[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden card card-border">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
                <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Employee</span></th>
                <th className="text-left px-4 py-2.5 hidden sm:table-cell"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">ID</span></th>
                <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Status</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id} className={i > 0 ? "border-top-line" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0 bg-tealSoft text-teal font-mono">{e.initials}</div>
                      <div className="min-w-0">
                        <p className="text-sm truncate text-ink">{highlightText(e.name, query)}</p>
                        <p className="text-xs truncate text-muted">{highlightText(`${e.title} · ${e.dept}`, query)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted hidden sm:table-cell">{e.id}</td>
                  <td className="px-4 py-3"><Stamp meta={STAGES[e.stage] || { label: e.stage || "Unknown", variant: "active" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-sm text-center py-8 text-muted">No records match.</p>}
        </div>

      </div>
    </>
  );
}

export default function Employees() {
  return (
    <Protected allow={["Admin", "HR Manager"]}>
      <EmployeesList />
    </Protected>
  );
}
