import React from 'react';
import { Link } from 'react-router-dom';
import { Shoot } from '../types';
import { ShootAvatar } from './ShootAvatar';

interface DashboardProps {
  shoots: Shoot[];
}

export const Dashboard: React.FC<DashboardProps> = ({ shoots }) => {
  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] font-light selection:bg-[#141413] selection:text-white">
      <div className="max-w-6xl mx-auto px-6 py-20">
        
        {/* Header Branding */}
        <div className="mb-24 border-b border-[#141413] pb-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-6xl md:text-[9rem] font-extrabold tracking-tighter leading-[0.8] mb-4 uppercase font-stretch-wide -ml-1 md:-ml-2">
                        CLIXY
                    </h1>
                    <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em]">
                        Studio Olga Prudka®
                    </p>
                </div>
                <div className="mt-2 flex flex-col gap-3 items-end">
                    <Link to="/" className="text-[10px] uppercase font-bold tracking-widest text-[#9E9E98] hover:text-[#141413] transition-colors">
                        ← Home
                    </Link>
                    <Link to="/studio" className="inline-block text-[10px] uppercase font-bold tracking-widest border border-[#141413] px-4 py-2 hover:bg-[#141413] hover:text-[#D8D9CF] transition-colors">
                        Producer Access
                    </Link>
                </div>
            </div>
        </div>

        {/* Grid of Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {shoots.map((shoot) => (
            <Link to={`/shoot/${shoot.id}?token=${shoot.accessToken}`} key={shoot.id} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden border-2 border-[#141413] mb-4 transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px_rgba(20,20,19,1)]">
                <ShootAvatar title={shoot.title} client={shoot.client} />
              </div>
              
              <div className="flex flex-col space-y-1 border-t border-[#141413] pt-3">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight leading-none group-hover:opacity-70 transition-opacity">
                        {shoot.title}
                    </h2>
                    <span className="text-xs font-mono pt-1">{shoot.date}</span>
                </div>
                <span className="text-xs uppercase tracking-widest text-[#9E9E98]">{shoot.client}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-[#141413] flex justify-between items-end text-[10px] uppercase tracking-widest text-[#141413]">
          <p>©2025 STUDIO OLGA PRUDKA</p>
        </div>
      </div>
    </div>
  );
};