import React, { useState } from "react";
import { Check, X, Send, Search } from "lucide-react";
import { C, REQUEST_STATUS, fontMono, fontSerif } from "../theme";
import { SectionTitle, Stamp } from "../components/ui";
import { useApp } from "../context/AppContext";
import { findEmployee } from "../data/mockData";

const LEAVE_TYPES = ["Annual", "Sick", "Family Responsibility", "Unpaid"];

function daysBetween(from, to) {
  if (!from || !to) return 0;
  const ms = new Date(to) - new Date(from);
  return ms >= 0 ? Math.round(ms / 86400000) + 1 : 0;
}

function ApplyForm({ employeeId }) {
  const { submitLeaveRequest } = useApp();
  const [type, setType] = useState(LEAVE_TYPES[0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const days = daysBetween(from, to);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to) return setError("Please choose a start and end date.");
    if (days <= 0) return setError("End date must be on or after the start date.");
    if (!reason.trim()) return setError("A reason is required to submit a leave request.");

    submitLeaveRequest({ employeeId, type, from, to, days, reason: reason.trim() });
    setSubmitted(true);
    setError("");
    setFrom(""); setTo(""); setReason("");
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-5 space-y-4 card card-border">
      <p className="text-sm text-muted">Apply for leave</p>

      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs space-y-1 block">
          <span className="text-muted">Leave type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-paper border-line">
            {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-xs space-y-1 block">
          <span className="text-muted">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-paper border-line" />
        </label>
        <label className="text-xs space-y-1 block">
          <span className="text-muted">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-paper border-line" />
        </label>
      </div>

      <label className="text-xs space-y-1 block">
        <span className="text-muted">Reason <span className="text-rust">*</span></span>
        <textarea
          value={reason} onChange={(e) => setReason(e.target.value)}
          rows={3} required
          placeholder="Briefly explain the reason for this leave request"
          className="w-full text-sm border rounded-lg px-3 py-2 outline-none resize-none bg-paper border-line"
        />
      </label>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{days > 0 ? `${days} day${days > 1 ? "s" : ""} requested` : "\u00A0"}</p>
        <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm btn-primary">
          <Send size={14} /> Submit request
        </button>
      </div>

      {error && <p className="text-xs text-rust">{error}</p>}
      {submitted && <p className="text-xs text-teal">Leave request submitted for approval.</p>}
    </form>
  );
}

function BalanceCards({ employee }) {
  const items = [
    {
      label: "Annual leave",
      value: employee?.leaveBalances?.annual ?? 0,
      of: 21,
      info: "per cycle (21 days available, accrues 1.25 days/month)"
    },
    {
      label: "Sick leave",
      value: employee?.leaveBalances?.sick ?? 0,
      of: 30,
      info: "per 3-year cycle (30 days available)"
    },
    {
      label: "Family responsibility",
      value: employee?.leaveBalances?.family ?? 0,
      of: 3,
      info: "per year (3 days available)"
    },
  ];
  return (
    <div>
      <p className="text-sm mb-4 text-muted">Your leave balance</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {items.map((it) => {
          const progressClass = `progress-${Math.round((it.value / it.of) * 20) * 5}`;
          const progressColor = it.value <= 2 ? 'bg-rust' : it.value <= 5 ? 'bg-brass' : 'bg-teal';
          return (
            <div key={it.label} className="rounded-xl border p-4 card card-border">
              <p className="text-[11px] uppercase tracking-wider text-brass font-mono">{it.label}</p>
              <p className="text-2xl mt-1 font-serif font-semibold">{it.value}<span className="text-sm text-muted"> / {it.of} days</span></p>
              <div className="h-1.5 rounded-full mt-2 bg-line progress-bar">
                <div className={`h-1.5 rounded-full progress-fill ${progressClass} ${progressColor}`} />
              </div>
              <p className="text-[11px] mt-2 text-muted">{it.info}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

function RequestRow({ r, showEmployee, canDecide, onDecide, isFirst, searchQuery }) {
  const emp = findEmployee(r.employeeId);
  const q = searchQuery || "";
  return (
    <tr className={isFirst ? "" : "border-top-line"}>
      <td className="px-4 py-3">
        <p className="text-sm">
          {showEmployee && <span className="font-semibold">{highlightText(emp?.name || "", q)}</span>}
          {showEmployee && " · "}{highlightText(r.type, q)}
        </p>
        <p className="text-xs text-muted truncate">&quot;{highlightText(r.reason, q)}&quot;</p>
      </td>
      <td className="px-4 py-3 text-center text-sm font-mono">{r.days}</td>
      <td className="px-4 py-3 text-xs text-muted font-mono">{r.from}</td>
      <td className="px-4 py-3 text-xs text-muted font-mono">{r.to}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 shrink-0">
          {canDecide && r.status === "pending" ? (
            <>
              <button onClick={() => onDecide(r.id, "approved")} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg text-teal bg-tealSoft hover:text-ink transition-colors">
                <Check size={13} /> Approve
              </button>
              <button onClick={() => onDecide(r.id, "declined")} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-rust text-white hover:bg-rustSoft hover:text-rust transition-colors">
                <X size={13} /> Decline
              </button>
            </>
          ) : (
            <span className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-mono ${r.status === "approved" ? "text-teal bg-tealSoft" : r.status === "declined" ? "bg-rust text-white" : "text-brass bg-brassSoft"}`}>{(REQUEST_STATUS[r.status] || REQUEST_STATUS.pending).label}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function Leave() {
  const { role, currentEmployee, leaveRequests, decideLeaveRequest } = useApp();
  const isProcessor = role === "Admin" || role === "HR Manager";
  const selfId = currentEmployee?.id;
  const [ownSearch, setOwnSearch] = useState("");
  const [allSearch, setAllSearch] = useState("");

  const ownRequests = leaveRequests.filter((r) => r.employeeId === selfId);
  const pendingForOthers = leaveRequests.filter((r) => r.employeeId !== selfId);

  const filteredOwn = ownRequests.filter((r) => {
    const q = ownSearch.toLowerCase();
    return r.type.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
  });

  const filteredForOthers = pendingForOthers.filter((r) => {
    const q = allSearch.toLowerCase();
    const emp = findEmployee(r.employeeId);
    return emp && (emp.name.toLowerCase().includes(q) || emp.dept.toLowerCase().includes(q) || r.type.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="head">
        <SectionTitle eyebrow="Leave Ledger" title="Leave" />
      </div>

      {currentEmployee && <BalanceCards employee={currentEmployee} />}
      {currentEmployee && <ApplyForm employeeId={selfId} />}

      {currentEmployee && (
        <div className="space-y-4">
          <p className="text-sm mb-1 text-muted">Your requests</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border">
            <Search size={15} color={C.inkSoft} />
            <input
              value={ownSearch} onChange={(e) => setOwnSearch(e.target.value)}
              placeholder="Search by type or reason"
              className="bg-transparent outline-none text-sm w-full text-ink"
            />
          </div>
          <div className="rounded-xl border overflow-hidden card card-border">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Request</span></th>
                  <th className="text-center px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Days</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">From</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">To</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Status</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredOwn.length === 0 && <tr><td colSpan="5" className="px-4 py-6 text-xs text-muted">No leave requests match.</td></tr>}
                {filteredOwn.map((r, i) => <RequestRow key={r.id} r={r} canDecide={false} isFirst={i === 0} searchQuery={ownSearch} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isProcessor && (
        <div className="space-y-4">
          <p className="text-sm mb-1 text-muted">All employee requests</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border">
            <Search size={15} color={C.inkSoft} />
            <input
              value={allSearch} onChange={(e) => setAllSearch(e.target.value)}
              placeholder="Search employee, department or type"
              className="bg-transparent outline-none text-sm w-full text-ink"
            />
          </div>
          <div className="rounded-xl border overflow-hidden card card-border">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Request</span></th>
                  <th className="text-center px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Days</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">From</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">To</span></th>
                  <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Status</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredForOthers.length === 0 && <tr><td colSpan="5" className="px-4 py-6 text-xs text-muted">Nothing to review.</td></tr>}
                {filteredForOthers.map((r, i) => (
                  <RequestRow key={r.id} r={r} showEmployee canDecide onDecide={decideLeaveRequest} isFirst={i === 0} searchQuery={allSearch} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
