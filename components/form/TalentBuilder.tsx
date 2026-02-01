import React, { useState } from 'react';
import { Talent } from '../../types';
import { isValidEmail, isValidPhone, sanitizeUrl } from '../../utils/validation';

interface TalentBuilderProps {
  talent: Talent[];
  onChange: (talent: Talent[]) => void;
}

export const TalentBuilder: React.FC<TalentBuilderProps> = ({ talent, onChange }) => {
  const [talentMember, setTalentMember] = useState<Talent>({
    name: '',
    role: '',
    phone: '',
    email: '',
    agencyUrl: '',
    photo: '',
    arrivalTime: '',
    sizes: {
      height: '',
      clothing: '',
      shoes: ''
    },
    notes: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string; agencyUrl?: string }>({});

  const validateTalent = (): boolean => {
    const newErrors: { email?: string; phone?: string; agencyUrl?: string } = {};

    if (talentMember.email && !isValidEmail(talentMember.email)) {
      newErrors.email = 'Invalid email';
    }

    if (talentMember.phone && !isValidPhone(talentMember.phone)) {
      newErrors.phone = 'Invalid phone';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTalent = () => {
    if (!talentMember.name.trim()) return;
    if (!validateTalent()) return;

    // Sanitize URLs
    const cleanTalent = {
      ...talentMember,
      agencyUrl: talentMember.agencyUrl ? sanitizeUrl(talentMember.agencyUrl) : undefined,
      photo: talentMember.photo ? sanitizeUrl(talentMember.photo) : undefined
    };

    onChange([...talent, cleanTalent]);
    setTalentMember({
      name: '',
      role: '',
      phone: '',
      email: '',
      agencyUrl: '',
      photo: '',
      arrivalTime: '',
      sizes: { height: '', clothing: '', shoes: '' },
      notes: ''
    });
    setErrors({});
    setShowAdvanced(false);
  };

  const removeTalent = (index: number) => {
    onChange(talent.filter((_, i) => i !== index));
  };

  return (
    <>
      {talent.length > 0 && (
        <div className="space-y-2 mb-6">
          {talent.map((member, idx) => (
            <div key={idx} className="p-3 sm:p-4 bg-[#F0F0EB] border border-[#141413]">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {member.photo && (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover border border-[#141413] flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm block text-[#141413] uppercase tracking-wide truncate">
                    {member.name}
                  </span>
                  {member.role && (
                    <span className="text-xs text-[#9E9E98] uppercase tracking-widest block">{member.role}</span>
                  )}
                  {member.agencyUrl && (
                    <a
                      href={member.agencyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#141413] hover:underline block mt-1"
                    >
                      View Agency Profile →
                    </a>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[#9E9E98]">
                    {member.email && <span className="break-all">{member.email}</span>}
                    {member.phone && <span className="font-mono">{member.phone}</span>}
                    {member.arrivalTime && <span>Arrives: {member.arrivalTime}</span>}
                  </div>
                  {member.sizes && (member.sizes.height || member.sizes.clothing || member.sizes.shoes) && (
                    <div className="mt-2 text-xs text-[#9E9E98]">
                      <span className="font-bold text-[#141413]">Sizes:</span>{' '}
                      {member.sizes.height && `${member.sizes.height}`}
                      {member.sizes.clothing && ` • ${member.sizes.clothing}`}
                      {member.sizes.shoes && ` • Shoes ${member.sizes.shoes}`}
                    </div>
                  )}
                  {member.notes && (
                    <p className="text-xs text-[#9E9E98] mt-2 italic">{member.notes}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#9E9E98]/30 sm:border-0 sm:mt-0 sm:pt-0">
                <button
                  type="button"
                  onClick={() => removeTalent(idx)}
                  className="text-[#9E9E98] hover:text-red-600 font-bold uppercase text-xs transition-colors min-h-[44px] px-2 -mx-2 touch-manipulation"
                  aria-label={`Remove ${member.name}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 sm:p-6 border border-[#141413] bg-white">
        <p className="text-xs font-bold uppercase tracking-widest text-[#141413] mb-4">Add Talent</p>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <input
              placeholder="NAME *"
              value={talentMember.name}
              onChange={e => setTalentMember({ ...talentMember, name: e.target.value })}
              className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] uppercase w-full"
              aria-label="Talent name"
            />
          </div>
          <div>
            <input
              placeholder="ROLE (e.g. MODEL, ACTOR)"
              value={talentMember.role}
              onChange={e => setTalentMember({ ...talentMember, role: e.target.value })}
              className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] uppercase w-full"
              aria-label="Talent role"
            />
          </div>
          <div>
            <input
              placeholder="PHONE (OPTIONAL)"
              value={talentMember.phone}
              onChange={e => {
                setTalentMember({ ...talentMember, phone: e.target.value });
                setErrors({ ...errors, phone: undefined });
              }}
              className={`border-b bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] font-mono w-full ${
                errors.phone ? 'border-red-600' : 'border-[#9E9E98]'
              }`}
              aria-label="Talent phone"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <input
              placeholder="EMAIL (OPTIONAL)"
              value={talentMember.email}
              onChange={e => {
                setTalentMember({ ...talentMember, email: e.target.value });
                setErrors({ ...errors, email: undefined });
              }}
              className={`border-b bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] w-full ${
                errors.email ? 'border-red-600' : 'border-[#9E9E98]'
              }`}
              aria-label="Talent email"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Agency URL */}
        <div className="mb-6">
          <input
            placeholder="AGENCY PROFILE URL (e.g. modelagency.com/talent-name)"
            value={talentMember.agencyUrl}
            onChange={e => setTalentMember({ ...talentMember, agencyUrl: e.target.value })}
            className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] w-full"
            aria-label="Agency profile URL"
          />
          <p className="text-[10px] text-[#9E9E98] mt-2 uppercase tracking-wider">
            Link to agency profile with full stats and portfolio
          </p>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-[#9E9E98] hover:text-[#141413] uppercase tracking-widest mb-4 transition-colors"
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced Options (Sizes, Photo, Notes)
        </button>

        {showAdvanced && (
          <div className="space-y-6 mb-6 p-4 border border-[#9E9E98] bg-[#F0F0EB]">
            {/* Photo URL */}
            <div>
              <input
                placeholder="HEADSHOT URL (OPTIONAL)"
                value={talentMember.photo}
                onChange={e => setTalentMember({ ...talentMember, photo: e.target.value })}
                className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] w-full"
                aria-label="Headshot photo URL"
              />
            </div>

            {/* Arrival Time */}
            <div>
              <label className="text-xs text-[#9E9E98] uppercase tracking-widest block mb-2">Arrival Time</label>
              <input
                type="time"
                value={talentMember.arrivalTime}
                onChange={e => setTalentMember({ ...talentMember, arrivalTime: e.target.value })}
                className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] w-full"
                aria-label="Arrival time"
              />
            </div>

            {/* Sizes - Optional if agency URL provided */}
            <div>
              <p className="text-xs text-[#9E9E98] uppercase tracking-widest mb-3">
                Quick Reference Sizes {talentMember.agencyUrl && '(Optional - see agency for full stats)'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  placeholder="HEIGHT"
                  value={talentMember.sizes?.height || ''}
                  onChange={e => setTalentMember({
                    ...talentMember,
                    sizes: { ...talentMember.sizes, height: e.target.value }
                  })}
                  className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] uppercase w-full"
                  aria-label="Height"
                />
                <input
                  placeholder="CLOTHING"
                  value={talentMember.sizes?.clothing || ''}
                  onChange={e => setTalentMember({
                    ...talentMember,
                    sizes: { ...talentMember.sizes, clothing: e.target.value }
                  })}
                  className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] uppercase w-full"
                  aria-label="Clothing size"
                />
                <input
                  placeholder="SHOES"
                  value={talentMember.sizes?.shoes || ''}
                  onChange={e => setTalentMember({
                    ...talentMember,
                    sizes: { ...talentMember.sizes, shoes: e.target.value }
                  })}
                  className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] uppercase w-full"
                  aria-label="Shoe size"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <textarea
                placeholder="NOTES (dietary restrictions, special needs, etc.)"
                value={talentMember.notes}
                onChange={e => setTalentMember({ ...talentMember, notes: e.target.value })}
                rows={2}
                className="border border-[#9E9E98] bg-transparent p-3 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] w-full resize-none"
                aria-label="Notes"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={addTalent}
          disabled={!talentMember.name.trim()}
          className="w-full py-3 min-h-[48px] bg-[#F0F0EB] hover:bg-[#141413] hover:text-white text-xs font-bold uppercase tracking-[0.2em] border border-[#141413] transition-colors disabled:opacity-50 text-[#141413] touch-manipulation active:scale-[0.98]"
        >
          Add Talent
        </button>
      </div>
    </>
  );
};
