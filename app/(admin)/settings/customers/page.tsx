"use client";
import { useRef } from "react";
import DashboardHeader from "@/components/DashboardHeader";
// import CustomerManagementTable from "@/components/customers/CustomerManagementTable";
import CustomerManagementTable, {
  CustomerManagementTableRef,
} from "@/components/customers/CustomerManagementTable";

export default function DashboardPage() {
  const customerTableRef = useRef<CustomerManagementTableRef>(null);
  return (
    <div className="1">
      <DashboardHeader
        header="Customer Management"
        page={51}
        onExport={() => customerTableRef.current?.exportPdf()}
        onExportCsv={() => customerTableRef.current?.exportCsv()}
      />

      <CustomerManagementTable ref={customerTableRef} />

      <section className=".white-card mt-4">
        <h4 className="font-semibold text-gray-500">Last Updated</h4>

        <p className="mt-2 text-grey-500">19 July 2026 • 02:45 PM</p>
      </section>
    </div>
  );
}
