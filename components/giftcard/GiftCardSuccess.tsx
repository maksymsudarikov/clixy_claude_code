import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGiftCardById } from '../../services/giftCardService';
import { GiftCard } from '../../types';
import { CONTACT_INFO } from '../../constants';

const IconCheck = () => (
  <svg className="w-16 h-16 mx-auto mb-6 text-[#141413]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconCopy = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export const GiftCardSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadGiftCard = async () => {
      if (!id) return;
      try {
        const data = await fetchGiftCardById(id);
        setGiftCard(data);
      } catch (error) {
        console.error('Failed to load gift card:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGiftCard();
  }, [id]);

  const handleCopyCode = () => {
    if (giftCard?.code) {
      navigator.clipboard.writeText(giftCard.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, '')}?text=Hi! I just purchased a gift card (Code: ${giftCard?.code}). I'd like to complete the payment.`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-[#141413] rounded-full mb-2 animate-bounce"></div>
          <span className="text-xs font-medium tracking-widest text-[#9E9E98] uppercase">Loading</span>
        </div>
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D8D9CF]">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Gift Card Not Found</h1>
          <p className="text-sm text-[#9E9E98] mb-6">Please check your URL and try again.</p>
          <Link to="/" className="text-xs border-b border-[#141413] pb-0.5 uppercase tracking-widest">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] selection:bg-[#141413] selection:text-white">

      {/* Header */}
      <div className="border-b border-[#141413] py-8">
        <div className="max-w-3xl mx-auto px-6">
          <a href="/" className="inline-block mb-4 text-xs uppercase tracking-widest hover:opacity-70">
            ← Back to Clixy
          </a>
          <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight leading-none">
            REQUEST SUBMITTED
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Success Icon */}
        <div className="text-center mb-12">
          <IconCheck />
          <p className="text-lg font-medium">Thank you for your gift card purchase!</p>
          <p className="text-sm text-[#9E9E98] mt-2">Complete the payment to activate your gift card.</p>
        </div>

        {/* Gift Card Summary */}
        <div className="bg-white border border-[#141413] p-8 mb-8 shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#9E9E98] mb-4">
            Gift Card Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#9E9E98]">
              <span className="text-sm font-medium">Package:</span>
              <span className="text-sm font-bold uppercase">{giftCard.packageName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#9E9E98]">
              <span className="text-sm font-medium">Amount:</span>
              <span className="text-xl font-bold">${giftCard.amount} {giftCard.currency}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#9E9E98]">
              <span className="text-sm font-medium">Recipient:</span>
              <span className="text-sm font-bold">{giftCard.recipientName}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Your Gift Card Code:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold bg-[#D8D9CF] px-3 py-1 border border-[#141413]">
                  {giftCard.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-[#D8D9CF] border border-[#141413] transition-colors"
                  title="Copy code"
                >
                  {copied ? '✓' : <IconCopy />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-[#141413] text-white p-8 mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#9E9E98] mb-6">
            Next Steps
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="font-bold text-xl flex-shrink-0">1.</span>
              <div>
                <p className="font-bold mb-1">Complete Payment</p>
                <p className="text-sm text-gray-300">Use one of the payment methods below to complete your purchase.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-xl flex-shrink-0">2.</span>
              <div>
                <p className="font-bold mb-1">Gift Card Delivery</p>
                <p className="text-sm text-gray-300">
                  {giftCard.deliveryType === 'immediate'
                    ? 'Your recipient will receive the gift card within 24 hours after payment confirmation.'
                    : `Your recipient will receive the gift card on ${new Date(giftCard.deliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                  }
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-xl flex-shrink-0">3.</span>
              <div>
                <p className="font-bold mb-1">Booking the Session</p>
                <p className="text-sm text-gray-300">The recipient will contact us using their gift card code to schedule their photoshoot.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white border border-[#141413] p-8 mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#9E9E98] mb-6">
            Payment Instructions
          </h2>

          <div className="space-y-6">
            {/* Zelle */}
            <div className="p-6 bg-[#D8D9CF] border border-[#141413]">
              <h3 className="font-bold uppercase tracking-wide mb-3">Zelle (Preferred)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9E9E98]">Name:</span>
                  <span className="font-bold">{CONTACT_INFO.zelle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9E98]">Phone:</span>
                  <span className="font-bold font-mono">{CONTACT_INFO.zelle.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9E98]">Amount:</span>
                  <span className="font-bold text-lg">${giftCard.amount}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#141413]">
                  <span className="text-[#9E9E98] text-xs uppercase tracking-wider">Reference:</span>
                  <p className="font-mono font-bold mt-1">{giftCard.code}</p>
                </div>
              </div>
            </div>

            {/* Other Methods */}
            <div className="text-sm">
              <p className="font-bold uppercase tracking-wide mb-2">Also Accepted:</p>
              <p className="text-[#9E9E98]">Venmo, PayPal, Wise</p>
              <p className="text-xs mt-2 text-[#9E9E98]">
                Please contact us for details on alternative payment methods.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-4">
            Ready to Complete Payment?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#141413] text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors"
            >
              Contact via WhatsApp
            </a>
            <a
              href={`mailto:${CONTACT_INFO.email}?subject=Gift Card Payment - ${giftCard.code}&body=Hi, I'd like to complete payment for my gift card purchase.%0D%0A%0D%0ACode: ${giftCard.code}%0D%0AAmount: $${giftCard.amount}%0D%0APackage: ${giftCard.packageName}`}
              className="px-6 py-3 bg-white text-[#141413] text-xs font-bold uppercase tracking-widest hover:bg-[#141413] hover:text-white border border-[#141413] transition-colors"
            >
              Send Email
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-[#141413] text-center text-xs text-[#9E9E98]">
          <p>Please save this page or take a screenshot of your gift card code.</p>
          <p className="mt-2">You'll receive a confirmation email once payment is processed.</p>
        </div>
      </div>
    </div>
  );
};
