import { ChevronDown, Globe, Loader2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PawaPayCountry, PawaPayProvider } from "@/lib/pawapay/types";

interface MMProps {
  invoiceId: string; invoiceAmount: number; invoiceCurrency: string;
  disabled: boolean; countriesLoading: boolean;
  availableCountries: PawaPayCountry[]; selectedCountry: string;
  onCountryChange: (c: string) => void; phoneNumber: string;
  onPhoneNumberChange: (p: string) => void; selectedProvider: string;
  onProviderChange: (p: string) => void; selectedCurrency: string;
  onCurrencyChange: (c: string) => void; isPredicting: boolean;
  predictedProvider: string; providerDropdownOpen: boolean;
  onProviderDropdownToggle: (o: boolean) => void; currencyDropdownOpen: boolean;
  onCurrencyDropdownToggle: (o: boolean) => void;
  providerAvailability: Record<string, string>;
  providerRef: React.RefObject<HTMLDivElement | null>;
  currencyRef: React.RefObject<HTMLDivElement | null>;
  currentCountry: PawaPayCountry | undefined;
  availableProviders: PawaPayProvider[]; availableCurrencies: string[];
  paymentStatus: string; onPay: () => void;
}

function ProviderList({ providers, selected, predicted, availability, onSelect, onClose }: {
  providers: PawaPayProvider[]; selected: string; predicted: string;
  availability: Record<string, string>; onSelect: (p: string) => void; onClose: () => void;
}) {
  return (
    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
      {providers.map((p) => {
        const closed = availability[p.provider] === "CLOSED";
        return (
          <button key={p.provider} type="button" disabled={closed}
            onClick={() => { if (!closed) { onSelect(p.provider); onClose(); } }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selected === p.provider ? "bg-blue-50 text-primary" : closed ? "text-slate-300 cursor-not-allowed" : "text-slate-700 hover:bg-slate-50"}`}>
            {p.logo && <img src={p.logo} alt={p.displayName} className="w-6 h-6 object-contain" />}
            <span className="font-medium">{p.displayName}</span>
            {closed && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full ml-auto">Unavailable</span>}
            {!closed && predicted === p.provider && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">Predicted</span>}
          </button>
        );
      })}
    </div>
  );
}

function CurrencyList({ currencies, selected, invCur, onSelect, onClose }: {
  currencies: string[]; selected: string; invCur: string; onSelect: (c: string) => void; onClose: () => void;
}) {
  return (
    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
      {currencies.map((cur) => (
        <button key={cur} type="button"
          onClick={() => { onSelect(cur); onClose(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${selected === cur ? "bg-blue-50 text-primary" : "text-slate-700"}`}>
          <Globe className="w-4 h-4" /><span className="font-medium">{cur}</span>
          {cur === invCur && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-auto">Invoice</span>}
        </button>
      ))}
    </div>
  );
}

export function MobileMoneyForm(props: MMProps) {
  const {
    disabled, countriesLoading, selectedCountry, onCountryChange, availableCountries,
    phoneNumber, onPhoneNumberChange, currentCountry, selectedProvider, onProviderChange,
    isPredicting, predictedProvider, providerDropdownOpen, onProviderDropdownToggle,
    providerAvailability, providerRef, availableProviders, selectedCurrency, onCurrencyChange,
    currencyDropdownOpen, onCurrencyDropdownToggle, currencyRef, availableCurrencies,
    paymentStatus, invoiceAmount, invoiceCurrency, onPay,
  } = props;

  if (countriesLoading) return (
    <div className="bg-slate-50 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />Loading available countries...
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 rounded-xl p-6 space-y-4">
      <div>
        <label htmlFor="country-select" className="block text-sm font-medium text-slate-700 mb-2">Country</label>
        <select id="country-select" value={selectedCountry} onChange={(e) => onCountryChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
          <option value="">Select your country</option>
          {availableCountries.map((c) => <option key={c.country} value={c.country}>{c.displayName.en} (+{c.prefix})</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="phone-input" className="block text-sm font-medium text-slate-700 mb-2">Mobile Money Phone Number</label>
        <div className="flex gap-2">
          {currentCountry && <div className="flex items-center px-3 bg-white rounded-lg border border-slate-200 text-slate-600 font-medium text-sm">+{currentCountry.prefix}</div>}
          <input id="phone-input" type="tel" value={phoneNumber} onChange={(e) => onPhoneNumberChange(e.target.value)}
            disabled={disabled || !selectedCountry}
            placeholder={currentCountry ? `${currentCountry.prefix}xxxxxxx` : "Phone number"}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100" />
        </div>
      </div>

      <div ref={providerRef} className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Money Provider</label>
        <button type="button" onClick={() => onProviderDropdownToggle(!providerDropdownOpen)}
          disabled={disabled || availableProviders.length === 0}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100">
          <span className={selectedProvider ? "text-slate-900" : "text-slate-400"}>
            {selectedProvider ? availableProviders.find((p) => p.provider === selectedProvider)?.displayName || selectedProvider
              : isPredicting ? "Detecting provider..." : "Select provider"}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${providerDropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {providerDropdownOpen && availableProviders.length > 0 && (
          <ProviderList providers={availableProviders} selected={selectedProvider} predicted={predictedProvider}
            availability={providerAvailability} onSelect={onProviderChange} onClose={() => onProviderDropdownToggle(false)} />
        )}
      </div>

      <div ref={currencyRef} className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
        <button type="button" onClick={() => onCurrencyDropdownToggle(!currencyDropdownOpen)}
          disabled={disabled || availableCurrencies.length === 0}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-primary/70 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100">
          <span className={selectedCurrency ? "text-slate-900" : "text-slate-400"}>{selectedCurrency || "Select currency"}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${currencyDropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {currencyDropdownOpen && availableCurrencies.length > 0 && (
          <CurrencyList currencies={availableCurrencies} selected={selectedCurrency} invCur={invoiceCurrency}
            onSelect={onCurrencyChange} onClose={() => onCurrencyDropdownToggle(false)} />
        )}
      </div>

      <button onClick={onPay} disabled={disabled}
        className="w-full px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
        {paymentStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" />
          : paymentStatus === "pending_approval"
            ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Waiting for approval...</span>
            : `Pay ${formatCurrency(invoiceAmount, selectedCurrency || invoiceCurrency)}`}
      </button>
    </div>
  );
}
