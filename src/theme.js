export const C = {
  paper: "#EDEFE9",
  card: "#FBFBF8",
  ink: "#1E2A24",
  inkSoft: "#39642C",
  line: "#D9DBCD",
  brass: "#39642C",
  brassSoft: "#39642C",
  teal: "#39642C",
  tealSoft: "#DCE9E3",
  rust: "#cf352a",
  rustSoft: "#F1DED5",
  slate: "#5A6B85",
  slateSoft: "#DEE3EC",
};

export const STAGES = {
  onboarding: { label: "Onboarding", color: C.slate, bg: C.slateSoft, variant: "onboarding" },
  active: { label: "Active", color: C.teal, bg: C.tealSoft, variant: "active" },
  leave: { label: "On Leave", color: C.brass, bg: C.brassSoft, variant: "leave" },
  review: { label: "In Review", color: C.brass, bg: C.brassSoft, variant: "review" },
  offboarding: { label: "Offboarding", color: C.rust, bg: C.rustSoft, variant: "offboarding" },
};

export const ATTENDANCE_STATUS = {
  present: { label: "Present", color: C.teal, bg: C.tealSoft, variant: "present" },
  absent: { label: "Absent", color: C.rust, bg: C.rustSoft, variant: "absent" },
  sick: { label: "Sick leave", color: C.brass, bg: C.brassSoft, variant: "sick" },
  leave: { label: "On leave", color: C.slate, bg: C.slateSoft, variant: "leave" },
};

export const REQUEST_STATUS = {
  pending: { label: "Pending", color: C.brass, bg: C.brassSoft, variant: "pending" },
  approved: { label: "Approved", color: C.teal, bg: C.tealSoft, variant: "approved" },
  declined: { label: "Declined", color: C.rust, bg: C.rustSoft, variant: "declined" },
};

export const fontSerif = "'Fraunces', serif";
export const fontMono = "'IBM Plex Mono', monospace";
export const fontSans = "'IBM Plex Sans', sans-serif";
