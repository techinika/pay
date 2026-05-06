"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Receipt,
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface EventInfo {
  id: string;
  title: string;
  start_date: string;
  location: string;
  image_url: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  event?: EventInfo;
  user?: {
    name: string;
    image_url: string | null;
    username: string | null;
  };
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === "RWF" || currency === "rwf") {
    return `RWF ${amount.toLocaleString()}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status: string) {
  const statusLower = status?.toLowerCase();

  if (statusLower === "confirmed" || statusLower === "paid") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        PAID
      </span>
    );
  }

  if (statusLower === "cancelled") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      UNPAID
    </span>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/invoices?q=${encodeURIComponent(query.trim())}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to search");
      }

      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-6">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Find Your Invoice
          </h1>
          <p className="text-slate-600 text-lg max-w-md mx-auto">
            Search by your email address or invoice ID to view and pay for your
            event tickets
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email or invoice ID"
                className="w-full pl-12 pr-4 py-3.5 text-lg rounded-xl border border-slate-200 focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-8 py-3.5 bg-primary hover:bg-primary/80 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {hasSearched && !loading && invoices.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No invoices found
            </h3>
            <p className="text-slate-500">
              Try searching with a different email or invoice ID
            </p>
          </div>
        )}

        {invoices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">
              Found {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </h2>
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/${invoice.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 hover:border-blue-300 transition-all p-5 group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {invoice.event?.image_url ? (
                      <img
                        src={invoice.event.image_url}
                        alt={invoice.event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center">
                        <Receipt className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {invoice.event?.title || "Event"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {invoice.event?.start_date
                            ? formatDate(invoice.event.start_date)
                            : formatDate(invoice.created_at)}
                        </span>
                        {invoice.event?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {invoice.event.location}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        ID: {invoice.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <span className="text-xl font-bold text-slate-900">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(invoice.status)}
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
