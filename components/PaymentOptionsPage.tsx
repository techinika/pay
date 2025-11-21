"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Phone,
} from "lucide-react";

type PaymentStatus =
  | "idle"
  | "loading"
  | "pending_approval"
  | "success"
  | "error";

interface SubmissionData {
  orderId?: string;
  amount?: string;
  phoneNumber?: string;
  error?: string;
}

interface PaymentFormProps {
  onPaymentSubmit: (data: SubmissionData) => void;
  status: PaymentStatus;
  message: string;
}

const generateOrderId = (): string => {
  const timestamp = Date.now();
  return `UB-LABS-P${timestamp}`;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  onPaymentSubmit,
  status,
  message,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // Determine if inputs should be disabled during processing
  const isDisabled: boolean =
    status === "loading" || status === "pending_approval";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phoneNumber || !amount) {
      // In a real app, use a custom modal instead of alert
      console.error("Please enter a valid phone number and amount.");
      onPaymentSubmit({
        error: "Please fill in both phone number and amount fields.",
      });
      return;
    }

    // Basic validation for Rwandan number format (e.g., 078XXXXXXX or 073XXXXXXX)
    const phoneRegex: RegExp = /^(078|073|079)\d{7}$/;
    const amountValue: number = parseFloat(amount);

    if (!phoneRegex.test(phoneNumber)) {
      onPaymentSubmit({
        error:
          "Invalid phone number format. Use 078/073/079 followed by 7 digits.",
      });
      return;
    }

    if (isNaN(amountValue) || amountValue <= 0) {
      onPaymentSubmit({ error: "Invalid amount. Must be a positive number." });
      return;
    }

    const orderId: string = generateOrderId();
    onPaymentSubmit({ orderId, amount, phoneNumber });
  };

  const getButtonText = useMemo(() => {
    switch (status) {
      case "loading":
        return (
          <span className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Connecting...
          </span>
        );
      case "pending_approval":
        return "Waiting for Approval...";
      case "success":
        return "Payment Succeeded!";
      case "error":
        return "Try Payment Again";
      default:
        return "Pay with Mobile Money (RWF)";
    }
  }, [status]);

  const getStatusDisplay = useMemo(() => {
    if (status === "idle") return null;

    let icon: React.ReactNode;
    let classes: string;

    switch (status) {
      case "loading":
        icon = <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
        classes = "bg-blue-50 text-blue-700";
        break;
      case "pending_approval":
        icon = <Phone className="w-5 h-5 text-yellow-500" />;
        classes = "bg-yellow-50 text-yellow-700";
        break;
      case "success":
        icon = <CheckCircle className="w-5 h-5 text-green-500" />;
        classes = "bg-green-50 text-green-700";
        break;
      case "error":
        icon = <AlertTriangle className="w-5 h-5 text-red-500" />;
        classes = "bg-red-50 text-red-700";
        break;
      default:
        return null;
    }

    return (
      <div
        className={`p-4 mt-6 rounded-lg flex items-start space-x-3 transition-all duration-300 ${classes}`}
      >
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
    );
  }, [status, message]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-extrabold text-blue-900">Techinika Pay</h1>
      </div>
      <p className="text-gray-500 mb-8 text-center">
        Pay easily using Rwandan Mobile Money (MTN or Airtel/Tigo). Card
        payments coming soon!
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Mobile Money Phone Number (e.g., 078xxxxxxx)
            </label>
            <div className="mt-1">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhoneNumber(e.target.value)
                }
                disabled={isDisabled}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition duration-150"
                placeholder="078xxxxxxx"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount (RWF)
            </label>
            <div className="mt-1">
              <input
                id="amount"
                name="amount"
                type="number"
                required
                min="100"
                step="1"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAmount(e.target.value)
                }
                disabled={isDisabled}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition duration-150"
                placeholder="5000"
              />
            </div>
          </div>
        </div>

        {getStatusDisplay}

        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full flex justify-center py-3 px-4 mt-8 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white transition duration-200
            ${
              isDisabled
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-lg"
            }
          `}
        >
          {getButtonText}
        </button>
      </form>
      <div className="mt-4 text-center text-xs text-gray-400">
        {/* Use optional chaining for window.currentOrderId for safety */}
        Transaction ID (on submission):{" "}
        {status === "idle"
          ? "Pending"
          : (window as any).currentOrderId || "N/A"}
      </div>
    </div>
  );
};

const PayPage: React.FC = () => {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const mockApiCall = useCallback(async (payload: SubmissionData) => {
    setStatus("loading");
    setMessage("Connecting to payment gateway...");
    currentOrderId = payload.orderId;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      if (payload.phoneNumber === "0780000000") {
        throw new Error("Phone number blocked for test failure.");
      }

      const { orderId, amount, phoneNumber } =
        payload as Required<SubmissionData>;

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          message: "Payment initiated successfully.",
          ref: "mock-ref-12345",
        }),
      };

      const response = await mockResponse.json();

      setStatus("pending_approval");
      setMessage(
        `Message sent to ${phoneNumber}. Please check your phone and approve the payment of ${amount} RWF.`
      );

      await new Promise((resolve) => setTimeout(resolve, 8000)); // Wait 8 seconds for approval

      setStatus("success");
      setMessage(
        `🎉 Payment successful! Transaction ID: ${orderId}. Thank yourself for your payment of ${amount} RWF.`
      );
    } catch (error) {
      setStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage(`Payment failed: ${errorMessage}. Please try again.`);
    }
  }, []);

  const handlePaymentSubmit = useCallback(
    (data: SubmissionData) => {
      if (data.error) {
        setStatus("error");
        setMessage(data.error);
        return;
      }

      if (data.orderId && data.amount && data.phoneNumber) {
        mockApiCall({
          orderId: data.orderId,
          amount: data.amount,
          phoneNumber: data.phoneNumber,
        });
      } else {
        // Should not happen if client-side validation passes, but good for safety
        setStatus("error");
        setMessage("Missing transaction details.");
      }
    },
    [mockApiCall]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <PaymentForm
        onPaymentSubmit={handlePaymentSubmit}
        status={status}
        message={message}
      />
    </div>
  );
};

export default PayPage;
