import React from 'react';
import { Talent } from '../types';

export const TalentList: React.FC<{ talent: Talent[] }> = ({ talent }) => {
  if (!talent || talent.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#9E9E98] uppercase tracking-wider">No talent added yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {talent.map((member, idx) => (
        <div key={idx} className="bg-white border border-[#141413] p-6 hover:bg-[#F0F0EB] transition-colors group">
          <div className="flex gap-4 mb-4">
            {/* Photo or Avatar */}
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-20 h-20 object-cover border border-[#141413]"
              />
            ) : (
              <div className="h-20 w-20 bg-[#141413] text-white flex items-center justify-center text-2xl font-bold">
                {member.name.charAt(0)}
              </div>
            )}

            {/* Name & Role */}
            <div className="flex-1">
              <p className="text-lg font-bold text-[#141413] uppercase tracking-wide">{member.name}</p>
              {member.role && (
                <p className="text-xs text-[#9E9E98] uppercase tracking-widest mt-1">{member.role}</p>
              )}
              {member.arrivalTime && (
                <p className="text-xs text-[#141413] font-mono mt-2">
                  Arrives: <span className="font-bold">{member.arrivalTime}</span>
                </p>
              )}
            </div>
          </div>

          {/* Agency Link */}
          {member.agencyUrl && (
            <div className="mb-4">
              <a
                href={member.agencyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs uppercase tracking-widest text-[#141413] border-b border-[#141413] hover:text-[#9E9E98] hover:border-[#9E9E98] transition-colors"
              >
                View Agency Profile →
              </a>
            </div>
          )}

          {/* Sizes */}
          {member.sizes && (member.sizes.height || member.sizes.clothing || member.sizes.shoes) && (
            <div className="mb-4 p-3 bg-[#F0F0EB] border border-[#9E9E98]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E98] mb-2">Sizes</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {member.sizes.height && (
                  <div>
                    <span className="text-[#9E9E98] uppercase text-[10px]">Height</span>
                    <p className="font-bold font-mono">{member.sizes.height}</p>
                  </div>
                )}
                {member.sizes.clothing && (
                  <div>
                    <span className="text-[#9E9E98] uppercase text-[10px]">Clothing</span>
                    <p className="font-bold font-mono">{member.sizes.clothing}</p>
                  </div>
                )}
                {member.sizes.shoes && (
                  <div>
                    <span className="text-[#9E9E98] uppercase text-[10px]">Shoes</span>
                    <p className="font-bold font-mono">{member.sizes.shoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="flex flex-wrap gap-2">
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="text-xs font-mono border border-[#141413] px-3 py-1.5 hover:bg-[#141413] hover:text-white transition-colors"
              >
                {member.phone}
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="text-xs uppercase tracking-widest border border-[#9E9E98] px-3 py-1.5 text-[#9E9E98] hover:border-[#141413] hover:text-[#141413] transition-colors"
              >
                Email
              </a>
            )}
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="mt-4 pt-4 border-t border-[#9E9E98]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9E9E98] mb-2">Notes</p>
              <p className="text-sm font-serif italic text-[#141413]">{member.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
