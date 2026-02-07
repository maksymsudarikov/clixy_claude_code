import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shoot } from '../types';
import { TeamList } from './TeamList';
import { TalentList } from './TalentList';
import { ShootAvatar } from './ShootAvatar';
import { NavigationBar } from './NavigationBar';
import { copyShootLink } from '../utils/whatsappShare';
import { useNotification } from '../contexts/NotificationContext';

interface ShootDetailsProps {
  shoot: Shoot;
}

// SVG Icons with Branding Colors
const IconClock = () => <svg className="w-4 h-4 mr-3 text-[#141413]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconMap = () => <svg className="w-4 h-4 mr-3 text-[#141413]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconDownload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconExternal: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;

export const ShootDetails: React.FC<ShootDetailsProps> = ({ shoot }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'style' | 'team'>('details');
  const { addNotification } = useNotification();
  const [searchParams] = useSearchParams();

  // Determine if user is admin (no accessToken in URL = logged in via /admin)
  const isAdmin = !searchParams.get('token');

  // Determine which fields to show based on project type
  const isPhotoShoot = shoot.projectType === 'photo_shoot' || shoot.projectType === 'hybrid' || !shoot.projectType;
  const isVideoProject = shoot.projectType === 'video_project' || shoot.projectType === 'hybrid';
  const showLocationFields = isPhotoShoot;
  const showTeamFields = isPhotoShoot;

  // Handle copy link
  const handleCopyLink = async () => {
    const success = await copyShootLink(shoot);
    if (success) {
      addNotification('success', 'Link copied to clipboard!');
    } else {
      addNotification('error', 'Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-[#D8D9CF] text-[#141413] pb-24 md:pb-0 font-light selection:bg-[#141413] selection:text-white">
      {/* Navigation Bar */}
      <NavigationBar
        backTo="/studio"
        backLabel="Dashboard"
        variant="transparent"
        position="fixed"
      />

      {/* Header Image - Full Width, Geometric */}
      <div className="relative h-[40vh] sm:h-[50vh] w-full overflow-hidden">
        <ShootAvatar title={shoot.title} client={shoot.client} variant="hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#141413]/70 pointer-events-none" />

        {/* Large Title Overlay */}
        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-12 w-full">
          <div className="max-w-5xl mx-auto">
             <div className="flex flex-wrap items-center gap-2 sm:space-x-3 text-[10px] sm:text-xs md:text-sm uppercase font-bold tracking-[0.1em] sm:tracking-[0.2em] text-white mb-2 sm:mb-4 bg-[#141413] inline-block px-2 sm:px-3 py-1">
                <span className="truncate max-w-[120px] sm:max-w-none">{shoot.client}</span>
                <span>//</span>
                <span>{new Date(shoot.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
             </div>
             <h1 className="text-2xl sm:text-4xl md:text-7xl font-extrabold uppercase tracking-tight text-white leading-none break-words">
                {shoot.title}
             </h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Minimalist Border */}
      <div className="sticky top-0 z-30 bg-[#D8D9CF]/95 backdrop-blur-sm border-b border-[#141413]">
        <div className="max-w-5xl mx-auto flex">
          {['details', 'style', ...(showTeamFields ? ['team'] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-4 sm:py-5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all min-h-[44px] touch-manipulation
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
        
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

              {/* Logistics Card - Only for photo shoots and hybrid */}
              {showLocationFields && (
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
              )}
              
              {/* Documents Card */}
              <div className="bg-[#141413] text-white p-4 sm:p-8 border border-[#141413]">
                 <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#9E9E98] mb-4 sm:mb-6">Production Files</h3>
                 <div className="space-y-3 sm:space-y-4">
                    {/* Share Button */}
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center justify-center w-full p-3 sm:p-4 min-h-[44px] bg-transparent border border-[#9E9E98] text-white hover:bg-white hover:text-[#141413] transition-colors touch-manipulation active:scale-[0.98]"
                    >
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">🔗 Copy Link</span>
                    </button>

                    {shoot.callSheetUrl && (
                      <a href={shoot.callSheetUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-3 sm:p-4 min-h-[44px] bg-transparent border border-[#9E9E98] hover:bg-white hover:text-[#141413] hover:border-white transition-all group touch-manipulation">
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Call Sheet</span>
                        <IconDownload />
                      </a>
                    )}
                    {shoot.moodboardUrl && (
                      <a href={shoot.moodboardUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-3 sm:p-4 min-h-[44px] bg-transparent border border-[#9E9E98] hover:bg-white hover:text-[#141413] hover:border-white transition-all group touch-manipulation">
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Moodboard</span>
                        <IconExternal />
                      </a>
                    )}

                    {/* PHOTO WORKFLOW STATUS - Only for photo shoots and hybrid */}
                    {isPhotoShoot && shoot.photoStatus === 'selection_ready' && shoot.photoSelectionUrl && (
                      <a href={shoot.photoSelectionUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-3 sm:p-4 min-h-[44px] bg-[#D8D9CF] text-[#141413] border border-[#D8D9CF] hover:bg-white transition-colors touch-manipulation">
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Select Photos</span>
                        <IconExternal />
                      </a>
                    )}

                    {/* SELECTED PHOTOS - Show after client selected */}
                    {isPhotoShoot && shoot.selectedPhotosUrl && (
                      <a href={shoot.selectedPhotosUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-3 sm:p-4 min-h-[44px] bg-white text-[#141413] border-2 border-[#141413] hover:bg-[#D8D9CF] transition-colors touch-manipulation">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider block truncate">🎯 Review Selected</span>
                          <span className="text-[10px] sm:text-xs text-[#9E9E98] mt-1 block truncate">Photos for editing</span>
                        </div>
                        <IconExternal className="flex-shrink-0 ml-2" />
                      </a>
                    )}

                    {isPhotoShoot && shoot.photoStatus === 'editing' && !shoot.selectedPhotosUrl && (
                      <div className="w-full p-3 sm:p-4 min-h-[44px] bg-transparent border border-[#9E9E98] opacity-60 cursor-not-allowed">
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider italic">Editing in Progress...</span>
                      </div>
                    )}

                    {isPhotoShoot && shoot.photoStatus === 'delivered' && shoot.finalPhotosUrl && (
                      <a href={shoot.finalPhotosUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 bg-[#D8D9CF] text-[#141413] border border-[#D8D9CF] hover:bg-white transition-colors">
                        <span className="text-sm font-bold uppercase tracking-wider">Download Final Photos</span>
                        <IconDownload />
                      </a>
                    )}

                    {/* VIDEO WORKFLOW STATUS - Only for video projects and hybrid */}
                    {isVideoProject && shoot.videoStatus === 'draft' && shoot.videoUrl && (
                      <div className="w-full p-4 bg-transparent border border-[#9E9E98]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold uppercase tracking-wider">Video Draft</span>
                          <span className="text-xs text-[#9E9E98] uppercase">In Progress</span>
                        </div>
                        <a href={shoot.videoUrl} target="_blank" rel="noreferrer" className="text-xs underline hover:text-[#D8D9CF]">
                          View Draft
                        </a>
                      </div>
                    )}

                    {isVideoProject && shoot.videoStatus === 'editing' && (
                      <div className="w-full p-4 bg-transparent border border-[#9E9E98] opacity-60 cursor-not-allowed">
                        <span className="text-sm font-bold uppercase tracking-wider italic">Video Editing...</span>
                      </div>
                    )}

                    {isVideoProject && shoot.videoStatus === 'review' && shoot.videoUrl && (
                      <a href={shoot.videoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 bg-[#D8D9CF] text-[#141413] border border-[#D8D9CF] hover:bg-white transition-colors">
                        <span className="text-sm font-bold uppercase tracking-wider">Review Video</span>
                        <IconExternal />
                      </a>
                    )}

                    {isVideoProject && shoot.videoStatus === 'final' && shoot.videoUrl && (
                      <a href={shoot.videoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-4 bg-[#D8D9CF] text-[#141413] border border-[#D8D9CF] hover:bg-white transition-colors">
                        <span className="text-sm font-bold uppercase tracking-wider">Download Final Video</span>
                        <IconDownload />
                      </a>
                    )}

                    {/* Revision Notes - Show for video projects in review status */}
                    {isVideoProject && shoot.videoStatus === 'review' && shoot.revisionNotes && (
                      <div className="w-full p-4 bg-transparent border border-[#9E9E98]">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E98] mb-2">Revision Notes</p>
                        <p className="text-sm font-serif italic whitespace-pre-wrap">{shoot.revisionNotes}</p>
                      </div>
                    )}

                    {/* DOCUMENTS - Admin only */}
                    {isAdmin && shoot.documents && shoot.documents.length > 0 && (
                      <div className="border-t border-[#9E9E98] pt-4 mt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E98] mb-3">
                          📁 Documents (Admin Only)
                        </p>
                        <div className="space-y-2">
                          {shoot.documents.map((doc, index) => (
                            <a
                              key={index}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between w-full p-3 bg-transparent border border-[#9E9E98] hover:bg-white hover:text-[#141413] transition-colors group"
                            >
                              <div className="flex items-center space-x-2">
                                <span>
                                  {doc.type === 'client_contract' && '📄'}
                                  {doc.type === 'model_release' && '✍️'}
                                  {doc.type === 'location_permit' && '📍'}
                                  {doc.type === 'nda' && '🔒'}
                                  {doc.type === 'other' && '📎'}
                                </span>
                                <div>
                                  <span className="text-xs font-bold uppercase tracking-wider block">
                                    {doc.name}
                                  </span>
                                  <span className="text-[10px] uppercase text-[#9E9E98]">
                                    {doc.type.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <IconExternal />
                            </a>
                          ))}
                        </div>
                      </div>
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

        {/* TEAM TAB - Only for photo shoots and hybrid */}
        {activeTab === 'team' && showTeamFields && (
          <div className="space-y-16">
            {/* Crew Section */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-[#141413] pb-2">Crew</h3>
              <TeamList team={shoot.team} />
            </section>

            {/* Talent Section */}
            {shoot.talent && shoot.talent.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-[#141413] pb-2">Talent</h3>
                <TalentList talent={shoot.talent} />
              </section>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
