export interface Time12Hour {
  hour: string;
  minute: string;
  ampm: 'AM' | 'PM';
}

export const formatTimeDisplay = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
};

export const convertTo24Hour = (h: string, m: string, ampm: 'AM' | 'PM'): string => {
  let hour = parseInt(h, 10);
  if (isNaN(hour)) hour = 12;

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const minute = parseInt(m, 10);
  const validMinute = isNaN(minute) ? 0 : Math.min(59, Math.max(0, minute));

  return `${hour.toString().padStart(2, '0')}:${validMinute.toString().padStart(2, '0')}`;
};

export const parseTimeFrom24H = (timeStr: string): Time12Hour => {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';

  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  return {
    hour: h.toString().padStart(2, '0'),
    minute: mStr || '00',
    ampm: ampm
  };
};

export const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};
