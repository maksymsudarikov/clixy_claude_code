import React from 'react';
import { Link } from 'react-router-dom';
import { ContactHub } from './ContactHub';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] font-light selection:bg-[#141413] selection:text-white">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl w-full text-center">

          {/* Hero */}
          <h1 className="text-6xl md:text-[8rem] font-extrabold tracking-tighter leading-[0.8] mb-6 uppercase font-stretch-wide">
            CLIXY
          </h1>

          <p className="text-base md:text-xl font-bold uppercase tracking-[0.2em] mb-8">
            Studio Olga Prudka®
          </p>

          <p className="text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto mb-12 leading-relaxed">
            Production portal for Studio Olga Prudka.<br />
            Track your photo and video shoots in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="inline-block text-sm uppercase font-bold tracking-widest border-2 border-[#141413] px-8 py-4 hover:bg-[#141413] hover:text-[#D8D9CF] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]"
            >
              Team Access →
            </Link>
            <a
              href="#contact"
              className="inline-block text-sm uppercase font-bold tracking-widest border-2 border-[#141413] bg-[#141413] text-[#D8D9CF] px-8 py-4 hover:bg-white hover:text-[#141413] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]"
            >
              Work With Us →
            </a>
          </div>
        </div>
      </div>

      {/* Photography Packages Section */}
      <section className="py-20 md:py-32 px-6 border-t-2 border-[#141413]">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.9] mb-6">
            Photography<br className="md:hidden" /> Sessions
          </h2>

          {/* Starting Price */}
          <div className="inline-flex items-center gap-3 mb-8 border-2 border-[#141413] px-8 py-4 bg-white shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
            <span className="text-xs uppercase tracking-widest font-bold text-[#9E9E98]">
              Starting at
            </span>
            <span className="text-3xl md:text-4xl font-extrabold text-[#141413]">
              $1,000
            </span>
          </div>

          {/* Package Names */}
          <div className="mb-10">
            <p className="text-base md:text-lg text-[#141413] font-medium">
              Couple • Street Style • Family
            </p>
          </div>

          {/* Divider */}
          <div className="w-24 h-0.5 bg-[#141413] mx-auto mb-10"></div>

          {/* Description */}
          <p className="text-sm md:text-base text-[#9E9E98] leading-relaxed max-w-2xl mx-auto mb-10">
            Professional photography sessions in NYC. All packages include
            high-quality editing, digital delivery, and personalized support.
          </p>

          {/* CTA */}
          <Link
            to="/packages"
            className="inline-block bg-[#141413] text-white px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] border-2 border-[#141413] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(20,20,19,1)] touch-manipulation"
          >
            View All Packages →
          </Link>
        </div>
      </section>

      {/* Contact Hub Section */}
      <ContactHub />

      {/* Footer */}
      <div className="border-t-2 border-[#141413] py-8">
        <div className="max-w-6xl mx-auto px-6">

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6">
            <a
              href="#contact"
              className="text-[10px] uppercase font-bold tracking-widest hover:opacity-60 transition-opacity"
            >
              Work With Us
            </a>
            <a
              href="https://instagram.com/olgaprudka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase font-bold tracking-widest hover:opacity-60 transition-opacity"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com/@olgaprudka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase font-bold tracking-widest hover:opacity-60 transition-opacity"
            >
              TikTok
            </a>
            <a
              href="https://olgaprudka.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase font-bold tracking-widest hover:opacity-60 transition-opacity"
            >
              Portfolio
            </a>
            <a
              href="/#/gift-card"
              className="text-[10px] uppercase font-bold tracking-widest hover:opacity-60 transition-opacity"
            >
              Gift Cards
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center text-[10px] uppercase tracking-widest text-[#141413]">
            ©2025 STUDIO OLGA PRUDKA
          </p>
        </div>
      </div>
    </div>
  );
};
