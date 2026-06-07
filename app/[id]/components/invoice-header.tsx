import { Receipt, CheckCircle } from "lucide-react";

interface InvoiceHeaderProps {
  title: string;
  invoiceId: string;
  imageUrl?: string | null;
  isPaid: boolean;
  isCancelled: boolean;
}

export function InvoiceHeader({ title, invoiceId, imageUrl, isPaid, isCancelled }: InvoiceHeaderProps) {
  const statusBadge = () => {
    if (isPaid) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
          <CheckCircle className="w-5 h-5" />
          PAID
        </div>
      );
    }
    if (isCancelled) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold">
          CANCELLED
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
        UNPAID
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-blue-100 text-sm">Invoice #{invoiceId}</p>
          </div>
        </div>
        {statusBadge()}
      </div>
    </div>
  );
}
