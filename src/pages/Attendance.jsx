import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Clock, Search } from "lucide-react";
import { C, ATTENDANCE_STATUS, fontMono } from "../theme";
import { SectionTitle, Stamp } from "../components/ui";
import { useApp } from "../context/AppContext";
import { attendanceTrend } from "../data/mockData";

function HrAttendanceTable() {
    const { employees, attendanceToday, setAttendanceStatus } = useApp();
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

    const filtered = employees.filter((e) => {
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border">
                <Search size={15} color={C.inkSoft} />
                <input
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search employee name or department"
                    className="bg-transparent outline-none text-sm w-full text-ink"
                />
            </div>
            <div className="rounded-xl border overflow-hidden card card-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${C.line}`, backgroundColor: C.brassSoft }}>
                            <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Employee</span></th>
                            <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Status</span></th>
                            <th className="text-left px-4 py-2.5"><span className="text-[10px] uppercase tracking-wider text-brass font-mono">Mark</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((e, i) => (
                            <tr key={e.id} className={i > 0 ? "border-top-line" : ""}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0 bg-tealSoft text-teal font-mono">{e.initials}</div>
                                        <div className="min-w-0">
                                            <p className="text-sm truncate text-ink">{highlightText(e.name, search)}</p>
                                            <p className="text-xs truncate text-muted">{highlightText(e.dept, search)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3"><Stamp meta={ATTENDANCE_STATUS[attendanceToday[e.id]] || ATTENDANCE_STATUS.present} /></td>
                                <td className="px-4 py-3">
                                    <select
                                        value={attendanceToday[e.id]}
                                        onChange={(ev) => setAttendanceStatus(e.id, ev.target.value)}
                                        className="text-xs border rounded-lg px-2 py-1.5 outline-none shrink-0 bg-paper border-line text-ink"
                                    >
                                        {Object.entries(ATTENDANCE_STATUS).map(([key, meta]) => (
                                            <option key={key} value={key}>{meta.label}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OwnAttendance() {
    const { currentEmployee, attendanceToday } = useApp();
    const status = currentEmployee?.id ? attendanceToday[currentEmployee.id] : "present";
    const statusMeta = ATTENDANCE_STATUS[status] || ATTENDANCE_STATUS.present;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border p-5 flex items-center justify-between card card-border">
                <div>
                    <p className="text-sm text-muted">Your status today</p>
                    <p className="text-2xl mt-1 font-serif font-semibold">{statusMeta.label}</p>
                </div>
                <Stamp meta={statusMeta} />
            </div>
            <p className="text-xs text-muted">
                Your attendance is recorded by HR. If this looks wrong, reach out to your HR Manager or apply for leave if it should be planned time off.
            </p>
        </div>
    );
}

export default function Attendance() {
    const { role } = useApp();
    const isProcessor = role === "Admin" || role === "HR Manager";

    return (
        <div className="space-y-6">
            <div className="head">
                <SectionTitle eyebrow="Time Register" title={isProcessor ? "Today's attendance" : "Attendance"} />
            </div>


            {isProcessor ? <HrAttendanceTable /> : <OwnAttendance />}

            <div className="rounded-xl border p-5 card card-border">
                <p className="text-sm mb-3 flex items-center gap-2 text-muted"><Clock size={15} /> {isProcessor ? "Company" : "Team"} attendance rate, last 7 working days</p>
                <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={attendanceTrend}>
                        <CartesianGrid vertical={false} stroke={C.line} />
                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: C.inkSoft }} axisLine={{ stroke: C.line }} tickLine={false} />
                        <YAxis domain={[80, 100]} tick={{ fontSize: 12, fill: C.inkSoft }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.line}` }} />
                        <Line type="monotone" dataKey="rate" stroke={C.brass} strokeWidth={2.5} dot={{ r: 3, fill: C.brass }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
