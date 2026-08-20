"use client";

import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";

import NewCustomerForm from "@/components/customers/NewCustomerForm";
import CustomerImportModal from "@/components/customers/CustomerImportModal";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [showImportModal, setShowImportModal] = useState(false);

  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="page-header">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-ghost !px-3 !py-2"
                title="Go back"
              >
                <ArrowLeft size={17} />
              </button>

              <div>
                <h1 className="page-title">New Customer</h1>

                <p className="page-description">
                  Add a new customer record to the database.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="
            flex items-center gap-2
            rounded-xl
            border border-slate-200
            bg-white
            px-4 py-2.5
            text-sm font-semibold
            text-slate-700
            shadow-sm
            transition
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
          "
        >
          <Upload size={17} />
          Import Customers
        </button>
      </div>

      <NewCustomerForm />

      <CustomerImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
