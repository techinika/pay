import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CardPaymentFormProps {
  invoiceAmount: number;
  invoiceCurrency: string;
  disabled: boolean;
  email: string;
  onEmailChange: (email: string) => void;
  cardName: string;
  onCardNameChange: (name: string) => void;
  paymentStatus: string;
  onPay: () => void;
}

export function CardPaymentForm({
  invoiceAmount,
  invoiceCurrency,
  disabled,
  email,
  onEmailChange,
  cardName,
  onCardNameChange,
  paymentStatus,
  onPay,
}: CardPaymentFormProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 space-y-4">
      <p className="text-sm text-slate-500">
        Pay securely with your credit or debit card via PesaPal
      </p>
      <div>
        <label htmlFor="card-email" className="block text-sm font-medium text-slate-700 mb-2">
          Email Address
        </label>
        <input
          id="card-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={disabled}
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100"
        />
      </div>
      <div>
        <label htmlFor="card-name" className="block text-sm font-medium text-slate-700 mb-2">
          Full Name (on card)
        </label>
        <input
          id="card-name"
          type="text"
          value={cardName}
          onChange={(e) => onCardNameChange(e.target.value)}
          disabled={disabled}
          placeholder="John Doe"
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100"
        />
      </div>
      <button
        onClick={onPay}
        disabled={disabled}
        className="w-full px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {paymentStatus === "loading" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          `Pay ${formatCurrency(invoiceAmount, invoiceCurrency)} with Card`
        )}
      </button>
    </div>
  );
}
