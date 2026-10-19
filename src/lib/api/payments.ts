import { apiClient } from './http';

export type PaymentProvider = 'MTN_MOMO' | 'ORANGE_MONEY' | 'CARD';

export interface InitiatePaymentPayload {
  mentorshipId: string;
  provider: PaymentProvider;
  phoneNumber?: string;
  returnUrl?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  provider: PaymentProvider;
  providerReference?: string;
  ussdPrompt?: string;
  checkoutUrl?: string;
  instructions: string;
  quote?: {
    totalAmount: string;
    fees: string;
    expiresAt: string;
  };
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  provider: string;
  providerReference?: string;
  mentorshipId: string;
  mentorshipStatus: 'INTRO' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  amount: number;
  currency: string;
  createdAt: string;
}

export const paymentsApi = {
  /**
   * Initiate payment for an INTRO mentorship via ZoPay
   */
  initiate: (payload: InitiatePaymentPayload) =>
    apiClient.post<InitiatePaymentResponse>('/payments/initiate', payload),

  /**
   * Poll / get real-time status of payment and mentorship activation
   */
  getStatus: (paymentId: string) =>
    apiClient.get<PaymentStatusResponse>(`/payments/${paymentId}/status`),
};
