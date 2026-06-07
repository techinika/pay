import { useState, useEffect, useRef } from "react";
import type { PawaPayCountry } from "@/lib/pawapay/types";

type PaymentStatus = "idle" | "loading" | "pending_approval" | "success" | "error";
type PaymentMethod = "mobile_money" | "card";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export type { PaymentStatus, PaymentMethod };

export interface PaymentState {
  paymentStatus: PaymentStatus;
  paymentMessage: string;
  paymentMethod: PaymentMethod;
  availableCountries: PawaPayCountry[];
  countriesLoading: boolean;
  selectedCountry: string;
  phoneNumber: string;
  selectedProvider: string;
  selectedCurrency: string;
  predictedProvider: string;
  isPredicting: boolean;
  providerDropdownOpen: boolean;
  currencyDropdownOpen: boolean;
  providerAvailability: Record<string, string>;
  lastDepositId: string | null;
  email: string;
  cardName: string;
  providerRef: React.RefObject<HTMLDivElement | null>;
  currencyRef: React.RefObject<HTMLDivElement | null>;
  invoiceStatus: string;
  currentCountry: PawaPayCountry | undefined;
  availableProviders: PawaPayCountry["providers"];
  availableCurrencies: string[];
  disabled: boolean;
}

export interface PaymentSetters {
  setPaymentStatus: (s: PaymentStatus) => void;
  setPaymentMessage: (m: string) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  setSelectedCountry: (c: string) => void;
  setPhoneNumber: (p: string) => void;
  setSelectedProvider: (p: string) => void;
  setSelectedCurrency: (c: string) => void;
  setEmail: (e: string) => void;
  setCardName: (n: string) => void;
  setProviderDropdownOpen: (o: boolean) => void;
  setCurrencyDropdownOpen: (o: boolean) => void;
  setInvoiceStatus: (s: string) => void;
  setLastDepositId: (id: string) => void;
}

export function usePaymentState(statusProp: string): [PaymentState, PaymentSetters] {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile_money");

  const [availableCountries, setAvailableCountries] = useState<PawaPayCountry[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [predictedProvider, setPredictedProvider] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [providerAvailability, setProviderAvailability] = useState<Record<string, string>>({});
  const [lastDepositId, setLastDepositId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");

  const providerRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [invoiceStatus, setInvoiceStatus] = useState(statusProp);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) setProviderDropdownOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadConfig() {
      setCountriesLoading(true);
      try {
        const [configRes, availRes] = await Promise.all([
          fetch("/api/pawapay/config?operationType=DEPOSIT"),
          fetch("/api/pawapay/config?operationType=DEPOSIT"),
        ]);
        const configJson = await configRes.json();
        if (configJson.success && configJson.data?.countries) {
          setAvailableCountries(configJson.data.countries as PawaPayCountry[]);
        }
        const availJson = await availRes.json();
        if (availJson.success && Array.isArray(availJson.data)) {
          const map: Record<string, string> = {};
          for (const entry of availJson.data) {
            for (const p of entry.providers || []) {
              for (const [op, st] of Object.entries(p.operationTypes || {})) {
                map[p.provider] = st as string;
              }
            }
          }
          setProviderAvailability(map);
        }
      } catch (err) {
        console.error("Failed to load pawaPay config:", err);
      } finally {
        setCountriesLoading(false);
      }
    }
    loadConfig();
  }, []);

  const currentCountry = availableCountries.find((c) => c.country === selectedCountry);
  const availableProviders = currentCountry?.providers || [];
  const selectedProviderObj = availableProviders.find((p) => p.provider === selectedProvider);
  const availableCurrencies = selectedProviderObj?.currencies.map((c) => c.currency) || [];

  useEffect(() => {
    setSelectedProvider("");
    setSelectedCurrency("");
    setPredictedProvider("");
  }, [selectedCountry]);

  const debouncedPhone = useDebounce(phoneNumber, 400);

  useEffect(() => {
    if (!debouncedPhone || !currentCountry) return;
    const digits = debouncedPhone.replace(/\D/g, "");
    if (digits.length < 9) return;

    let cancelled = false;
    setIsPredicting(true);
    const prefix = currentCountry.prefix || "";
    const fullNumber = debouncedPhone.startsWith(prefix) ? debouncedPhone : prefix + debouncedPhone;

    fetch("/api/pawapay/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: fullNumber }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setPredictedProvider(json.provider);
          if (availableProviders.some((p) => p.provider === json.provider)) setSelectedProvider(json.provider);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsPredicting(false); });

    return () => { cancelled = true; };
  }, [debouncedPhone, currentCountry, availableProviders]);

  useEffect(() => {
    if (!lastDepositId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pawapay/check-deposit?depositId=${lastDepositId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const status = json.data.status;
          if (status === "COMPLETED") {
            setPaymentStatus("success");
            setPaymentMessage("Payment completed successfully!");
            setInvoiceStatus("confirmed");
            if (pollingRef.current) clearInterval(pollingRef.current);
          } else if (status === "FAILED") {
            setPaymentStatus("error");
            setPaymentMessage(json.data.failureReason?.failureMessage || "Payment failed.");
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }
      } catch {}
    }, 5000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [lastDepositId]);

  const disabled = paymentStatus === "loading" || paymentStatus === "pending_approval";

  const state: PaymentState = {
    paymentStatus, paymentMessage, paymentMethod,
    availableCountries, countriesLoading,
    selectedCountry, phoneNumber, selectedProvider, selectedCurrency,
    predictedProvider, isPredicting,
    providerDropdownOpen, currencyDropdownOpen,
    providerAvailability, lastDepositId,
    email, cardName, providerRef, currencyRef, invoiceStatus,
    currentCountry, availableProviders, availableCurrencies, disabled,
  };

  const setters: PaymentSetters = {
    setPaymentStatus, setPaymentMessage, setPaymentMethod,
    setSelectedCountry, setPhoneNumber, setSelectedProvider, setSelectedCurrency,
    setEmail, setCardName, setProviderDropdownOpen, setCurrencyDropdownOpen,
    setInvoiceStatus, setLastDepositId,
  };

  return [state, setters];
}
