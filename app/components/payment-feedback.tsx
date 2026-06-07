"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export function PaymentFeedback() {
  const [feedback, setFeedback] = useState<{ type: "success" | "failed" | null }>({ type: null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success" || payment === "failed") {
      setFeedback({ type: payment });
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
      if (payment === "success") setTimeout(() => setFeedback({ type: null }), 8000);
    }
  }, []);

  if (!feedback.type) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border transition-all ${
        feedback.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {feedback.type === "success" ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
      <p className="font-semibold">
        {feedback.type === "success" ? "Payment completed successfully!" : "Payment failed. Please try again."}
      </p>
      <button onClick={() => setFeedback({ type: null })} className="ml-2 text-current opacity-60 hover:opacity-100">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
