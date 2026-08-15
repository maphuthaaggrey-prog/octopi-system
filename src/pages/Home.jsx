import React, { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line,
} from "recharts";
import { PartyPopper, CalendarClock, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { C, ATTENDANCE_STATUS, fontSerif, fontMono } from "../theme";
import { KPI, SectionTitle, Stamp } from "../components/ui";
import { useApp } from "../context/AppContext";
import { headcountByDept, findEmployee, attendanceTrend } from "../data/mockData";
import Calendar from "./Calendar";

const ANNOUNCEMENT_ICON = { welcome: PartyPopper, info: Info, leave: CalendarClock, absence: AlertTriangle };

function AnnouncementCard({ icon: Icon, tone, title, children, date }) {
  const iconColor = tone?.color || "var(--color-ink)";

  return (
    <div className="rounded-xl border p-4 flex gap-3 bg-card border-line">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {date && <span className="text-[10px] text-muted font-mono">{date}</span>}
        </div>
        <div className="text-xs mt-1 text-muted">{children}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { role, employees, attendanceToday, announcements, reviews } = useApp();

  const onLeaveToday = employees.filter((e) => attendanceToday[e.id] === "leave");
  const absentToday = employees.filter((e) => attendanceToday[e.id] === "absent");
  const sickToday = employees.filter((e) => attendanceToday[e.id] === "sick");
  const newHires = employees.filter((e) => e.stage === "onboarding");

  const avgScore =
    reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length)
      : 0;
  const topPerformer = reviews.length > 0
    ? reviews.reduce((top, r) => (r.score > (top?.score || 0) ? r : top))
    : null;
  const onTrack = reviews.filter((r) => r.progress >= 75).length;

  return (
    <div className="space-y-6">
      <div className="head">
        <SectionTitle eyebrow="DASHBOARD" title={role === "Employee" ? "Your snapshot" : "Workforce snapshot"} />
      </div>

      <div className="rounded-xl border p-5 bg-card border-line">
        <p className="text-[11px] uppercase tracking-wider text-brass font-mono mb-2">About Octopi Renewed</p>
        <p className="text-sm text-muted leading-relaxed">
          At Octopi Renewed, we refurbish printers and copiers to the highest standards, delivering exceptional value by combining environmental responsibility with genuine technical expertise. As a proud member of the Octopi Group, we bridge the gap between sustainability and performance. Every unit undergoes rigorous servicing by professionals trained through our accredited technical programme, empowering communities and supporting a lasting culture of dignity, development, and collective growth.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Headcount" value={employees.length} sub="+4 this quarter" />
        <KPI label="On leave today" value={onLeaveToday.length} sub="See attendance" accentClass="text-slate" />
        <KPI label="Absent / sick today" value={absentToday.length + sickToday.length} sub="Flagged for follow-up" accentClass="text-rust" />
        <KPI label="New hires" value={newHires.length} sub="In onboarding" accentClass="text-teal" />
      </div>


      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3 space-y-3">
          <p className="text-sm mb-1 text-muted">Announcements</p>
          <div className="grid md:grid-cols-2 gap-3">
            {announcements.map((a) => (
              <AnnouncementCard
                key={a.id}
                icon={ANNOUNCEMENT_ICON[a.type]}
                tone={{ bg: "var(--color-tealSoft)", color: "var(--color-teal)" }}
                title={a.title}
                date={a.date}
              >
                {a.body}
              </AnnouncementCard>
            ))}

            {reviews.length > 0 && (
              <AnnouncementCard icon={TrendingUp} tone={{ bg: "var(--color-tealSoft)", color: "var(--color-teal)" }} title="Performance snapshot">
                <div className="space-y-2 mt-1">
                  <p className="text-xs">
                    Average score: <span className="font-mono font-semibold text-ink">{avgScore}/100</span>
                  </p>
                  {topPerformer && (
                    <p className="text-xs">
                      Top performer: <span className="font-mono font-semibold text-ink">
                        {findEmployee(topPerformer.employeeId)?.name || "—"} ({topPerformer.score}/100)
                      </span>
                    </p>
                  )}
                  <p className="text-xs">
                    {onTrack} of {reviews.length} employees at 75%+ goal progress
                  </p>
                </div>
              </AnnouncementCard>
            )}

            {(onLeaveToday.length > 0 || sickToday.length > 0) && (
              <AnnouncementCard icon={CalendarClock} tone={{ bg: "var(--color-slateSoft)", color: "var(--color-slate)" }} title="Out of office today">
                <ul className="space-y-1 mt-1">
                  {[...onLeaveToday, ...sickToday].map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-2">
                      <span>{e.name} · {e.dept}</span>
                      <Stamp meta={ATTENDANCE_STATUS?.[attendanceToday[e.id]] || { label: attendanceToday[e.id] || "Unknown", variant: "present" }} />
                    </li>
                  ))}
                </ul>
              </AnnouncementCard>
            )}

            {absentToday.length > 0 && (
              <AnnouncementCard icon={AlertTriangle} tone={{ bg: "var(--color-rustSoft)", color: "var(--color-rust)" }} title="Unplanned absences">
                <ul className="space-y-1 mt-1">
                  {absentToday.map((e) => (
                    <li key={e.id}>{e.name} · {e.dept} — not yet accounted for</li>
                  ))}
                </ul>
              </AnnouncementCard>
            )}
          </div>
          <div className="rounded-xl p-5 border card card-border" style={{ marginTop: "1rem" }}>
            <p className="text-sm mb-3 text-muted">Headcount by department</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={headcountByDept} layout="vertical">
                <CartesianGrid horizontal={false} stroke={C.line} />
                <XAxis type="number" tick={{ fontSize: 12, fill: C.inkSoft }} axisLine={false} tickLine={false} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.line}` }} labelFormatter={(l, p) => p?.[0]?.payload?.full} />
                <Bar dataKey="count" fill={C.teal} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm mb-1 text-muted">Calendar</p>
          <Calendar compact />
        </div>
      </div>


    </div>
  );
}
