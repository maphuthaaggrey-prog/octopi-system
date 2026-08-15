import React, { createContext, useContext, useMemo, useState } from "react";
import {
  employees as seedEmployees,
  findEmployee,
  CURRENT_USERS,
  initialAttendanceToday,
  initialLeaveRequests,
  attendanceHistory,
  payslips,
  reviews,
  announcements,
} from "../data/mockData";

const AppContext = createContext(null);

let requestCounter = 123;

export function AppProvider({ children }) {
  const [role, setRole] = useState("Admin");
  const [attendanceToday, setAttendanceToday] = useState(initialAttendanceToday);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);

  const user = CURRENT_USERS[role];
  const currentEmployee = user.employeeId ? findEmployee(user.employeeId) : null;

  const setAttendanceStatus = (employeeId, status) =>
    setAttendanceToday((prev) => ({ ...prev, [employeeId]: status }));

  const submitLeaveRequest = ({ employeeId, type, from, to, days, reason }) => {
    const newRequest = {
      id: `LR-${requestCounter++}`,
      employeeId,
      type,
      from,
      to,
      days,
      reason,
      status: "pending",
    };
    setLeaveRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const decideLeaveRequest = (id, status) =>
    setLeaveRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const value = useMemo(
    () => ({
      role,
      setRole,
      user,
      currentEmployee,
      employees: seedEmployees,
      attendanceToday,
      setAttendanceStatus,
      leaveRequests,
      attendanceHistory,
      submitLeaveRequest,
      decideLeaveRequest,
      payslips,
      reviews,
      announcements,
    }),
    [role, attendanceToday, leaveRequests]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
