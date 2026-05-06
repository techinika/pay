"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  MapPin,
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Phone,
} from "lucide-react";

interface EventInfo {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  image_url: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  registration?: {
    id: string;
    status: string;
    answers: Record<string, unknown>;
    created_at: string;
    event?: EventInfo;
  };
  userDetails?: {
    name: string;
    email: string;
    image_url: string | null;
    username: string | null;
  };
}

interface InvoiceDetailClientProps {
  invoice: Invoice | null;
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
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PaymentStatus =
  | "idle"
  | "loading"
  | "pending_approval"
  | "success"
  | "error";

export default function InvoiceDetailClient({
  invoice,
}: InvoiceDetailClientProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Invoice Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The invoice you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const statusLower = invoice.status?.toLowerCase();
  const isPaid = statusLower === "confirmed" || statusLower === "paid";
  const isCancelled = statusLower === "cancelled";
  const canPay = !isPaid && !isCancelled;

  const getStatusDisplay = () => {
    if (isPaid) {
      return (
        <div className="inline-flex text-center items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
          <CheckCircle className="w-5 h-5" />
          PAID
        </div>
      );
    }
    if (isCancelled) {
      return (
        <div className="inline-flex text-center items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold">
          CANCELLED
        </div>
      );
    }
    return (
      <div className="inline-flex text-center items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
        UNPAID
      </div>
    );
  };

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      setPaymentStatus("error");
      setPaymentMessage("Please enter your phone number");
      return;
    }

    const phoneRegex = /^(078|073|079)\d{7}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setPaymentStatus("error");
      setPaymentMessage(
        "Invalid phone number. Use 078/073/079 followed by 7 digits.",
      );
      return;
    }

    setPaymentStatus("loading");
    setPaymentMessage("");

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `INV-${invoice.id.slice(0, 8)}`,
          amount: invoice.amount,
          phoneNumber: phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      if (data.message?.includes("success")) {
        setPaymentStatus("success");
        setPaymentMessage(
          "Payment initiated successfully! Please check your phone to confirm.",
        );
      } else {
        setPaymentStatus("pending_approval");
        setPaymentMessage(
          "Payment request sent. Please check your phone and approve the transaction.",
        );
      }
    } catch (error) {
      setPaymentStatus("error");
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.",
      );
    }
  };

  const getPaymentStatusDisplay = () => {
    if (paymentStatus === "idle") return null;

    let icon: React.ReactNode;
    let classes: string;

    switch (paymentStatus) {
      case "loading":
        icon = <Loader2 className="w-5 h-5 animate-spin" />;
        classes = "bg-blue-50 text-primary/80 border-blue-200";
        break;
      case "pending_approval":
        icon = <Phone className="w-5 h-5" />;
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
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border ${classes}`}
      >
        <div className="shrink-0 mt-0.5">{icon}</div>
        <p className="text-sm font-medium">{paymentMessage}</p>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 ${!isPaid && !isCancelled ? "watermark" : ""}`}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {invoice.registration?.event?.image_url ? (
                  <img
                    src={invoice.registration.event.image_url}
                    alt={invoice.registration.event.title}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                    <Receipt className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {invoice.registration?.event?.title || "Event Invoice"}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              {getStatusDisplay()}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                    Event Details
                  </h2>
                  <div className="space-y-3">
                    {invoice.registration?.event && (
                      <>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {formatDate(
                                invoice.registration.event.start_date,
                              )}
                            </p>
                            {invoice.registration.event.end_date && (
                              <p className="text-sm text-slate-500">
                                to{" "}
                                {formatDate(
                                  invoice.registration.event.end_date,
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        {invoice.registration.event.location && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                            <p className="text-slate-700">
                              {invoice.registration.event.location}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {invoice.userDetails && (
                  <div>
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                      Customer
                    </h2>
                    <div className="flex items-center gap-3">
                      {invoice.userDetails.image_url ? (
                        <img
                          src={invoice.userDetails.image_url}
                          alt={invoice.userDetails.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-500 font-medium">
                            {invoice.userDetails.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">
                          {invoice.userDetails.name}
                        </p>
                        {invoice.userDetails.email && (
                          <p className="text-sm text-slate-500">
                            {invoice.userDetails.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full md:w-72">
                <div className="bg-slate-50 rounded-xl p-5">
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                    Invoice Summary
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Invoice ID</span>
                      <span className="text-slate-900 text-xs">
                        {invoice.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Created</span>
                      <span className="text-slate-900">
                        {formatDateTime(invoice.created_at)}
                      </span>
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
                        <span className="text-lg font-semibold text-slate-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-slate-900">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {canPay && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Make Payment
                </h2>
                <p className="text-slate-600 mb-6 text-sm">
                  Choose your preferred payment method below
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <button className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-primary bg-blue-50 text-primary/80 font-semibold hover:bg-blue-100 transition-colors">
                    <Smartphone className="w-5 h-5" />
                    Mobile Money (M-Pesa)
                  </button>
                  <button className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors">
                    <CreditCard className="w-5 h-5" />
                    Card Payment
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Mobile Money Phone Number
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="078xxxxxxx"
                      className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    <button
                      onClick={handlePayment}
                      disabled={
                        paymentStatus === "loading" ||
                        paymentStatus === "pending_approval"
                      }
                      className="px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {paymentStatus === "loading" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : paymentStatus === "pending_approval" ? (
                        "Waiting..."
                      ) : (
                        `Pay ${formatCurrency(invoice.amount, invoice.currency)}`
                      )}
                    </button>
                  </div>
                  {getPaymentStatusDisplay()}
                  <p className="text-xs text-slate-500 mt-3">
                    Supported networks: MTN, Airtel
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Made for Techinika Customers
        </p>
      </div>
    </div>
  );
}
