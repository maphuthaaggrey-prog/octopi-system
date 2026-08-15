import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { C, ATTENDANCE_STATUS } from "../theme";
import { SectionTitle, Stamp } from "../components/ui";
import { useApp } from "../context/AppContext";
import { attendanceHistory } from "../data/mockData";

const PERIODS = [
  { key: "7d", label: "Week" },
  { key: "31d", label: "31 days" },
  { key: "6m", label: "6 months" },
  { key: "1y", label: "Year" },
];

const getCutoffDate = (period) => {
  const today = new Date("2026-08-11");
  const cutoff = new Date(today);
  switch (period) {
    case "7d":
      cutoff.setDate(today.getDate() - 7);
      break;
    case "31d":
      cutoff.setDate(today.getDate() - 31);
      break;
    case "6m":
      cutoff.setMonth(today.getMonth() - 6);
      break;
    case "1y":
      cutoff.setFullYear(today.getFullYear() - 1);
      break;
    default:
      cutoff.setDate(today.getDate() - 31);
  }
  return cutoff.toISOString().split("T")[0];
};

export default function Absenteeism() {
  const { role, currentEmployee, employees } = useApp();
  const isProcessor = role === "Admin" || role === "HR Manager";
  const [period, setPeriod] = useState("31d");
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

  const cutoff = getCutoffDate(period);

  const myRecords = useMemo(() => {
    if (!currentEmployee) return [];
    return attendanceHistory
      .filter(r => r.employeeId === currentEmployee.id && r.status !== "present" && r.date >= cutoff)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [currentEmployee?.id, cutoff]);

  const myStats = useMemo(() => {
    return myRecords.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, { total: 0 });
  }, [myRecords]);

  const filteredRecords = useMemo(() => {
    let records = attendanceHistory.filter(r => r.status !== "present" && r.date >= cutoff);
    if (isProcessor && search) {
      const q = search.toLowerCase();
      records = records.filter(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        return emp && (emp.name.toLowerCase().includes(q) || emp.dept.toLowerCase().includes(q));
      });
    }
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }, [cutoff, search, isProcessor, employees]);

  const allStats = useMemo(() => {
    const stats = {};
    employees.forEach(emp => {
      stats[emp.id] = {
        name: emp.name,
        dept: emp.dept,
        absent: 0,
        sick: 0,
        leave: 0,
        total: 0
      };
    });
    filteredRecords.forEach(r => {
      if (stats[r.employeeId]) {
        if (r.status === "absent") stats[r.employeeId].absent++;
        else if (r.status === "sick") stats[r.employeeId].sick++;
        else if (r.status === "leave") stats[r.employeeId].leave++;
        if (r.status !== "present") stats[r.employeeId].total++;
      }
    });
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [filteredRecords, employees]);

  if (isProcessor) {
    return (
      <div className="space-y-6">
        <SectionTitle eyebrow="Absence Ledger" title="Employee absenteeism" />

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border">
            <Search size={15} color={C.inkSoft} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or department"
              className="bg-transparent outline-none text-sm w-full text-ink"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-full text-xs border ${period === p.key ? 'bg-brassSoft text-brass border-brass' : 'bg-transparent text-muted border-line'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden card card-border">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
                <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Employee</span></th>
                <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Department</span></th>
                <th className="text-center px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Absent</span></th>
                <th className="text-center px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Sick</span></th>
                <th className="text-center px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Leave</span></th>
                <th className="text-center px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Total off</span></th>
              </tr>
            </thead>
            <tbody>
              {allStats.map((stat, i) => (
                <tr key={stat.name} className={i > 0 ? "border-top-line" : ""}>
                  <td className="px-4 py-3 text-sm">{highlightText(stat.name, search)}</td>
                  <td className="px-4 py-3 text-xs text-muted">{highlightText(stat.dept, search)}</td>
                  <td className="px-4 py-3 text-center text-sm">{stat.absent}</td>
                  <td className="px-4 py-3 text-center text-sm">{stat.sick}</td>
                  <td className="px-4 py-3 text-center text-sm">{stat.leave}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold">{stat.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border overflow-hidden card card-border">
          <div className="px-4 py-3 border-top-line">
            <p className="text-sm text-muted">All absence records ({PERIODS.find(p => p.key === period)?.label.toLowerCase()})</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Employee</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Date</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Status</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, i) => {
                  const emp = employees.find(e => e.id === r.employeeId);
                  return (
                    <tr key={r.date + r.employeeId + i} className={i === 0 ? "" : "border-top-line"}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 bg-tealSoft text-teal font-mono">
                            {emp?.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm truncate">{highlightText(emp?.name || "", search)}</p>
                            <p className="text-[11px] text-muted">{highlightText(emp?.dept || "", search)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted font-mono">{r.date}</td>
                      <td className="px-4 py-3"><Stamp meta={ATTENDANCE_STATUS[r.status] || { label: r.status || "Unknown", variant: "present" }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Absence Ledger" title="Your days off" />

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-full text-xs border ${period === p.key ? 'bg-brassSoft text-brass border-brass' : 'bg-transparent text-muted border-line'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-5 card card-border">
          <p className="text-[11px] uppercase tracking-wider text-muted font-mono">Days absent</p>
          <p className="mt-2 text-3xl font-serif font-semibold text-rust">{myStats.absent || 0}</p>
        </div>
        <div className="rounded-xl border p-5 card card-border">
          <p className="text-[11px] uppercase tracking-wider text-muted font-mono">Sick days</p>
          <p className="mt-2 text-3xl font-serif font-semibold text-brass">{myStats.sick || 0}</p>
        </div>
        <div className="rounded-xl border p-5 card card-border">
          <p className="text-[11px] uppercase tracking-wider text-muted font-mono">Leave days</p>
          <p className="mt-2 text-3xl font-serif font-semibold text-slate">{myStats.leave || 0}</p>
        </div>
        <div className="rounded-xl border p-5 card card-border">
          <p className="text-[11px] uppercase tracking-wider text-muted font-mono">Total off</p>
          <p className="mt-2 text-3xl font-serif font-semibold text-ink">{myStats.total}</p>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden card card-border">
        <div className="px-4 py-3 border-top-line">
          <p className="text-sm text-muted">Recent absences ({PERIODS.find(p => p.key === period)?.label.toLowerCase()})</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
              <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Date</span></th>
              <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Status</span></th>
            </tr>
          </thead>
          <tbody>
            {myRecords.length === 0 ? (
              <tr><td colSpan="2" className="px-4 py-8 text-sm text-muted text-center">No absences recorded.</td></tr>
            ) : (
              myRecords.slice(0, 20).map((r, i) => (
                <tr key={r.date + i} className={i > 0 ? "border-top-line" : ""}>
                  <td className="px-4 py-3 text-sm">{r.date}</td>
                  <td className="px-4 py-3"><Stamp meta={ATTENDANCE_STATUS[r.status] || { label: r.status || "Unknown", variant: "present" }} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
