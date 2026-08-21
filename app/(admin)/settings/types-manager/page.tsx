"use client";

import { useState } from "react";
import { Layers3, Tags } from "lucide-react";

import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/layout/Footer";

import CategoryManager from "@/components/settings/category-manager/CategoryManager";
import ScopeManager from "@/components/settings/scope-manager/ScopeManager";

type Tab = "scopes" | "categories";

export default function TypesManagerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("scopes");

  return (
    <div className="space-y-8">
      <DashboardHeader header="Other Settings" page={71} />

      {/* -------------------------------------------------
          TABS
      -------------------------------------------------- */}

      <div className="px-1">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          {/* Scopes */}

          <button
            type="button"
            onClick={() => setActiveTab("scopes")}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "scopes"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layers3 size={17} />
            Scopes
          </button>

          {/* Categories */}

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "categories"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Tags size={17} />
            Categories
          </button>
        </div>
      </div>

      {/* -------------------------------------------------
          TAB CONTENT
      -------------------------------------------------- */}

      {activeTab === "scopes" && <ScopeManager />}

      {activeTab === "categories" && <CategoryManager />}

      <Footer />
    </div>
  );
}
