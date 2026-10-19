'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mentorshipsApi } from '@/lib/api/mentorships';
import { paymentsApi, PaymentProvider, PaymentStatusResponse } from '@/lib/api/payments';
import type { Mentorship } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  ArrowRight,
  Loader2,
  ChevronLeft,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type CheckoutStep = 'SELECT_METHOD' | 'PROCESSING_USSD' | 'SUCCESS' | 'FAILED';

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: mentorshipId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [provider, setProvider] = useState<PaymentProvider>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Flow State
  const [step, setStep] = useState<CheckoutStep>('SELECT_METHOD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [ussdInstructions, setUssdInstructions] = useState('');
  const [pollingStatus, setPollingStatus] = useState<PaymentStatusResponse | null>(null);
  const [failureReason, setFailureReason] = useState<string>('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up polling interval
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  // 1. Initial Load of Mentorship
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth?mode=login');
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        const res = await mentorshipsApi.getMentorship(mentorshipId);
        const data = res.data;
        setMentorship(data);

        // Check if returned from hosted card checkout
        const urlPaymentId = searchParams.get('paymentId');
        const urlStatus = searchParams.get('status');
        if (urlPaymentId) {
          setPaymentId(urlPaymentId);
          if (urlStatus === 'success') {
            startPolling(urlPaymentId);
          } else if (urlStatus === 'cancel') {
            setStep('SELECT_METHOD');
            toast.error('Payment was cancelled. You can try again.');
          }
        } else if (data.status === 'ACTIVE') {
          setStep('SUCCESS');
        }
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || 'Failed to load mentorship information');
      } finally {
        setLoading(false);
      }
    })();
  }, [mentorshipId, user, authLoading, router, searchParams]);

  // 2. Poll for payment completion
  const startPolling = (pId: string) => {
    stopPolling();
    setStep('PROCESSING_USSD');

    let attempts = 0;
    const maxAttempts = 60; // 3 minutes max (60 * 3s)

    const checkStatus = async () => {
      attempts++;
      try {
        const res = await paymentsApi.getStatus(pId);
        const statusData = res.data;
        setPollingStatus(statusData);

        if (statusData.status === 'SUCCESS' || statusData.mentorshipStatus === 'ACTIVE') {
          stopPolling();
          setStep('SUCCESS');
          toast.success('Payment confirmed! Mentorship is now active.');
        } else if (statusData.status === 'FAILED') {
          stopPolling();
          setStep('FAILED');
          setFailureReason('Payment was declined or timed out. Please try again.');
        } else if (attempts >= maxAttempts) {
          stopPolling();
          setStep('FAILED');
          setFailureReason('Transaction timed out awaiting PIN approval. Please try again.');
        }
      } catch (err: unknown) {
        console.error('Polling error:', err);
      }
    };

    // Immediate first check, then interval every 3s
    void checkStatus();
    pollIntervalRef.current = setInterval(checkStatus, 3000);
  };

  // Validate phone number
  const validatePhone = (num: string) => {
    if (provider === 'CARD') return true;
    const clean = num.replace(/\D/g, '');
    if (clean.length < 8 || clean.length > 12) {
      setPhoneError('Please enter a valid mobile money number (e.g., 6XXXXXXXX)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // 3. Initiate Payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (provider !== 'CARD' && !validatePhone(phoneNumber)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const returnUrl = `${window.location.origin}/mentee/dashboard/mentorships/${mentorshipId}/checkout`;

      const res = await paymentsApi.initiate({
        mentorshipId,
        provider,
        phoneNumber: provider !== 'CARD' ? phoneNumber : undefined,
        returnUrl,
      });

      const data = res.data;
      setPaymentId(data.paymentId);

      if (data.checkoutUrl) {
        // Hosted card portal redirect
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.status === 'SUCCESS') {
        setStep('SUCCESS');
        toast.success('Payment succeeded!');
        return;
      }

      // Mobile money USSD flow
      setUssdInstructions(
        data.instructions ||
          (provider === 'MTN_MOMO'
            ? 'Dial *126# on your phone if prompt does not appear automatically.'
            : 'Dial #150# on your phone if prompt does not appear automatically.')
      );
      startPolling(data.paymentId);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      const msg = apiErr.message || 'Payment initiation failed. Please verify your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-sm font-medium text-gray-600">Loading checkout session...</p>
        </div>
      </div>
    );
  }

  if (error && !mentorship) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFCF9] px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Checkout Error</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/mentee/dashboard/mentorships/${mentorshipId}`)}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Back to Mentorship
          </button>
        </div>
      </div>
    );
  }

  const plan = mentorship?.plan;
  const mentor = mentorship?.mentor;
  const price = plan?.priceAmount || 0;
  const currency = plan?.currency || 'XAF';

  return (
    <div className="min-h-screen bg-[#FFFCF9] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Back */}
        <button
          onClick={() => router.push(`/mentee/dashboard/mentorships/${mentorshipId}`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Mentorship Details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Interaction Column */}
          <div className="lg:col-span-7 space-y-6">
            {step === 'SELECT_METHOD' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Activate Mentorship Plan</h1>
                    <p className="text-xs text-gray-500">
                      Intro completed. Choose payment method to begin monthly mentorship.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Select Payment Provider
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* MTN MoMo */}
                      <button
                        type="button"
                        onClick={() => {
                          setProvider('MTN_MOMO');
                          setPhoneError('');
                        }}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          provider === 'MTN_MOMO'
                            ? 'border-yellow-500 bg-yellow-50/50 ring-2 ring-yellow-400'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Smartphone className="w-5 h-5 text-yellow-600" />
                          {provider === 'MTN_MOMO' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">MTN MoMo</p>
                          <p className="text-xs text-gray-500">Mobile Money</p>
                        </div>
                      </button>

                      {/* Orange Money */}
                      <button
                        type="button"
                        onClick={() => {
                          setProvider('ORANGE_MONEY');
                          setPhoneError('');
                        }}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          provider === 'ORANGE_MONEY'
                            ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-400'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Smartphone className="w-5 h-5 text-orange-600" />
                          {provider === 'ORANGE_MONEY' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Orange Money</p>
                          <p className="text-xs text-gray-500">Mobile Money</p>
                        </div>
                      </button>

                      {/* Credit / Debit Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setProvider('CARD');
                          setPhoneError('');
                        }}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          provider === 'CARD'
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          {provider === 'CARD' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Bank Card</p>
                          <p className="text-xs text-gray-500">Visa / Mastercard</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Money Phone Input */}
                  {provider !== 'CARD' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">
                        {provider === 'MTN_MOMO' ? 'MTN' : 'Orange'} Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 text-sm font-medium">
                          +237
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            if (phoneError) validatePhone(e.target.value);
                          }}
                          placeholder="6XXXXXXXX"
                          className={`w-full pl-16 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white text-sm font-medium ${
                            phoneError
                              ? 'border-red-300 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-orange-200 focus:border-orange-500'
                          }`}
                        />
                      </div>
                      {phoneError ? (
                        <p className="text-xs text-red-600">{phoneError}</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Enter your registered mobile money account number to receive the prompt.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Card redirect notice */}
                  {provider === 'CARD' && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 leading-relaxed">
                      You will be redirected to the secure ZoPay payment gateway to complete your card transaction and automatically returned upon confirmation.
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Initiating Payment...
                      </>
                    ) : (
                      <>
                        Pay {price.toLocaleString()} {currency}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* WAITING FOR USSD / POLLING STATE */}
            {step === 'PROCESSING_USSD' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-75" />
                  <div className="relative w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-md">
                    <Smartphone className="w-10 h-10 animate-bounce" />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Check Your Phone
                  </h2>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    A payment prompt has been sent to your phone. Please approve the prompt and enter your PIN.
                  </p>
                </div>

                {/* Instructions Box */}
                <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 text-xs text-orange-900 text-left max-w-md mx-auto space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    USSD Quick Instructions:
                  </p>
                  <p>{ussdInstructions}</p>
                  <p className="text-[11px] text-orange-700 pt-1 border-t border-orange-200">
                    This screen updates automatically as soon as your payment is processed.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  Waiting for network confirmation...
                </div>

                <div className="pt-2 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentId) startPolling(paymentId);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium py-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Check Status Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopPolling();
                      setStep('SELECT_METHOD');
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium py-1.5 px-3"
                  >
                    Cancel & Try Again
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {step === 'SUCCESS' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 mb-2">
                    Mentorship Active
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                  <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                    Your mentorship with <strong className="text-gray-900">{mentor?.fullName || 'your mentor'}</strong> is now officially active. You can now schedule your sessions.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 max-w-md mx-auto flex justify-between items-center">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-gray-900">{price.toLocaleString()} {currency}</span>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button
                    onClick={() => router.push(`/mentee/dashboard/bookings/new?mentorshipId=${mentorshipId}`)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg shadow-orange-600/20 transition flex items-center justify-center gap-2"
                  >
                    Book First Session <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/mentee/dashboard/mentorships/${mentorshipId}`)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 px-6 rounded-xl font-semibold transition"
                  >
                    Mentorship Overview
                  </button>
                </div>
              </div>
            )}

            {/* FAILED STATE */}
            {step === 'FAILED' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Unsuccessful</h2>
                  <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">
                    {failureReason || 'We could not complete your transaction. Please verify your balance and try again.'}
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setStep('SELECT_METHOD');
                      setError(null);
                    }}
                    className="bg-orange-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-orange-700 transition"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push(`/mentee/dashboard/mentorships/${mentorshipId}`)}
                    className="border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Plan & Summary Sidebar Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              {/* Mentor Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-lg flex-shrink-0">
                  {mentor?.fullName?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{mentor?.fullName || 'Mentor'}</p>
                  <p className="text-xs text-gray-500">{mentor?.title || 'Verified Mentor'}</p>
                </div>
              </div>

              {/* Plan Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{plan?.title || 'Mentorship Plan'}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Monthly Mentorship Subscription</p>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">
                    {price.toLocaleString()} {currency}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Intro Call:</span>
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Cycle:</span>
                    <span>Monthly</span>
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{price.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Processing Fee</span>
                  <span className="text-green-600 font-medium">0 XAF</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total to Pay</span>
                  <span className="text-xl font-extrabold text-orange-600">
                    {price.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              {/* Security Trust Badges */}
              <div className="pt-4 border-t border-gray-100 flex items-start gap-3 text-xs text-gray-500">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-700">Bank-Grade ZoPay Security</p>
                  <p className="mt-0.5">
                    End-to-end encrypted transactions via ZoPay compliant gateway.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
