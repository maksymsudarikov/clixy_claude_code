import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GIFT_CARD_PACKAGES, CONTACT_INFO } from '../../constants';
import { GiftCardPackage, GiftCardPurchaseForm } from '../../types';
import { createGiftCard } from '../../services/giftCardService';
import { useNotification } from '../../contexts/NotificationContext';
import { isValidEmail, isValidPhone } from '../../utils/validation';

const IconExternal = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export const GiftCardPurchase: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [selectedPackage, setSelectedPackage] = useState<GiftCardPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<GiftCardPurchaseForm>>({
    deliveryType: 'immediate'
  });

  const handleSelectPackage = (pkg: GiftCardPackage) => {
    setSelectedPackage(pkg);
    setFormData(prev => ({ ...prev, packageId: pkg.id }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryTypeChange = (type: 'immediate' | 'scheduled') => {
    setFormData(prev => ({ ...prev, deliveryType: type, deliveryDate: type === 'immediate' ? undefined : prev.deliveryDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedPackage) {
      addNotification('error', 'Please select a package');
      return;
    }

    if (!formData.purchaserName || !formData.purchaserEmail || !formData.purchaserPhone ||
        !formData.recipientName || !formData.recipientEmail) {
      addNotification('error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    if (formData.purchaserEmail && !isValidEmail(formData.purchaserEmail)) {
      addNotification('error', 'Please enter a valid purchaser email address');
      return;
    }

    if (formData.recipientEmail && !isValidEmail(formData.recipientEmail)) {
      addNotification('error', 'Please enter a valid recipient email address');
      return;
    }

    // Phone validation
    if (formData.purchaserPhone && !isValidPhone(formData.purchaserPhone)) {
      addNotification('error', 'Please enter a valid phone number (at least 7 digits)');
      return;
    }

    if (formData.deliveryType === 'scheduled' && !formData.deliveryDate) {
      addNotification('error', 'Please select a delivery date');
      return;
    }

    setLoading(true);

    try {
      const giftCard = await createGiftCard(formData as GiftCardPurchaseForm);
      addNotification('success', 'Gift card request submitted successfully!');

      // Передаем безопасные данные через URL (не из базы)
      const successParams = new URLSearchParams({
        code: giftCard.code,
        packageName: selectedPackage.name,
        amount: selectedPackage.price.toString(),
        recipientName: formData.recipientName!
      });

      navigate(`/gift-card/success?${successParams.toString()}`);
    } catch (error) {
      console.error('Error creating gift card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create gift card';
      addNotification('error', `Error: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] selection:bg-[#141413] selection:text-white">

      {/* Header */}
      <div className="border-b border-[#141413] py-8">
        <div className="max-w-4xl mx-auto px-6">
          <a href="/" className="inline-block mb-4 text-xs uppercase tracking-widest hover:opacity-70">
            ← Back to Clixy
          </a>
          <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight leading-none mb-2">
            GIFT A PHOTOSHOOT
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-[#9E9E98]">
            Studio Olga Prudka®
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {!selectedPackage ? (
          // PACKAGE SELECTION
          <>
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 pb-3 border-b border-[#141413]">
              Select Package
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GIFT_CARD_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-[#141413] p-6 hover:shadow-[4px_4px_0px_0px_rgba(20,20,19,1)] transition-all flex flex-col"
                >
                  {/* Package Header */}
                  <div className="mb-4 pb-4 border-b border-[#9E9E98]">
                    <h3 className="text-lg font-bold uppercase tracking-tight mb-1">
                      {pkg.name}
                    </h3>
                    <p className="text-2xl font-bold">${pkg.price} {pkg.currency}</p>
                  </div>

                  {/* Package Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="font-mono text-[#9E9E98] w-24">Duration:</span>
                      <span className="font-medium">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-mono text-[#9E9E98] w-24">Photos:</span>
                      <span className="font-medium">{pkg.photosCount}</span>
                    </div>
                    {pkg.locations && (
                      <div className="flex items-center text-sm">
                        <span className="font-mono text-[#9E9E98] w-24">Location:</span>
                        <span className="font-medium">{pkg.locations}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Buttons */}
                  <div className="space-y-2 mt-auto">
                    {pkg.notionUrl && (
                      <a
                        href={pkg.notionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-[#141413] border border-[#141413] text-xs font-bold uppercase tracking-widest hover:bg-[#141413] hover:text-white transition-colors"
                      >
                        View Full Details
                        <IconExternal />
                      </a>
                    )}
                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className="w-full px-4 py-3 bg-[#141413] text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors"
                    >
                      Select This Package →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // PURCHASE FORM
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Selected Package Summary */}
            <div className="bg-[#141413] text-white p-6 border border-[#141413]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-1">Selected Package</h3>
                  <p className="text-xl font-bold uppercase">{selectedPackage.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className="text-xs uppercase tracking-widest border-b border-white pb-0.5 hover:opacity-70"
                >
                  Change
                </button>
              </div>
              <p className="text-2xl font-bold">${selectedPackage.price} {selectedPackage.currency}</p>
            </div>

            {/* Your Details */}
            <section>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 pb-3 border-b border-[#141413]">
                Your Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="purchaserName"
                    required
                    value={formData.purchaserName || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="purchaserEmail"
                    required
                    value={formData.purchaserEmail || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="purchaserPhone"
                    required
                    value={formData.purchaserPhone || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </section>

            {/* Recipient Details */}
            <section>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 pb-3 border-b border-[#141413]">
                Recipient Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    required
                    value={formData.recipientName || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors"
                    placeholder="Gift recipient's name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    name="recipientEmail"
                    required
                    value={formData.recipientEmail || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#9E9E98] py-3 focus:border-[#141413] outline-none transition-colors"
                    placeholder="recipient@email.com"
                  />
                </div>
              </div>
            </section>

            {/* Personal Message */}
            <section>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 pb-3 border-b border-[#141413]">
                Personal Message (Optional)
              </h3>
              <textarea
                name="personalMessage"
                value={formData.personalMessage || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-white border border-[#9E9E98] p-4 focus:border-[#141413] outline-none transition-colors resize-none"
                placeholder="Write a heartfelt message to your gift recipient..."
              />
            </section>

            {/* Delivery */}
            <section>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 pb-3 border-b border-[#141413]">
                Delivery
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={formData.deliveryType === 'immediate'}
                    onChange={() => handleDeliveryTypeChange('immediate')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Send immediately</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={formData.deliveryType === 'scheduled'}
                    onChange={() => handleDeliveryTypeChange('scheduled')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Schedule for a specific date</span>
                </label>
                {formData.deliveryType === 'scheduled' && (
                  <input
                    type="date"
                    name="deliveryDate"
                    required
                    value={formData.deliveryDate || ''}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="ml-7 bg-white border border-[#9E9E98] px-4 py-2 focus:border-[#141413] outline-none text-sm"
                  />
                )}
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-[#141413] text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border border-[#141413] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Gift Card Request →'}
              </button>
              <p className="mt-4 text-xs text-center text-[#9E9E98] uppercase tracking-wide">
                You'll receive payment instructions on the next page
              </p>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#141413] text-center">
          <p className="text-xs text-[#9E9E98] uppercase tracking-widest">
            Questions? Contact us at <a href={`mailto:${CONTACT_INFO.email}`} className="text-[#141413] border-b border-[#141413]">{CONTACT_INFO.email}</a>
          </p>
        </div>
      </div>
    </div>
  );
};
