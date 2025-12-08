import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { Time12Hour, convertTo24Hour, formatTimeDisplay, parseTimeFrom24H } from '../../utils/timeUtils';
import { isValidTime } from '../../utils/validation';
import { IconEdit, IconClose } from '../Icons';

interface TimelineBuilderProps {
  timeline: TimelineEvent[];
  onChange: (timeline: TimelineEvent[]) => void;
}

export const TimelineBuilder: React.FC<TimelineBuilderProps> = ({ timeline, onChange }) => {
  const [timelineActivity, setTimelineActivity] = useState('');
  const [timeInput, setTimeInput] = useState<Time12Hour>({ hour: '09', minute: '00', ampm: 'AM' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const saveTimelineEvent = () => {
    if (!timelineActivity.trim()) return;

    if (!isValidTime(timeInput.hour, timeInput.minute)) {
      return;
    }

    const time24 = convertTo24Hour(timeInput.hour, timeInput.minute, timeInput.ampm);
    const newEvent: TimelineEvent = { time: time24, activity: timelineActivity.trim() };

    let newTimeline = [...timeline];

    if (editingIndex !== null) {
      newTimeline[editingIndex] = newEvent;
      setEditingIndex(null);
    } else {
      newTimeline.push(newEvent);
    }

    newTimeline.sort((a, b) => a.time.localeCompare(b.time));

    onChange(newTimeline);
    setTimelineActivity('');
    setTimeInput({ hour: '09', minute: '00', ampm: 'AM' });
  };

  const editTimelineEvent = (index: number) => {
    const eventToEdit = timeline[index];
    const parsedTime = parseTimeFrom24H(eventToEdit.time);

    setTimeInput(parsedTime);
    setTimelineActivity(eventToEdit.activity);
    setEditingIndex(index);
  };

  const removeTimelineEvent = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      setTimelineActivity('');
    }
    onChange(timeline.filter((_, i) => i !== index));
  };

  const toggleAmPm = () => {
    setTimeInput(prev => ({ ...prev, ampm: prev.ampm === 'AM' ? 'PM' : 'AM' }));
  };

  return (
    <div className="mt-8 bg-[#F0F0EB] p-6 border border-[#141413]">
      <p className="text-xs font-bold uppercase tracking-widest text-[#141413] mb-4">Run of Show</p>

      {timeline.length > 0 && (
        <div className="space-y-2 mb-6">
          {timeline.map((event, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 border border-[#141413] text-sm ${
                editingIndex === idx ? 'bg-[#141413] text-white' : 'bg-white text-[#141413]'
              }`}
            >
              <div className="flex items-center space-x-6">
                <span className="font-mono font-bold w-24">{formatTimeDisplay(event.time)}</span>
                <span className="uppercase tracking-wide">{event.activity}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => editTimelineEvent(idx)}
                  className={`${
                    editingIndex === idx ? 'text-white' : 'text-[#9E9E98] hover:text-[#141413]'
                  } transition-colors`}
                  title="Edit"
                  aria-label={`Edit ${event.activity}`}
                >
                  <IconEdit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeTimelineEvent(idx)}
                  className={`${
                    editingIndex === idx ? 'text-white' : 'text-[#9E9E98] hover:text-red-600'
                  } transition-colors`}
                  title="Remove"
                  aria-label={`Remove ${event.activity}`}
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-4 md:col-span-3 flex items-center space-x-2">
          <div className="flex-1">
            <label className="text-[10px] uppercase text-[#9E9E98] font-bold mb-1 block">Hr</label>
            <input
              type="text"
              placeholder="12"
              maxLength={2}
              value={timeInput.hour}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setTimeInput({ ...timeInput, hour: val });
              }}
              className="w-full bg-transparent border-b border-[#9E9E98] py-2 text-sm font-mono text-[#141413] focus:border-[#141413] outline-none text-center"
              aria-label="Hour"
            />
          </div>
          <span className="text-[#141413] pb-2">:</span>
          <div className="flex-1">
            <label className="text-[10px] uppercase text-[#9E9E98] font-bold mb-1 block">Min</label>
            <input
              type="text"
              placeholder="00"
              maxLength={2}
              value={timeInput.minute}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setTimeInput({ ...timeInput, minute: val });
              }}
              className="w-full bg-transparent border-b border-[#9E9E98] py-2 text-sm font-mono text-[#141413] focus:border-[#141413] outline-none text-center"
              aria-label="Minute"
            />
          </div>
          <div className="flex-1 cursor-pointer group" onClick={toggleAmPm}>
            <label className="text-[10px] uppercase text-[#9E9E98] font-bold mb-1 block opacity-0">
              M
            </label>
            <div className="w-full bg-transparent border-b border-[#9E9E98] py-2 text-sm font-mono text-[#141413] group-hover:border-[#141413] outline-none text-center select-none">
              {timeInput.ampm}
            </div>
          </div>
        </div>

        <div className="col-span-8 md:col-span-6">
          <label className="text-[10px] uppercase text-[#9E9E98] font-bold mb-1 block">Activity</label>
          <input
            placeholder="e.g. LUNCH BREAK"
            value={timelineActivity}
            onChange={e => setTimelineActivity(e.target.value)}
            className="w-full bg-transparent border-b border-[#9E9E98] py-2 text-sm uppercase placeholder-[#9E9E98] text-[#141413] focus:border-[#141413] outline-none"
            aria-label="Timeline activity"
          />
        </div>

        <div className="col-span-12 md:col-span-3 mt-4 md:mt-0">
          <button
            type="button"
            onClick={saveTimelineEvent}
            disabled={!timelineActivity.trim() || !isValidTime(timeInput.hour, timeInput.minute)}
            className={`w-full text-xs px-2 py-3 font-bold uppercase tracking-wider disabled:opacity-50 border border-[#141413] transition-colors ${
              editingIndex !== null
                ? 'bg-[#141413] text-white hover:bg-white hover:text-[#141413]'
                : 'bg-white text-[#141413] hover:bg-[#141413] hover:text-white'
            }`}
          >
            {editingIndex !== null ? 'Update' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
