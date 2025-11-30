import React, { useState } from 'react';
import { Shoot } from '../types';
import { TeamList } from './TeamList';

interface ShootDetailsProps {
  shoot: Shoot;
}

// SVG Icons with Branding Colors
const IconClock = () => <svg className="w-4 h-4 mr-3 text-[#141413]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconMap = () => <svg className="w-4 h-4 mr-3 text-[#141413]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconDownload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconExternal = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;

export const ShootDetails: React.FC<ShootDetailsProps> = ({ shoot }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'style' | 'team'>('details');

  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] pb-24 md:pb-0 font-light selection:bg-[#141413] selection:text-white">
      {/* Header Image - Full Width, Geometric */}
      <div className="relative h-[50vh] w-full overflow-hidden bg-[#9E9E98]">
        <img 
          src={shoot.coverImage} 
          alt={shoot.title} 
          className="w-full h-full object-cover opacity-90 grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-[#141413]/20" />
        
        {/* Large Title Overlay */}
        <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
          <div className="max-w-5xl mx-auto">
             <div className="flex items-center space-x-3 text-xs md:text-sm uppercase font-bold tracking-[0.2em] text-white mb-4 bg-[#141413] inline-block px-3 py-1">
                <span>{shoot.client}</span>
                <span>//</span>
                <span>{new Date(shoot.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
             </div>
             <h1 className="text-4xl md:text-7xl font-extrabold uppercase tracking-tight text-white leading-none">
                {shoot.title}
             </h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Minimalist Border */}
      <div className="sticky top-0 z-30 bg-[#D8D9CF]/95 backdrop-blur-sm border-b border-[#141413]">
        <div className="max-w-5xl mx-auto flex">
          {['details', 'style', 'team'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all
                ${activeTab === tab 
                    ? 'text-[#141413] bg-white border-r border-l border-[#141413] -mx-[1px]' 
                    : 'text-[#9E9E98] hover:text-[#141413]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        
        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Info */}
            <div className="lg:col-span-7 space-y-12">
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-[#141413] pb-2">Description</h3>
                  <p className="text-lg leading-relaxed font-normal">{shoot.description}</p>
                </section>

                {/* Timeline */}
                {shoot.timeline && shoot.timeline.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-[#141413] pb-2">Run of Show</h3>
                        <div className="space-y-0 border-l border-[#141413]">
                            {shoot.timeline.map((event, idx) => (
                                <div key={idx} className="relative pl-8 py-4 hover:bg-white/50 transition-colors group">
                                    <div className="absolute -left-[5px] top-6 h-2.5 w-2.5 bg-[#141413] rotate-45 group-hover:scale-125 transition-transform"></div>
                                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
                                        <span className="font-mono font-bold text-lg">{event.time}</span>
                                        <span className="text-base md:ml-8 font-medium uppercase tracking-wide">{event.activity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Right Column: Logistics Cards (White Boxes) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Logistics Card */}
              <div className="bg-white p-8 border border-[#141413] sharp-shadow">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#9E9E98] mb-6">Logistics</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <IconClock />
                    <div>
                      <p className="font-bold uppercase text-sm">{shoot.startTime} — {shoot.endTime}</p>
                      <p className="text-xs text-[#9E9E98] mt-1 uppercase tracking-wide">Production Hours</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <IconMap />
                    <div>
                      <p className="font-bold uppercase text-sm">{shoot.locationName}</p>
                      <p className="text-sm text-gray-600 mt-1 font-serif italic">{shoot.locationAddress}</p>
                      {shoot.locationMapUrl && (
                        <a href={shoot.locationMapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest border-b border-[#141413] pb-0.5 hover:text-[#9E9E98] hover:border-[#9E9E98]">
                          View Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Documents Card */}
              <div className="bg-[#141413] text-white p-8 border border-[#141413]">
                 <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#9E9E98] mb-6">Production Files</h3>
                 <div className="space-y-4">
                    {shoot.callSheetUrl && (
                      <a href={shoot.callSheetUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 bg-transparent border border-[#9E9E98] hover:bg-white hover:text-[#141413] hover:border-white transition-all group">
                        <span className="text-sm font-bold uppercase tracking-wider">Call Sheet</span>
                        <IconDownload />
                      </a>
                    )}
                    {shoot.moodboardUrl && (
                      <a href={shoot.moodboardUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 bg-transparent border border-[#9E9E98] hover:bg-white hover:text-[#141413] hover:border-white transition-all group">
                        <span className="text-sm font-bold uppercase tracking-wider">Moodboard</span>
                        <IconExternal />
                      </a>
                    )}
                    {shoot.finalPhotosUrl && (
                       <a href={shoot.finalPhotosUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 bg-[#D8D9CF] text-[#141413] border border-[#D8D9CF] hover:bg-white transition-colors">
                       <span className="text-sm font-bold uppercase tracking-wider">Download Assets</span>
                       <IconDownload />
                     </a>
                    )}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-12">
             {shoot.moodboardImages && shoot.moodboardImages.length > 0 && (
                 <div>
                     <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-[#141413] pb-2">Visual Direction</h3>
                     {/* Grid styled like the Color Palette in PDF */}
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {shoot.moodboardImages.map((img, idx) => (
                            <div key={idx} className="bg-white p-2 border border-[#141413]">
                                <div className="aspect-[3/4] overflow-hidden bg-[#9E9E98]">
                                    <img src={img} alt={`Mood ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 grayscale contrast-125" />
                                </div>
                                <div className="pt-2 flex justify-between items-end">
                                    <span className="text-[10px] font-mono uppercase text-[#9E9E98]">Ref. 0{idx + 1}</span>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             )}

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="bg-white p-8 border border-[#141413]">
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Styling</h3>
                    {shoot.stylingUrl ? (
                        <a href={shoot.stylingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-6 py-3 bg-[#141413] text-white border border-[#141413] text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#141413] transition-colors">
                            View Guide <span className="ml-2">→</span>
                        </a>
                    ) : (
                        <p className="text-base leading-relaxed whitespace-pre-wrap font-serif italic">{shoot.stylingNotes || 'No notes provided.'}</p>
                    )}
                 </div>
                 <div className="bg-white p-8 border border-[#141413]">
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Hair & Makeup</h3>
                    <p className="text-base leading-relaxed whitespace-pre-wrap font-serif italic">{shoot.hairMakeupNotes}</p>
                 </div>
             </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <TeamList team={shoot.team} />
        )}

      </main>
    </div>
  );
};
