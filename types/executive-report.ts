export interface ExecutiveReportOverview {
  open: number;
  openComplaints: number;
  openInquiries: number;

  inProgress: number;
  inProgressComplaints: number;
  inProgressInquiries: number;

  resolved: number;
  resolvedComplaints: number;
  resolvedInquiries: number;

  closed: number;
  closedComplaints: number;
  closedInquiries: number;

  total: number;
  totalComplaints: number;
  totalInquiries: number;
}

export interface ExecutiveReportAging {
  code: string;
  label: string;
  slaTarget: string;
  averageAge: string;
  compliance: number;
  accentColor?: string;
}

export interface ExecutiveReportCategoryVolume {
  category: string;
  value: number;
}

export interface ExecutiveReportTicketVolume {
  year: number;
  monthIndex: number;
  month: string;
  open: number;
  inProgress: number;
  closed: number;
}

export interface ExecutiveReportOwnerWorkload {
  name: string;
  tickets: number;
}

export interface ExecutiveReportSlaBreach {
  breached: number;
  total: number;
  percentage: number;

  closedBreachRate: number;
  openedBreachRate: number;

  totalComplaints: number;
  totalInquiries: number;

  breachedComplaints: number;
  breachedInquiries: number;

  closedTickets: number;
  breachedClosed: number;

  closedComplaints: number;
  closedInquiries: number;

  closedBreachedComplaints: number;
  closedBreachedInquiries: number;

  openedTickets: number;
  breachedOpened: number;

  openedComplaints: number;
  openedInquiries: number;

  openedBreachedComplaints: number;
  openedBreachedInquiries: number;
}

export interface ExecutiveSummaryReport {
  report: {
    type: string;
    title: string;
    platform: string;

    generatedAt: string;
    generatedDate: string;
    generatedTime: string;
    timeZone: string;

    branding: {
      clientLogo: string;
      footerLeft: string;
      footerCenter: string;
    };

    dataScope: {
      overview: string;
      aging: string;
      categoryVolume: string;
      ticketVolume: string;
      ownerWorkload: string;
      slaBreach: string;
    };
  };

  overview: ExecutiveReportOverview;

  aging: ExecutiveReportAging[];

  categoryVolume: ExecutiveReportCategoryVolume[];

  ticketVolume: ExecutiveReportTicketVolume[];

  ownerWorkload: ExecutiveReportOwnerWorkload[];

  slaBreach: ExecutiveReportSlaBreach;
}

export interface ExecutiveSummaryApiResponse {
  success: boolean;
  data: ExecutiveSummaryReport;
}
