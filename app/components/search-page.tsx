"use client";

import { useState } from "react";
import { Search, Receipt, AlertTriangle } from "lucide-react";
import { PaymentFeedback } from "./payment-feedback";
import { InvoiceCard } from "./invoice-card";

interface EventInfo {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface InvoiceItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  event?: EventInfo;
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(`/api/invoices?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PaymentFeedback />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Pay Techinika</h1>
          <p className="text-lg text-slate-600">Search for your invoice to make a payment</p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Invoice ID, Registration ID, or Email..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-8 py-3.5 bg-primary hover:bg-primary/80 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Search
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {searched && !loading && !error && (
          <>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">No invoices found</h2>
                <p className="text-slate-500">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  Found {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
                </p>
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    id={invoice.id}
                    amount={invoice.amount}
                    currency={invoice.currency}
                    status={invoice.status}
                    event={invoice.event}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
