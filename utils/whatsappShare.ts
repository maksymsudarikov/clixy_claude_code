import { Shoot } from '../types';

/**
 * Share shoot details via WhatsApp
 * Opens WhatsApp with pre-filled message containing shoot info and access link
 */
export const shareViaWhatsApp = (shoot: Shoot, baseUrl: string = window.location.origin): void => {
  // Format date nicely
  const formattedDate = new Date(shoot.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Project type emoji
  const typeEmoji = shoot.projectType === 'video_project' ? '🎬' :
                    shoot.projectType === 'hybrid' ? '🎯' : '📸';

  // Build shoot URL with access token
  const shootUrl = `${baseUrl}/#/shoot/${shoot.id}?token=${shoot.accessToken}`;

  // Build message with shoot details
  const message = `${typeEmoji} ${shoot.title}

📅 ${formattedDate}
🏢 ${shoot.client}
${shoot.locationName ? `📍 ${shoot.locationName}` : ''}
${shoot.startTime ? `🕐 ${shoot.startTime} - ${shoot.endTime}` : ''}

View shoot details:
${shootUrl}

---
Powered by Clixy`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Open WhatsApp with pre-filled message
  // Use web.whatsapp.com for desktop, wa.me for mobile detection
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const whatsappUrl = isMobile
    ? `whatsapp://send?text=${encodedMessage}`
    : `https://web.whatsapp.com/send?text=${encodedMessage}`;

  // Open in new window
  window.open(whatsappUrl, '_blank');
};

/**
 * Share shoot details via WhatsApp to a specific phone number
 */
export const shareViaWhatsAppToNumber = (
  shoot: Shoot,
  phoneNumber: string,
  baseUrl: string = window.location.origin
): void => {
  // Format date nicely
  const formattedDate = new Date(shoot.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Project type emoji
  const typeEmoji = shoot.projectType === 'video_project' ? '🎬' :
                    shoot.projectType === 'hybrid' ? '🎯' : '📸';

  // Build shoot URL with access token
  const shootUrl = `${baseUrl}/#/shoot/${shoot.id}?token=${shoot.accessToken}`;

  // Build message
  const message = `${typeEmoji} ${shoot.title}

📅 ${formattedDate}
🏢 ${shoot.client}
${shoot.locationName ? `📍 ${shoot.locationName}` : ''}
${shoot.startTime ? `🕐 ${shoot.startTime} - ${shoot.endTime}` : ''}

View shoot details:
${shootUrl}

---
Powered by Clixy`;

  // Encode message and clean phone number
  const encodedMessage = encodeURIComponent(message);
  const cleanNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digits

  // Build WhatsApp URL with phone number
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  // Open in new window
  window.open(whatsappUrl, '_blank');
};

/**
 * Copy shoot link to clipboard (alternative to WhatsApp)
 */
export const copyShootLink = async (shoot: Shoot, baseUrl: string = window.location.origin): Promise<boolean> => {
  const shootUrl = `${baseUrl}/#/shoot/${shoot.id}?token=${shoot.accessToken}`;

  try {
    await navigator.clipboard.writeText(shootUrl);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shootUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};
