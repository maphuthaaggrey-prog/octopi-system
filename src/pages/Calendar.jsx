import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "../theme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Calendar({ compact }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const monthPrefix = `${viewYear}-${pad(viewMonth + 1)}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isWeekend = (dayOfWeek) => dayOfWeek === 0 || dayOfWeek === 6;

  return (
    <div className={compact ? "" : "space-y-4"}>
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-brass font-mono">
              Calendar
            </p>
            <h2 className="text-xl font-serif font-semibold text-ink">
              Calendar
            </h2>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card border-line overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <button
            onClick={() => {
              if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear((y) => y - 1);
              } else {
                setViewMonth((m) => m - 1);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-tealSoft transition-colors"
          >
            <ChevronLeft size={18} color={C.inkSoft} />
          </button>
          <p className="text-sm font-serif font-semibold text-ink">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          <button
            onClick={() => {
              if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear((y) => y + 1);
              } else {
                setViewMonth((m) => m + 1);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-tealSoft transition-colors"
          >
            <ChevronRight size={18} color={C.inkSoft} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-line">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] uppercase tracking-wider text-muted font-mono"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateStr = `${monthPrefix}-${pad(day)}`;
            const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();
            const todayStyle = isToday(day)
              ? { boxShadow: "inset 0 0 0 2px var(--color-brassSoft)" }
              : {};
            const weekendStyle = isWeekend(dayOfWeek)
              ? { backgroundColor: "rgba(0,0,0,0.015)" }
              : {};

            return (
              <div
                key={dateStr}
                className={`cal-cell aspect-square p-1 ${isWeekend(dayOfWeek) ? "cal-cell-weekend" : ""} ${isToday(day) ? "cal-cell-today" : ""}`}
                style={todayStyle}
              >
                <span
                  className={`text-xs font-medium leading-none ${isToday(day) ? "font-semibold" : "text-ink"}`}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
