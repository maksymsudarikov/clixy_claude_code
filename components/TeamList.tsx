import React from 'react';
import { TeamMember } from '../types';

export const TeamList: React.FC<{ team: TeamMember[] }> = ({ team }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {team.map((member, idx) => (
        <div key={idx} className="flex items-center p-6 bg-white border border-[#141413] hover:bg-[#F0F0EB] transition-colors group">
          <div className="h-12 w-12 bg-[#141413] text-white flex items-center justify-center text-lg font-bold mr-5">
            {member.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-[#141413] uppercase tracking-wide">{member.name}</p>
            <p className="text-xs text-[#9E9E98] uppercase tracking-widest mt-0.5">{member.role}</p>
          </div>
          <div className="text-right flex flex-col items-end space-y-1">
            {member.phone && (
              <a href={`tel:${member.phone}`} className="text-xs font-mono border border-[#141413] px-2 py-1 hover:bg-[#141413] hover:text-white transition-colors">
                {member.phone}
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="text-[10px] uppercase tracking-widest text-[#9E9E98] hover:text-[#141413] border-b border-transparent hover:border-[#141413]">
                Email
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};