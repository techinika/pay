import Link from "next/link";
import { Receipt, MapPin, Calendar, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface EventInfo {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface InvoiceCardProps {
  id: string;
  amount: number;
  currency: string;
  status: string;
  event?: EventInfo;
}

export function InvoiceCard({ id, amount, currency, status, event }: InvoiceCardProps) {
  const statusLower = status?.toLowerCase();
  const isPaid = statusLower === "confirmed" || statusLower === "paid";
  const isCancelled = statusLower === "cancelled";

  return (
    <Link
      href={`/${id}`}
      className="block bg-white rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden group"
    >
      <div className="p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shrink-0">
          <Receipt className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{event?.title || "Invoice"}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            {event?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
            {event?.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(event.start_date)}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-slate-900">{formatCurrency(amount, currency)}</p>
          <span
            className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isPaid ? "bg-green-100 text-green-700" : isCancelled ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isPaid ? "PAID" : isCancelled ? "CANCELLED" : "UNPAID"}
          </span>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
      </div>
    </Link>
  );
}
