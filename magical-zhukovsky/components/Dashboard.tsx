import React from 'react';
import { Link } from 'react-router-dom';
import { Shoot } from '../types';

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
                <div className="mt-2">
                    <Link to="/admin" className="inline-block text-[10px] uppercase font-bold tracking-widest border border-[#141413] px-4 py-2 hover:bg-[#141413] hover:text-[#D8D9CF] transition-colors">
                        Producer Access
                    </Link>
                </div>
            </div>
        </div>

        {/* Grid of Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {shoots.map((shoot) => (
            <Link to={`/shoot/${shoot.id}`} key={shoot.id} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 mb-4">
                <img 
                  src={shoot.coverImage} 
                  alt={shoot.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0" 
                />
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-[#141413] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
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