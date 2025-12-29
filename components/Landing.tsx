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

      {/* Photography Sessions - Minimal Links */}
      <section className="py-20 md:py-32 px-6 border-t-2 border-[#141413]">
        <div className="max-w-3xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-12">
            Photography Sessions
          </h2>

          {/* Simple Links List */}
          <div className="space-y-4 max-w-md mx-auto">
            <a
              href="https://www.notion.so/COUPLE-PHOTOSHOOT-2af387bff96a803b9a85d88b01b15066"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-6 py-4 border-2 border-[#141413] bg-white hover:bg-[#141413] hover:text-white transition-all duration-200 group"
            >
              <span className="text-sm md:text-base font-bold uppercase tracking-wide">
                Couple Photoshoot →
              </span>
            </a>

            <a
              href="https://www.notion.so/STREET-STYLE-PHOTOSHOOT-2af387bff96a80fd943cd55499d4b657"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-6 py-4 border-2 border-[#141413] bg-white hover:bg-[#141413] hover:text-white transition-all duration-200 group"
            >
              <span className="text-sm md:text-base font-bold uppercase tracking-wide">
                Street Style →
              </span>
            </a>

            <a
              href="https://www.notion.so/FAMILY-PHOTOSHOOT-2a5387bff96a80289610d556cc0b2bc9"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-6 py-4 border-2 border-[#141413] bg-white hover:bg-[#141413] hover:text-white transition-all duration-200 group"
            >
              <span className="text-sm md:text-base font-bold uppercase tracking-wide">
                Family Photoshoot →
              </span>
            </a>
          </div>
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
