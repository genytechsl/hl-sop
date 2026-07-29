export interface Ticket {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  property: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  customerName: string;
  slaTarget: string;

  customer?: any;
  scope?: string;
  complaintSource?: string;
  description?: string;
  attachments?: string[];
  ccEmails?: string[];
}

export const ticketData: Ticket[] = [
  {
    id: "HL-CMU-2026-0001",
    title: "Major water leakage in tower block",
    category: "CAT-A",
    categoryLabel: "CRITICAL",
    property: "The Grand Ward Place",
    status: "CLOSED",
    priority: "HIGH",
    assignedTo: "Facilities Team",
    createdAt: "2026-07-18 09:15",
    customerName: "J. Sunimal Fernando",
    slaTarget: "24 h",
  },
  {
    id: "HL-CMU-2026-0002",
    title: "Complete power outage in apartment unit",
    category: "CAT-A",
    categoryLabel: "CRITICAL",
    property: "The Capitol TwinPeaks",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignedTo: "Electrical Team",
    createdAt: "2026-07-20 14:30",
    customerName: "Y. E. Peiris",
    slaTarget: "24 h",
  },
  {
    id: "HL-CMU-2026-0003",
    title: "Air conditioning malfunction",
    category: "CAT-B",
    categoryLabel: "TECHNICAL",
    property: "One Galle Face Residencies",
    status: "OPEN",
    priority: "MEDIUM",
    assignedTo: "MEP Team",
    createdAt: "2026-07-19 10:45",
    customerName: "Reshani Perera",
    slaTarget: "7 wd",
  },
  {
    id: "HL-CMU-2026-0004",
    title: "Water pressure issue in bathroom",
    category: "CAT-B",
    categoryLabel: "TECHNICAL",
    property: "Prime Grand Ward Place",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignedTo: "Technical Team",
    createdAt: "2026-07-17 08:20",
    customerName: "J. Sunimal Fernando",
    slaTarget: "7 wd",
  },
  {
    id: "HL-CMU-2026-0005",
    title: "Painting touch-up request",
    category: "CAT-B2",
    categoryLabel: "SFM FACILITY",
    property: "Canal View Residence",
    status: "OPEN",
    priority: "LOW",
    assignedTo: "Facility Management Team",
    createdAt: "2026-07-18 11:00",
    customerName: "J. Ranmal Fernando",
    slaTarget: "7 d",
  },
  {
    id: "HL-CMU-2026-0006",
    title: "Replacement of damaged ceiling panel",
    category: "CAT-B2",
    categoryLabel: "SFM FACILITY",
    property: "Lakefront Apartments",
    status: "IN_PROGRESS",
    priority: "LOW",
    assignedTo: "Maintenance Team",
    createdAt: "2026-07-16 13:40",
    customerName: "J. Sunimal Fernando",
    slaTarget: "7 d",
  },
  {
    id: "HL-CMU-2026-0007",
    title: "Title deed issuance delay",
    category: "CAT-C",
    categoryLabel: "ADMIN/PAY",
    property: "The Grand Ward Place",
    status: "OPEN",
    priority: "MEDIUM",
    assignedTo: "Documentation Team",
    createdAt: "2026-07-15 09:00",
    customerName: "J. Sunimal Fernando",
    slaTarget: "5 wd",
  },
  {
    id: "HL-CMU-2026-0008",
    title: "Ledger payment reconciliation issue",
    category: "CAT-C",
    categoryLabel: "ADMIN/PAY",
    property: "Capitol TwinPeaks",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignedTo: "Finance Team",
    createdAt: "2026-07-18 15:15",
    customerName: "J. Sunimal Fernando",
    slaTarget: "5 wd",
  },
  {
    id: "HL-CMU-2026-0009",
    title: "SPA clause dispute",
    category: "CAT-D",
    categoryLabel: "LEGAL",
    property: "One Galle Face Residencies",
    status: "OPEN",
    priority: "HIGH",
    assignedTo: "Legal Team",
    createdAt: "2026-07-10 10:00",
    customerName: "J. Sunimal Fernando",
    slaTarget: "10 wd",
  },
  {
    id: "HL-CMU-2026-0010",
    title: "Formal legal notice review",
    category: "CAT-D",
    categoryLabel: "LEGAL",
    property: "Lakefront Apartments",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignedTo: "Legal Team",
    createdAt: "2026-07-14 14:00",
    customerName: "J. Sunimal Fernando",
    slaTarget: "10 wd",
  },
];
