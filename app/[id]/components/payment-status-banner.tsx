import { Loader2, Smartphone, CheckCircle, AlertTriangle } from "lucide-react";

type PaymentStatus =
  | "idle"
  | "loading"
  | "pending_approval"
  | "success"
  | "error";

interface PaymentStatusBannerProps {
  status: PaymentStatus;
  message: string;
  onDismiss?: () => void;
}

export function PaymentStatusBanner({ status, message, onDismiss }: PaymentStatusBannerProps) {
  if (status === "idle" || !message) return null;

  let icon: React.ReactNode;
  let classes: string;

  switch (status) {
    case "loading":
      icon = <Loader2 className="w-5 h-5 animate-spin" />;
      classes = "bg-blue-50 text-primary/80 border-blue-200";
      break;
    case "pending_approval":
      icon = <Smartphone className="w-5 h-5" />;
      classes = "bg-yellow-50 text-yellow-700 border-yellow-200";
      break;
    case "success":
      icon = <CheckCircle className="w-5 h-5" />;
      classes = "bg-green-50 text-green-700 border-green-200";
      break;
    case "error":
      icon = <AlertTriangle className="w-5 h-5" />;
      classes = "bg-red-50 text-red-700 border-red-200";
      break;
    default:
      return null;
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${classes}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      {status === "error" && onDismiss && (
        <button onClick={onDismiss} className="text-red-500 hover:text-red-700 text-sm font-medium shrink-0">
          Dismiss
        </button>
      )}
    </div>
  );
}
