import React from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] font-light selection:bg-[#141413] selection:text-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
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

          {/* Team Access Button */}
          <Link
            to="/dashboard"
            className="inline-block text-sm uppercase font-bold tracking-widest border-2 border-[#141413] px-8 py-4 hover:bg-[#141413] hover:text-[#D8D9CF] transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]"
          >
            Team Access →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-[#141413] py-8">
        <div className="max-w-6xl mx-auto px-6">

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-6">
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
