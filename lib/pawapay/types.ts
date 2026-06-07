export interface PawaPayCountry {
  country: string;
  prefix: string;
  flag: string;
  displayName: { en: string; fr?: string };
  providers: PawaPayProvider[];
}

export interface PawaPayProvider {
  provider: string;
  displayName: string;
  logo: string;
  nameDisplayedToCustomer?: string;
  currencies: PawaPayCurrency[];
}

export interface PawaPayCurrency {
  currency: string;
  displayName: string;
  operationTypes: Record<
    string,
    {
      status?: string;
      decimalsInAmount?: "NONE" | "TWO_PLACES";
      minAmount?: string;
      maxAmount?: string;
      authType?: string;
      pinPrompt?: string;
      pinPromptRevivable?: boolean;
    }
  >;
}

export interface ActiveConfResponse {
  companyName: string;
  countries: PawaPayCountry[];
}

export interface PredictProviderRequest {
  phoneNumber: string;
}

export interface PredictProviderResponse {
  country: string;
  provider: string;
  phoneNumber: string;
}

export interface DepositPayer {
  type: "MMO";
  accountDetails: {
    phoneNumber: string;
    provider: string;
  };
}

export interface InitiateDepositRequest {
  depositId: string;
  amount: string;
  currency: string;
  payer: DepositPayer;
  customerMessage?: string;
  metadata?: Record<string, string>;
}

export interface InitiateDepositResponse {
  depositId: string;
  status: "ACCEPTED" | "REJECTED" | "DUPLICATE_IGNORED";
  nextStep?: string;
  created?: string;
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
}

export interface DepositData {
  depositId: string;
  status: string;
  amount: string;
  currency: string;
  country: string;
  payer: DepositPayer;
  customerMessage?: string;
  created: string;
  providerTransactionId?: string;
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
}

export interface CheckDepositResponse {
  status: "FOUND" | "NOT_FOUND";
  data?: DepositData;
}

export interface PayoutRecipient {
  type: "MMO";
  accountDetails: {
    phoneNumber: string;
    provider: string;
  };
}

export interface InitiatePayoutRequest {
  payoutId: string;
  amount: string;
  currency: string;
  recipient: PayoutRecipient;
  customerMessage?: string;
  metadata?: Record<string, string>;
}

export interface InitiatePayoutResponse {
  payoutId: string;
  status: "ACCEPTED" | "REJECTED" | "DUPLICATE_IGNORED";
  created?: string;
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
}

export interface PayoutData {
  payoutId: string;
  status: string;
  amount: string;
  currency: string;
  country: string;
  recipient: PayoutRecipient;
  customerMessage?: string;
  created: string;
  providerTransactionId?: string;
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
}

export interface CheckPayoutResponse {
  status: "FOUND" | "NOT_FOUND";
  data?: PayoutData;
}

export interface InitiateRefundRequest {
  refundId: string;
  depositId: string;
  amount?: string;
  currency?: string;
}

export interface InitiateRefundResponse {
  refundId: string;
  status: "ACCEPTED" | "REJECTED" | "DUPLICATE_IGNORED";
  created?: string;
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
}

export interface RefundData {
  refundId: string;
  status: string;
  amount: string;
  currency: string;
  country: string;
  recipient: PayoutRecipient;
  customerMessage?: string;
  created: string;
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
}

export interface CheckRefundResponse {
  status: "FOUND" | "NOT_FOUND";
  data?: RefundData;
}

export interface ProviderAvailabilityEntry {
  country: string;
  providers: {
    provider: string;
    operationTypes: Record<string, "OPERATIONAL" | "DELAYED" | "CLOSED">;
  }[];
}

export interface WalletBalance {
  country: string;
  balance: string;
  currency: string;
  provider: string;
}

export interface WalletBalancesResponse {
  balances: WalletBalance[];
}
