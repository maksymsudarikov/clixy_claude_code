import React from 'react';
import { FEATURES } from '../config/features';

interface ContactCardProps {
  icon: string;
  title: string;
  description: string;
  formUrl: string;
  color?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, title, description, formUrl }) => {
  return (
    <a
      href={formUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white border-2 border-[#141413] p-5 sm:p-8 transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(20,20,19,1)] hover:-translate-y-1 active:scale-[0.99] touch-manipulation"
    >
      {/* Icon */}
      <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold uppercase tracking-tight text-[#141413] mb-2 sm:mb-3 leading-none">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#9E9E98] mb-4 sm:mb-6 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#141413] group-hover:gap-4 transition-all">
        <span>Start</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </a>
  );
};

export const ContactHub: React.FC = () => {
  // If Tally forms disabled, show generic contact for producers
  if (!FEATURES.tallyForms) {
    return (
      <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#D8D9CF]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold uppercase tracking-tighter leading-none mb-4 sm:mb-6">
            Get In Touch
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#9E9E98] font-light tracking-wide mb-6 sm:mb-8 leading-relaxed px-2">
            Interested in Clixy for your production company?<br className="hidden sm:inline" />
            <span className="sm:hidden"> </span>Let's talk about how we can help streamline your shoot coordination.
          </p>
          <a
            href="mailto:hello@clixy.studio"
            className="inline-block bg-[#141413] text-white px-6 sm:px-8 py-4 min-h-[48px] text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-colors shadow-[8px_8px_0px_0px_rgba(20,20,19,1)] touch-manipulation active:scale-[0.98]"
          >
            Contact Us
          </a>
        </div>
      </section>
    );
  }

  // Olga's Tally forms
  const forms = [
    {
      icon: '📸',
      title: "I'm a Model",
      description: 'Looking to collaborate? Share your portfolio and let\'s create something amazing together.',
      formUrl: 'https://tally.so/r/woJg9b'
    },
    {
      icon: '🎯',
      title: 'Brand Partnership',
      description: 'Professional campaigns, lookbooks, and e-commerce photography for your brand.',
      formUrl: 'https://tally.so/r/wbaGqe'
    },
    {
      icon: '💡',
      title: 'Share Your Vision',
      description: 'Personal portraits, couples, boudoir, or family sessions. Tell us what you envision.',
      formUrl: 'https://tally.so/r/woqr4O'
    },
    {
      icon: '✨',
      title: 'Shoot Details',
      description: 'Already booked? Share outfit, location, and preferences for your upcoming session.',
      formUrl: 'https://tally.so/r/mOWg68'
    }
  ];

  return (
    <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#D8D9CF]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold uppercase tracking-tighter leading-none mb-3 sm:mb-4">
            Work With Us
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#9E9E98] font-light tracking-wide max-w-2xl mx-auto px-2">
            Choose how you'd like to connect with Studio Olga Prudka
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {forms.map((form, index) => (
            <ContactCard key={index} {...form} />
          ))}
        </div>

        {/* Optional: Direct Contact Info */}
        <div className="mt-10 sm:mt-16 text-center">
          <p className="text-xs uppercase tracking-widest text-[#9E9E98] mb-2">
            Or reach out directly
          </p>
          <a
            href="mailto:art@olgaprudka.com"
            className="text-sm font-bold uppercase tracking-wider text-[#141413] hover:opacity-60 transition-opacity min-h-[44px] inline-flex items-center touch-manipulation"
          >
            art@olgaprudka.com
          </a>
        </div>
      </div>
    </section>
  );
};
