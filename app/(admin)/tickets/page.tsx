"use client";
import DashboardHeader from "@/components/DashboardHeader";
import TicketTable, { TicketTableRef } from "@/components/tickets/TicketTable";

import { useRef } from "react";

export default function TicketsPage() {
  const tableRef = useRef<TicketTableRef>(null);

  return (
    <div className="space-y-8">
      <DashboardHeader
        header="Ticket Management"
        page={2}
        onExport={() => tableRef.current?.exportPdf()}
        onExportCsv={() => tableRef.current?.exportCsv()}
      />

      <TicketTable ref={tableRef} />
    </div>
  );
}
