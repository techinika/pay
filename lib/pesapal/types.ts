export interface SubmitOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callbackUrl: string;
  notificationId?: string;
  billingAddress: {
    emailAddress: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface SubmitOrderResponse {
  orderTrackingId: string;
  redirectUrl: string;
  merchantReference: string;
  error?: {
    code: string;
    message: string;
    details: string | null;
  };
}

export interface TransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  payment_status_code: string;
  currency: string;
  error?: {
    code: string;
    message: string;
    details: string | null;
  };
}

export interface RegisteredIpn {
  url: string;
  ipnId: string;
  created_date: string;
  notification_type: string;
}

export interface RegisterIpnRequest {
  url: string;
  notificationType: "CHANGE" | "GET" | "POST";
}

export interface RegisterIpnResponse {
  url: string;
  ipnId: string;
  notification_id: string;
}
