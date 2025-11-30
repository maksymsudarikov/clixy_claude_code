export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Allow empty URLs for optional fields

  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  // Remove any dangerous protocols
  const dangerous = /^(javascript|data|vbscript|file):/i;
  if (dangerous.test(url.trim())) {
    return '';
  }

  return url.trim();
};

export const isValidTime = (hour: string, minute: string): boolean => {
  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);

  return !isNaN(h) && !isNaN(m) && h >= 1 && h <= 12 && m >= 0 && m <= 59;
};

export const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Optional field

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field

  // Basic phone validation - at least 7 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7;
};

export const validateShootForm = (data: {
  title: string;
  client: string;
  date: string;
  description: string;
  locationAddress: string;
  coverImage: string;
  moodboardUrl?: string;
  callSheetUrl?: string;
  finalPhotosUrl?: string;
  stylingUrl?: string;
  locationMapUrl?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title?.trim()) errors.push('Title is required');
  if (!data.client?.trim()) errors.push('Client is required');
  if (!data.date) errors.push('Date is required');
  if (!data.description?.trim()) errors.push('Description is required');
  if (!data.locationAddress?.trim()) errors.push('Location address is required');

  if (data.coverImage && !isValidUrl(data.coverImage)) {
    errors.push('Cover image URL is invalid');
  }

  if (data.moodboardUrl && !isValidUrl(data.moodboardUrl)) {
    errors.push('Moodboard URL is invalid');
  }

  if (data.callSheetUrl && !isValidUrl(data.callSheetUrl)) {
    errors.push('Call sheet URL is invalid');
  }

  if (data.finalPhotosUrl && !isValidUrl(data.finalPhotosUrl)) {
    errors.push('Final photos URL is invalid');
  }

  if (data.stylingUrl && !isValidUrl(data.stylingUrl)) {
    errors.push('Styling URL is invalid');
  }

  if (data.locationMapUrl && !isValidUrl(data.locationMapUrl)) {
    errors.push('Location map URL is invalid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
