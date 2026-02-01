import React, { useState } from 'react';
import { TeamMember } from '../../types';
import { isValidEmail, isValidPhone } from '../../utils/validation';

interface TeamBuilderProps {
  team: TeamMember[];
  onChange: (team: TeamMember[]) => void;
}

export const TeamBuilder: React.FC<TeamBuilderProps> = ({ team, onChange }) => {
  const [teamMember, setTeamMember] = useState<TeamMember>({
    role: '',
    name: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateMember = (): boolean => {
    const newErrors: { email?: string; phone?: string } = {};

    if (teamMember.email && !isValidEmail(teamMember.email)) {
      newErrors.email = 'Invalid email';
    }

    if (teamMember.phone && !isValidPhone(teamMember.phone)) {
      newErrors.phone = 'Invalid phone';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTeamMember = () => {
    if (!teamMember.role.trim() || !teamMember.name.trim()) return;
    if (!validateMember()) return;

    onChange([...team, teamMember]);
    setTeamMember({ role: '', name: '', phone: '', email: '' });
    setErrors({});
  };

  const removeTeamMember = (index: number) => {
    onChange(team.filter((_, i) => i !== index));
  };

  return (
    <>
      {team.length > 0 && (
        <div className="space-y-2 mb-6">
          {team.map((member, idx) => (
            <div key={idx} className="p-3 sm:p-4 bg-[#F0F0EB] border border-[#141413]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-sm block text-[#141413] uppercase tracking-wide truncate">
                    {member.name}
                  </span>
                  <span className="text-xs text-[#9E9E98] uppercase tracking-widest">{member.role}</span>
                  {member.email && (
                    <span className="text-xs text-[#9E9E98] block mt-1 break-all">{member.email}</span>
                  )}
                  {member.phone && (
                    <span className="text-xs text-[#9E9E98] font-mono block">{member.phone}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeTeamMember(idx)}
                  className="text-[#9E9E98] hover:text-red-600 font-bold uppercase text-xs transition-colors min-h-[44px] px-2 -mx-2 sm:mx-0 sm:px-0 touch-manipulation self-start sm:self-center flex-shrink-0"
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
        <p className="text-xs font-bold uppercase tracking-widest text-[#141413] mb-4">Add Crew Member</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <input
              placeholder="ROLE (e.g. PHOTOGRAPHER)"
              value={teamMember.role}
              onChange={e => setTeamMember({ ...teamMember, role: e.target.value })}
              className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] uppercase w-full"
              aria-label="Team member role"
            />
          </div>
          <div>
            <input
              placeholder="NAME"
              value={teamMember.name}
              onChange={e => setTeamMember({ ...teamMember, name: e.target.value })}
              className="border-b border-[#9E9E98] bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] uppercase w-full"
              aria-label="Team member name"
            />
          </div>
          <div>
            <input
              placeholder="PHONE (OPTIONAL)"
              value={teamMember.phone}
              onChange={e => {
                setTeamMember({ ...teamMember, phone: e.target.value });
                setErrors({ ...errors, phone: undefined });
              }}
              className={`border-b bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] font-mono w-full ${
                errors.phone ? 'border-red-600' : 'border-[#9E9E98]'
              }`}
              aria-label="Team member phone"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <input
              placeholder="EMAIL (OPTIONAL)"
              value={teamMember.email}
              onChange={e => {
                setTeamMember({ ...teamMember, email: e.target.value });
                setErrors({ ...errors, email: undefined });
              }}
              className={`border-b bg-transparent py-2 text-sm focus:border-[#141413] outline-none text-[#141413] placeholder-[#9E9E98] w-full ${
                errors.email ? 'border-red-600' : 'border-[#9E9E98]'
              }`}
              aria-label="Team member email"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={addTeamMember}
          disabled={!teamMember.role.trim() || !teamMember.name.trim()}
          className="w-full py-3 min-h-[48px] bg-[#F0F0EB] hover:bg-[#141413] hover:text-white text-xs font-bold uppercase tracking-[0.2em] border border-[#141413] transition-colors disabled:opacity-50 text-[#141413] touch-manipulation active:scale-[0.98]"
        >
          Add to Call Sheet
        </button>
      </div>
    </>
  );
};
