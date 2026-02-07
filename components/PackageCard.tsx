import React from 'react';
import { GiftCardPackage } from '../types';

interface PackageCardProps {
  package: GiftCardPackage;
  variant?: 'default' | 'compact';
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  variant = 'default'
}) => {
  const isCompact = variant === 'compact';

  return (
    <div className={`
      bg-white border-2 border-[#141413]
      transition-all duration-300
      hover:shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]
      hover:-translate-y-1
      ${isCompact ? 'p-6' : 'p-8'}
      relative
    `}>
      {/* Popular Badge */}
      {pkg.popular && (
        <div className="absolute -top-3 -right-3 bg-[#141413] text-white px-4 py-1 text-xs font-bold uppercase tracking-widest rotate-3">
          Popular
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight leading-none mb-3 text-[#141413]">
          {pkg.name}
        </h3>

        {/* Price - Front and Center */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl md:text-5xl font-extrabold text-[#141413]">
            ${pkg.price.toLocaleString()}
          </span>
          <span className="text-sm uppercase tracking-wider text-[#9E9E98]">
            {pkg.currency}
          </span>
        </div>
      </div>

      {/* Key Info */}
      <div className="space-y-2 mb-6 pb-6 border-b border-[#141413]/20">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#9E9E98] uppercase tracking-widest font-bold min-w-[80px]">
            Duration
          </span>
          <span className="text-[#141413] font-medium">
            {pkg.duration}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#9E9E98] uppercase tracking-widest font-bold min-w-[80px]">
            Photos
          </span>
          <span className="text-[#141413] font-medium">
            {pkg.photosCount}
          </span>
        </div>

        {pkg.locations && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#9E9E98] uppercase tracking-widest font-bold min-w-[80px]">
              Location
            </span>
            <span className="text-[#141413] font-medium">
              {pkg.locations}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {!isCompact && (
        <p className="text-sm leading-relaxed text-[#141413] mb-6">
          {pkg.description}
        </p>
      )}

      {/* Quick Features Preview (3-4 items) */}
      {!isCompact && pkg.features.length > 0 && (
        <div className="mb-6 space-y-1">
          {pkg.features.slice(0, 4).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <span className="text-[#141413] mt-0.5">✓</span>
              <span className="text-[#9E9E98]">{feature}</span>
            </div>
          ))}
          {pkg.features.length > 4 && (
            <p className="text-xs text-[#9E9E98] mt-2">
              + {pkg.features.length - 4} more included...
            </p>
          )}
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        {/* Full Details - Primary CTA */}
        {pkg.notionUrl && (
          <a
            href={pkg.notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              block w-full text-center
              bg-[#141413] text-white
              px-6 py-4
              text-xs font-bold uppercase tracking-widest
              hover:bg-white hover:text-[#141413]
              border-2 border-[#141413]
              transition-all duration-200
              touch-manipulation
            "
          >
            Full Details →
          </a>
        )}

        {/* Inquiry CTA (Gift cards are disabled) */}
        <a
          href="mailto:art@olgaprudka.com?subject=Package%20Inquiry"
          className="
            block w-full text-center
            bg-white text-[#141413]
            px-6 py-3
            border-2 border-[#141413]
            text-xs font-bold uppercase tracking-widest
            hover:bg-[#141413] hover:text-white
            transition-all duration-200
            touch-manipulation
          "
        >
          Inquire →
        </a>
      </div>
    </div>
  );
};
