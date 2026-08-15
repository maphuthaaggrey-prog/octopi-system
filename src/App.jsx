import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payslips from "./pages/Payslips";
import Performance from "./pages/Performance";
import AccessControl from "./pages/AccessControl";
import Absenteeism from "./pages/Absenteeism";
import Calendar from "./pages/Calendar";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="payslips" element={<Payslips />} />
          <Route path="performance" element={<Performance />} />
          <Route path="access-control" element={<AccessControl />} />
          <Route path="absenteeism" element={<Absenteeism />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
