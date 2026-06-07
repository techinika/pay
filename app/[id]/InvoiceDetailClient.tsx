"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, Smartphone, CreditCard } from "lucide-react";
import { InvoiceHeader } from "./components/invoice-header";
import { InvoiceDetails } from "./components/invoice-details";
import { InvoiceSummary } from "./components/invoice-summary";
import { PaymentStatusBanner } from "./components/payment-status-banner";
import { MobileMoneyForm } from "./components/mobile-money-form";
import { CardPaymentForm } from "./components/card-payment-form";
import { usePaymentState } from "./components/use-payment-state";

interface EventInfo {
  id: string; title: string; description: string; start_date: string;
  end_date: string; location: string;
}

interface Invoice {
  id: string; amount: number; currency: string; status: string; created_at: string;
  registration?: { id: string; status: string; answers: Record<string, unknown>; created_at: string; event?: EventInfo; };
  userDetails?: { name: string; email: string; image_url: string | null; username: string | null; };
}

interface Props { invoice: Invoice | null; }

export default function InvoiceDetailClient({ invoice }: Props) {
  const [st, set] = usePaymentState(invoice?.status || "");
  const statusLower = st.invoiceStatus.toLowerCase();
  const isPaid = statusLower === "confirmed" || statusLower === "paid";
  const isCancelled = statusLower === "cancelled";
  const canPay = !isPaid && !isCancelled;

  const handleMobileMoneyPayment = async () => {
    if (!st.selectedCountry) { set.setPaymentStatus("error"); set.setPaymentMessage("Please select your country"); return; }
    if (!st.phoneNumber.trim()) { set.setPaymentStatus("error"); set.setPaymentMessage("Please enter your phone number"); return; }
    if (!st.selectedProvider) { set.setPaymentStatus("error"); set.setPaymentMessage("Please select your mobile money provider"); return; }
    if (!st.selectedCurrency) { set.setPaymentStatus("error"); set.setPaymentMessage("Please select a currency"); return; }
    if (st.providerAvailability[st.selectedProvider] === "CLOSED") {
      set.setPaymentStatus("error"); set.setPaymentMessage("This provider is currently unavailable. Please try again later."); return;
    }
    set.setPaymentStatus("loading"); set.setPaymentMessage("");
    try {
      const invoiceId = invoice?.id;
      if (!invoiceId) throw new Error("Invoice not found");
      const res = await fetch("/api/pawapay/deposit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount: invoice.amount, currency: st.selectedCurrency, phoneNumber: st.phoneNumber, provider: st.selectedProvider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      set.setLastDepositId(data.depositId);
      set.setPaymentStatus("pending_approval");
      set.setPaymentMessage("Payment request sent! Please check your phone and enter your PIN to approve the transaction.");
    } catch (error) {
      set.setPaymentStatus("error");
      set.setPaymentMessage(error instanceof Error ? error.message : "Payment failed. Please try again.");
    }
  };

  const handleCardPayment = async () => {
    if (!st.email.trim()) { set.setPaymentStatus("error"); set.setPaymentMessage("Please enter your email address"); return; }
    set.setPaymentStatus("loading"); set.setPaymentMessage("");
    try {
      const invoiceId = invoice?.id;
      if (!invoiceId) throw new Error("Invoice not found");
      const res = await fetch("/api/pesapal/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount: invoice.amount, currency: invoice.currency, email: st.email.trim(), phoneNumber: "", firstName: st.cardName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Card payment initiation failed");
      if (data.redirectUrl) window.location.href = data.redirectUrl;
    } catch (error) {
      set.setPaymentStatus("error");
      set.setPaymentMessage(error instanceof Error ? error.message : "Card payment failed. Please try again.");
    }
  };

  if (!invoice) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Invoice Not Found</h1>
        <p className="text-slate-600 mb-6">The invoice you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Search</Link>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-50 ${!isPaid && !isCancelled ? "watermark" : ""}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"><ArrowLeft className="w-4 h-4" />Back to Search</Link>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <InvoiceHeader title={invoice.registration?.event?.title || "Event Invoice"}
            invoiceId={invoice.id.slice(0, 8).toUpperCase()}
            isPaid={isPaid} isCancelled={isCancelled} />
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <InvoiceDetails event={invoice.registration?.event} user={invoice.userDetails} />
              <div className="w-full md:w-72">
                <InvoiceSummary id={invoice.id} created_at={invoice.created_at} amount={invoice.amount}
                  currency={invoice.currency} isPaid={isPaid} isCancelled={isCancelled} />
              </div>
            </div>
            {canPay && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Make Payment</h2>
                <p className="text-slate-600 mb-6 text-sm">Choose your payment method</p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <button onClick={() => set.setPaymentMethod("mobile_money")}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-semibold transition-colors ${st.paymentMethod === "mobile_money" ? "border-primary bg-blue-50 text-primary/80" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                    disabled={st.disabled}><Smartphone className="w-5 h-5" />Mobile Money (pawaPay)</button>
                  <button onClick={() => set.setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-semibold transition-colors ${st.paymentMethod === "card" ? "border-primary bg-blue-50 text-primary/80" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                    disabled={st.disabled}><CreditCard className="w-5 h-5" />Card Payment (PesaPal)</button>
                </div>
                {st.paymentMethod === "mobile_money" ? (
                  <MobileMoneyForm invoiceId={invoice.id} invoiceAmount={invoice.amount} invoiceCurrency={invoice.currency}
                    disabled={st.disabled} countriesLoading={st.countriesLoading}
                    availableCountries={st.availableCountries} selectedCountry={st.selectedCountry}
                    onCountryChange={set.setSelectedCountry} phoneNumber={st.phoneNumber}
                    onPhoneNumberChange={set.setPhoneNumber} selectedProvider={st.selectedProvider}
                    onProviderChange={set.setSelectedProvider} selectedCurrency={st.selectedCurrency}
                    onCurrencyChange={set.setSelectedCurrency} isPredicting={st.isPredicting}
                    predictedProvider={st.predictedProvider} providerDropdownOpen={st.providerDropdownOpen}
                    onProviderDropdownToggle={set.setProviderDropdownOpen} currencyDropdownOpen={st.currencyDropdownOpen}
                    onCurrencyDropdownToggle={set.setCurrencyDropdownOpen} providerAvailability={st.providerAvailability}
                    providerRef={st.providerRef} currencyRef={st.currencyRef} currentCountry={st.currentCountry}
                    availableProviders={st.availableProviders} availableCurrencies={st.availableCurrencies}
                    paymentStatus={st.paymentStatus} onPay={handleMobileMoneyPayment} />
                ) : (
                  <CardPaymentForm invoiceAmount={invoice.amount} invoiceCurrency={invoice.currency}
                    disabled={st.disabled} email={st.email} onEmailChange={set.setEmail}
                    cardName={st.cardName} onCardNameChange={set.setCardName}
                    paymentStatus={st.paymentStatus} onPay={handleCardPayment} />
                )}
                <div className="mt-4"><PaymentStatusBanner status={st.paymentStatus} message={st.paymentMessage} /></div>
                {st.paymentStatus === "error" && (
                  <button onClick={() => { set.setPaymentStatus("idle"); set.setPaymentMessage(""); }}
                    className="mt-2 text-sm text-primary hover:text-primary/80 font-medium">Try again</button>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-slate-400 mt-8">Mobile Money by pawaPay &middot; Cards by PesaPal</p>
      </div>
    </div>
  );
}
