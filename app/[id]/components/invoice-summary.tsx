import { formatCurrency, formatDateTime } from "@/lib/utils";

interface InvoiceSummaryProps {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  isCancelled: boolean;
}

export function InvoiceSummary({ id, created_at, amount, currency, isPaid, isCancelled }: InvoiceSummaryProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-5">
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
        Invoice Summary
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Invoice ID</span>
          <span className="text-slate-900 text-xs">{id.slice(0, 8)}...</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Created</span>
          <span className="text-slate-900">{formatDateTime(created_at)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Status</span>
          <span
            className={
              isPaid
                ? "text-green-600 font-medium"
                : isCancelled
                  ? "text-red-600 font-medium"
                  : "text-yellow-600 font-medium"
            }
          >
            {isPaid ? "PAID" : isCancelled ? "Cancelled" : "UNPAID"}
          </span>
        </div>
        <div className="border-t border-slate-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
