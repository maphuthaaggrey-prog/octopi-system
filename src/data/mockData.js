export const DEPARTMENTS = ["IT Support G1", "IT Support G2", "IT Support G3", "End User Computing"];

const NAMES = [
  "Lindiwe Khumalo", "Sipho Ndlovu", "Aisha Patel", "Thabo Molefe", "Zanele Dlamini",
  "Ryan Fourie", "Naledi Mokoena", "Johan van Wyk", "Precious Nkosi", "Kabelo Sithole",
  "Amara Okafor", "Liam de Beer", "Tebogo Masemola", "Bongani Zulu", "Fatima Mthembu",
  "Pieter Coetzee", "Nomvula Cele", "Andile Botha", "Kagiso Pillay", "Dumisani Naidoo",
  "Lerato Meyer", "Siyabonga Marais", "Anesh Govender", "Mandla Khswayo", "Chantal Swart",
  "Mpho Mabena", "Sibusiso Gumede", "Tanya Pretorius", "Farai Moyo", "Ayanda Bhengu",
  "Jacques Du Plessis", "Karabo Mahlangu", "Priya Sharma", "Willem Nel", "Refilwe Tau",
  "Wandile Shabangu", "Melanie Venter", "Tshepo Modise", "Sanesh Naicker", "Busisiwe Ntuli",
  "Gareth Smith", "Thandeka Msomi", "Keagan Jacobs", "Zola Mkhize", "Christo Oosthuizen",
  "Nokuthula Zwane", "Devashin Reddy", "Unathi Baloyi", "Charl Bothma", "Palesa Radebe"
];

const TITLES = ["Technician", "HR", "Facilitator", "Accessor", "Coordinator", "Manager", "Specialist", "Administrator"];

export const employees = NAMES.map((name, i) => {
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const stage = i < 2 ? "onboarding" : i === 11 ? "offboarding" : i % 5 === 0 ? "leave" : i % 4 === 0 ? "review" : "active";

  // Calculate leave based on South African BCEA requirements
  // Annual: 21 days per cycle (15 working days for 5-day week)
  // Sick: 30 days per 3-year cycle, accrues at 1 day per 26 days worked (approx 1.15 days/month)
  // Family responsibility: 3 days per year
  const birthYear = 2021 + (i % 4);
  const monthsWorked = 12 * (2026 - birthYear) + 8; // Assuming August 2026

  // Annual leave accrual: 1.25 days per month for 5-day week
  const annualAccrued = Math.min(21, Math.floor(monthsWorked * 1.25));
  const annualUsed = Math.floor((i * 2.5) % 8);
  const annualBalance = Math.max(0, annualAccrued - annualUsed);

  // Sick leave: 30 days per 3-year cycle (1 day per 26 days worked initially)
  const cycleMonths = monthsWorked % 36;
  const sickAccrued = cycleMonths <= 6 ? Math.floor(monthsWorked * 1.15 / 26) : Math.min(30, 6 + Math.floor((cycleMonths - 6) * 0.8));
  const sickUsed = Math.floor((i * 1.5) % 5);
  const sickBalance = Math.max(0, sickAccrued - sickUsed);

  // Family responsibility: 3 days per year
  const familyBalance = 3 - (i % 2); // 2-3 days available

  return {
    id: `EMP-${String(1042 + i)}`,
    name,
    dept,
    title: TITLES[i % TITLES.length],
    stage,
    start: `${birthYear}-0${(i % 8) + 1}-14`,
    score: 62 + ((i * 7) % 35),
    initials: name.split(" ").map((n) => n[0]).join(""),
    email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@octopi.co.za`,
    phone: `+27 ${60 + (i % 5)} ${10000000 + i * 123456}`,
    skills: [
      { name: "Printer Diagnostics", level: 60 + (i * 7) % 40 },
      { name: "Copier Refurbishment", level: 50 + (i * 11) % 50 },
      { name: "Technical Training", level: 40 + (i * 3) % 60 },
      { name: "Customer Support", level: 55 + (i * 5) % 45 },
    ],
    leaveBalances: {
      annual: annualBalance,
      sick: sickBalance,
      family: familyBalance,
    },
  };
});

export const findEmployee = (id) => employees.find((e) => e.id === id);

/* who's actually logged in for each demo role */
export const CURRENT_USERS = {
  Admin: { name: "Aggrey Maphutha", initials: "AM", employeeId: null },
  "HR Manager": { name: "Naledi Mokoena", initials: "NM", employeeId: "EMP-1048" },
  Employee: { name: "Lindiwe Khumalo", initials: "LK", employeeId: "EMP-1042" },
};

export const headcountByDept = DEPARTMENTS.map((d) => ({
  dept: d.length > 15 ? `${d.slice(0, 11)}…` : d,
  full: d,
  count: employees.filter((e) => e.dept === d).length,
}));

export const attendanceTrend = [
  { day: "Mon", rate: 96 }, { day: "Tue", rate: 94 }, { day: "Wed", rate: 91 },
  { day: "Thu", rate: 95 }, { day: "Fri", rate: 88 }, { day: "Mon", rate: 97 }, { day: "Tue", rate: 93 },
];

/* today's attendance, keyed by employee id — this is what HR processes */
export const initialAttendanceToday = employees.reduce((acc, e, i) => {
  acc[e.id] = i === 2 ? "sick" : i === 4 || i === 9 || i === 15 ? "leave" : i === 7 || i === 22 ? "absent" : "present";
  return acc;
}, {});

/* leave requests — reason is required on every submission */
export const initialLeaveRequests = [
  { id: "LR-118", employeeId: "EMP-1042", type: "Annual", days: 5, from: "2026-08-12", to: "2026-08-16", reason: "Family trip to Cape Town booked in advance.", status: "pending" },
  { id: "LR-119", employeeId: "EMP-1047", type: "Sick", days: 2, from: "2026-08-09", to: "2026-08-10", reason: "Flu, doctor's note to follow.", status: "pending" },
  { id: "LR-120", employeeId: "EMP-1051", type: "Family Responsibility", days: 1, from: "2026-08-14", to: "2026-08-14", reason: "Child's school orientation day.", status: "approved" },
  { id: "LR-121", employeeId: "EMP-1050", type: "Annual", days: 7, from: "2026-09-01", to: "2026-09-07", reason: "Annual leave, coverage arranged with team lead.", status: "pending" },
  { id: "LR-122", employeeId: "EMP-1052", type: "Unpaid", days: 3, from: "2026-08-20", to: "2026-08-22", reason: "Personal matter to attend to out of town.", status: "declined" },
];

export const leaveTypeSplit = [
  { name: "Annual", value: 46, color: "#2F6F62" },
  { name: "Sick", value: 24, color: "#A9803E" },
  { name: "Family", value: 18, color: "#5A6B85" },
  { name: "Unpaid", value: 12, color: "#B0492F" },
];

/* payslips — eight months for every employee */
const MONTHS = ["January 2026", "February 2026", "March 2026", "April 2026", "May 2026", "June 2026", "July 2026", "August 2026"];
export const payslips = employees.flatMap((e, i) =>
  MONTHS.map((month, m) => {
    const basic = 6000 + (i % 6) * 6500;
    const allowances = 1800 + (i % 4) * 400;
    const deductions = Math.round((basic + allowances) * 0.24);
    const issuedDate = `${month.split(" ")[1]}-${String(m + 1).padStart(2, "0")}-25`;
    const status = new Date(issuedDate) <= new Date("2026-08-12") ? "Paid" : "Pending";
    return {
      id: `PS-${e.id}-${m}`,
      employeeId: e.id,
      month,
      basic,
      allowances,
      deductions,
      net: basic + allowances - deductions,
      issued: issuedDate,
      status,
    };
  })
);

export const reviews = [
  { employeeId: "EMP-1042", cycle: "H1 2026", score: 88, goal: "Refurbish 50 printers to certified standard", progress: 80 },
  { employeeId: "EMP-1043", cycle: "H1 2026", score: 74, goal: "Reduce average printer repair time by 20%", progress: 55 },
  { employeeId: "EMP-1046", cycle: "H1 2026", score: 91, goal: "Complete advanced copier diagnostics certification", progress: 92 },
  { employeeId: "EMP-1047", cycle: "H1 2026", score: 68, goal: "Lead technical training for 10 new technicians", progress: 40 },
  { employeeId: "EMP-1048", cycle: "H1 2026", score: 85, goal: "Achieve 95% first-time fix rate on laser printers", progress: 78 },
  { employeeId: "EMP-1049", cycle: "H1 2026", score: 72, goal: "Manage inventory for 200+ printer parts", progress: 60 },
];

export const ROLES = ["Admin", "HR Manager", "Employee"];

export const PERMISSIONS = [
  { label: "View employee records", grants: { Admin: true, "HR Manager": true, Employee: false } },
  { label: "Edit employee records", grants: { Admin: true, "HR Manager": true, Employee: false } },
  { label: "Process daily attendance", grants: { Admin: true, "HR Manager": true, Employee: false } },
  { label: "Approve leave requests", grants: { Admin: true, "HR Manager": true, Employee: false } },
  { label: "Apply for own leave", grants: { Admin: true, "HR Manager": true, Employee: true } },
  { label: "View own payslips", grants: { Admin: true, "HR Manager": true, Employee: true } },
  { label: "View all payslips", grants: { Admin: true, "HR Manager": true, Employee: false } },
  { label: "Edit performance reviews", grants: { Admin: true, "HR Manager": true, Employee: false } },
  { label: "Manage user roles", grants: { Admin: true, "HR Manager": false, Employee: false } },
];

/* home page announcement feed — mix of system-generated and posted items */
export const announcements = [
  { id: "AN-1", type: "welcome", title: "Welcoming our newest hires", body: "Please give a warm welcome to Lindiwe Khumalo and Sipho Ndlovu, joining Engineering and Design this week.", date: "2026-08-04" },
  { id: "AN-2", type: "info", title: "Payslips for August now available", body: "August payslips have been issued and are ready to view under Payslips.", date: "2026-08-07" },
  { id: "AN-3", type: "info", title: "Office closed 24 September", body: "Heritage Day — the office will be closed. No leave deduction applies.", date: "2026-08-01" },
];

export const PUBLIC_HOLIDAYS = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-03-21", name: "Human Rights Day" },
  { date: "2026-04-27", name: "Freedom Day" },
  { date: "2026-05-01", name: "Workers' Day" },
  { date: "2026-06-16", name: "Youth Day" },
  { date: "2026-08-09", name: "National Women's Day" },
  { date: "2026-09-24", name: "Heritage Day" },
  { date: "2026-12-16", name: "Day of Reconciliation" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-26", name: "Day of Goodwill" },
];

export const attendanceHistory = [
  { employeeId: "EMP-1042", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1042", date: "2026-08-09", status: "absent" },
  { employeeId: "EMP-1042", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1042", date: "2026-08-07", status: "sick" },
  { employeeId: "EMP-1042", date: "2026-08-06", status: "present" },
  { employeeId: "EMP-1043", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1043", date: "2026-08-09", status: "present" },
  { employeeId: "EMP-1043", date: "2026-08-08", status: "absent" },
  { employeeId: "EMP-1043", date: "2026-08-07", status: "leave" },
  { employeeId: "EMP-1043", date: "2026-08-06", status: "present" },
  { employeeId: "EMP-1044", date: "2026-08-10", status: "sick" },
  { employeeId: "EMP-1044", date: "2026-08-09", status: "sick" },
  { employeeId: "EMP-1044", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1044", date: "2026-08-07", status: "present" },
  { employeeId: "EMP-1044", date: "2026-08-06", status: "leave" },
  { employeeId: "EMP-1045", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1045", date: "2026-08-09", status: "absent" },
  { employeeId: "EMP-1045", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1045", date: "2026-08-07", status: "present" },
  { employeeId: "EMP-1045", date: "2026-08-06", status: "present" },
  { employeeId: "EMP-1046", date: "2026-08-10", status: "leave" },
  { employeeId: "EMP-1046", date: "2026-08-09", status: "leave" },
  { employeeId: "EMP-1046", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1046", date: "2026-08-07", status: "present" },
  { employeeId: "EMP-1046", date: "2026-08-06", status: "absent" },
  { employeeId: "EMP-1047", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1047", date: "2026-08-09", status: "present" },
  { employeeId: "EMP-1047", date: "2026-08-08", status: "sick" },
  { employeeId: "EMP-1047", date: "2026-08-07", status: "present" },
  { employeeId: "EMP-1047", date: "2026-08-06", status: "present" },
  { employeeId: "EMP-1048", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1048", date: "2026-08-09", status: "absent" },
  { employeeId: "EMP-1048", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1048", date: "2026-08-07", status: "leave" },
  { employeeId: "EMP-1048", date: "2026-08-06", status: "present" },
  { employeeId: "EMP-1049", date: "2026-08-10", status: "absent" },
  { employeeId: "EMP-1049", date: "2026-08-09", status: "absent" },
  { employeeId: "EMP-1049", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1049", date: "2026-08-07", status: "present" },
  { employeeId: "EMP-1049", date: "2026-08-06", status: "sick" },
  { employeeId: "EMP-1050", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1050", date: "2026-08-09", status: "leave" },
  { employeeId: "EMP-1050", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1050", date: "2026-08-07", status: "absent" },
  { employeeId: "EMP-1050", date: "2026-08-06", status: "present" },
  { employeeId: "EMP-1051", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1051", date: "2026-08-09", status: "present" },
  { employeeId: "EMP-1051", date: "2026-08-08", status: "sick" },
  { employeeId: "EMP-1051", date: "2026-08-07", status: "sick" },
  { employeeId: "EMP-1051", date: "2026-08-06", status: "leave" },
  { employeeId: "EMP-1052", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1052", date: "2026-08-09", status: "present" },
  { employeeId: "EMP-1052", date: "2026-08-08", status: "present" },
  { employeeId: "EMP-1052", date: "2026-08-07", status: "present" },
  { employeeId: "EMP-1052", date: "2026-08-06", status: "present" },
  { employeeId: "EMP-1053", date: "2026-08-10", status: "present" },
  { employeeId: "EMP-1053", date: "2026-08-09", status: "present" },
  { employeeId: "EMP-1053", date: "2026-08-08", status: "leave" },
  { employeeId: "EMP-1053", date: "2026-08-07", status: "present" },
  { employeeId: "EMP-1053", date: "2026-08-06", status: "present" },
];
