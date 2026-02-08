import React from 'react';
import { Link } from 'react-router-dom';
import { PackageCard } from './PackageCard';
import { GIFT_CARD_PACKAGES } from '../constants';

export const PackagesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] font-light selection:bg-[#141413] selection:text-white">
      {/* Header */}
      <div className="border-b-2 border-[#141413] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-xs uppercase tracking-widest font-bold text-[#9E9E98] hover:text-[#141413] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            <a
              href="mailto:art@olgaprudka.com"
              className="text-xs uppercase tracking-widest font-bold border-2 border-[#141413] px-4 py-2 hover:bg-[#141413] hover:text-white transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Title Section */}
        <div className="mb-16 md:mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-6 uppercase">
            Photography<br />Packages
          </h1>
          <p className="text-base md:text-lg text-[#9E9E98] max-w-2xl mx-auto leading-relaxed">
            Professional photography sessions in New York City.<br />
            All packages include high-quality editing and digital delivery.
          </p>

          {/* Price Range */}
          <div className="mt-6 inline-flex items-center gap-2 border-2 border-[#141413] px-6 py-3 bg-white">
            <span className="text-xs uppercase tracking-widest font-bold text-[#9E9E98]">
              Starting at
            </span>
            <span className="text-2xl font-extrabold text-[#141413]">
              $1,000
            </span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {GIFT_CARD_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-20 pt-12 border-t-2 border-[#141413] text-center">
          <p className="text-sm text-[#9E9E98] mb-6 leading-relaxed max-w-2xl mx-auto">
            Not sure which package is right for you? Each package link above contains
            full details about what's included, example work, and answers to common questions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/#contact';
              }}
              className="inline-block bg-[#141413] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-12 p-6 border-2 border-[#141413] bg-white/50 text-center">
          <p className="text-xs uppercase tracking-widest text-[#9E9E98] mb-2">
            Payment Options
          </p>
          <p className="text-sm text-[#141413]">
            Zelle, Venmo, Cash App, or Cash accepted
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-[#141413] py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#9E9E98]">
            ©2025 STUDIO OLGA PRUDKA
          </p>
        </div>
      </div>
    </div>
  );
};
