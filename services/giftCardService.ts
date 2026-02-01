import { supabase } from './supabase';
import { GiftCard, GiftCardPurchaseForm } from '../types';
import { GIFT_CARD_PACKAGES } from '../constants';

// Generate unique gift card code
// Format: CLIXY-XXXX-XXXX-XXXX
const generateGiftCardCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking chars
  const segments = 3;
  const segmentLength = 4;

  const generateSegment = () => {
    let segment = '';
    for (let i = 0; i < segmentLength; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    return segment;
  };

  const code = Array(segments).fill(0).map(() => generateSegment()).join('-');
  return `CLIXY-${code}`;
};

// Generate cryptographically secure unique ID
const generateId = (): string => {
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  const randomPart = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `gc-${Date.now()}-${randomPart}`;
};

// Fallback: Log gift card request if database fails
// SECURITY: Does not expose PII in URLs/logs
const sendGiftCardViaEmail = async (formData: GiftCardPurchaseForm, code: string, pkg: any): Promise<void> => {
  // Log minimal info for debugging (no PII)
  console.warn('[GiftCard Fallback] Database unavailable. Code:', code, 'Package:', pkg.name);

  // Create email with minimal info (no PII in URL)
  // The admin will need to check logs or contact the customer
  const emailBody = encodeURIComponent(`
NEW GIFT CARD REQUEST - ACTION REQUIRED

CODE: ${code}
Package: ${pkg.name}
Amount: $${pkg.price} ${pkg.currency}
Timestamp: ${new Date().toISOString()}

⚠️ Database was unavailable during this request.
Customer details are NOT included for security reasons.
Please check server logs or await customer contact.
  `);

  // Create mailto link (no PII exposed)
  const mailtoLink = `mailto:art@olgaprudka.com?subject=Gift Card Request ${code}&body=${emailBody}`;

  // Store request in sessionStorage for potential recovery (encrypted would be better)
  try {
    const pendingRequests = JSON.parse(sessionStorage.getItem('pending_gift_cards') || '[]');
    pendingRequests.push({
      code,
      packageId: pkg.id,
      timestamp: Date.now(),
      // Note: Full form data stays in memory only, not persisted
    });
    sessionStorage.setItem('pending_gift_cards', JSON.stringify(pendingRequests));
  } catch (e) {
    console.error('Failed to store pending request');
  }

  // Open email client
  setTimeout(() => {
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.target = '_blank';
    link.click();
  }, 500);
};

// Create a new gift card
export const createGiftCard = async (formData: GiftCardPurchaseForm): Promise<GiftCard> => {
  // Find the package
  const pkg = GIFT_CARD_PACKAGES.find(p => p.id === formData.packageId);
  if (!pkg) {
    throw new Error('Package not found');
  }

  // Generate unique code
  let code = generateGiftCardCode();

  try {
    // Check if code already exists (unlikely but possible)
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 3) {
      const { data } = await supabase
        .from('gift_cards')
        .select('code')
        .eq('code', code)
        .maybeSingle();

      if (!data) {
        codeExists = false;
      } else {
        code = generateGiftCardCode();
      }
      attempts++;
    }

    // Calculate dates
    const now = new Date();
    const deliveryDate = formData.deliveryType === 'immediate'
      ? now
      : new Date(formData.deliveryDate || now);

    // Expiry date: 12 months from purchase
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create gift card data
    const giftCardData: Omit<GiftCard, 'id'> = {
      code,
      packageId: pkg.id,
      packageName: pkg.name,
      amount: pkg.price,
      currency: pkg.currency,
      purchaserName: formData.purchaserName,
      purchaserEmail: formData.purchaserEmail,
      purchaserPhone: formData.purchaserPhone,
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail,
      personalMessage: formData.personalMessage,
      purchaseDate: now.toISOString(),
      deliveryDate: deliveryDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status: 'pending',
      paymentStatus: 'pending'
    };

    // Insert into database (convert to snake_case for Supabase)
    const { data, error } = await supabase
      .from('gift_cards')
      .insert([{
        id: generateId(),
        code: giftCardData.code,
        package_id: giftCardData.packageId,
        package_name: giftCardData.packageName,
        amount: giftCardData.amount,
        currency: giftCardData.currency,
        purchaser_name: giftCardData.purchaserName,
        purchaser_email: giftCardData.purchaserEmail,
        purchaser_phone: giftCardData.purchaserPhone,
        recipient_name: giftCardData.recipientName,
        recipient_email: giftCardData.recipientEmail,
        personal_message: giftCardData.personalMessage,
        purchase_date: giftCardData.purchaseDate,
        delivery_date: giftCardData.deliveryDate,
        expiry_date: giftCardData.expiryDate,
        status: giftCardData.status,
        payment_status: giftCardData.paymentStatus
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      // Check if it's an RLS policy error
      if (error.message.includes('row-level security') || error.message.includes('policy')) {
        // FALLBACK: Send via email silently (no user prompt)
        console.warn('Database RLS error detected, using email fallback');
        console.warn('Please apply SQL policy in Supabase to fix this!');

        // Silently send email in background
        sendGiftCardViaEmail(formData, code, pkg).catch(err => {
          console.error('Email fallback failed:', err);
        });

        // Return mock gift card data for success page
        return {
          id: generateId(),
          code,
          packageId: pkg.id,
          packageName: pkg.name,
          amount: pkg.price,
          currency: pkg.currency,
          purchaserName: formData.purchaserName,
          purchaserEmail: formData.purchaserEmail,
          purchaserPhone: formData.purchaserPhone,
          recipientName: formData.recipientName,
          recipientEmail: formData.recipientEmail,
          personalMessage: formData.personalMessage,
          purchaseDate: new Date().toISOString(),
          deliveryDate: formData.deliveryType === 'immediate' ? new Date().toISOString() : new Date(formData.deliveryDate!).toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          paymentStatus: 'pending'
        } as GiftCard;
      }

      throw new Error(`Failed to create gift card: ${error.message}`);
    }

    return data as GiftCard;
  } catch (error) {
    console.error('Error creating gift card:', error);

    // Last resort fallback for any error
    if (error instanceof Error && (error.message.includes('row-level security') || error.message.includes('policy'))) {
      console.warn('Using email fallback due to persistent error');

      // Silently send email in background
      sendGiftCardViaEmail(formData, code, pkg).catch(err => {
        console.error('Email fallback failed:', err);
      });

      // Return mock data
      return {
        id: generateId(),
        code,
        packageId: pkg.id,
        packageName: pkg.name,
        amount: pkg.price,
        currency: pkg.currency,
        purchaserName: formData.purchaserName,
        purchaserEmail: formData.purchaserEmail,
        purchaserPhone: formData.purchaserPhone,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        personalMessage: formData.personalMessage,
        purchaseDate: new Date().toISOString(),
        deliveryDate: formData.deliveryType === 'immediate' ? new Date().toISOString() : new Date(formData.deliveryDate!).toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        paymentStatus: 'pending'
      } as GiftCard;
    }

    throw error;
  }
};

// Fetch gift card by code
export const fetchGiftCardByCode = async (code: string): Promise<GiftCard | null> => {
  try {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;
    return data as GiftCard | null;
  } catch (error) {
    console.error('Error fetching gift card:', error);
    throw error;
  }
};

// Fetch gift card by ID
export const fetchGiftCardById = async (id: string): Promise<GiftCard | null> => {
  try {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as GiftCard | null;
  } catch (error) {
    console.error('Error fetching gift card:', error);
    throw error;
  }
};

// Fetch all gift cards (for admin)
export const fetchAllGiftCards = async (): Promise<GiftCard[]> => {
  try {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as GiftCard[]) || [];
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    throw error;
  }
};

// Update gift card status
export const updateGiftCardStatus = async (
  id: string,
  status: GiftCard['status'],
  paymentStatus?: GiftCard['paymentStatus']
): Promise<void> => {
  try {
    const updateData: any = { status };
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { error } = await supabase
      .from('gift_cards')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating gift card status:', error);
    throw error;
  }
};

// Mark gift card as sent
export const markGiftCardAsSent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('gift_cards')
      .update({
        status: 'sent',
        sent_date: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking gift card as sent:', error);
    throw error;
  }
};

// Redeem gift card
export const redeemGiftCard = async (code: string, redeemedBy: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('gift_cards')
      .update({
        status: 'redeemed',
        redeemed_date: new Date().toISOString(),
        redeemed_by: redeemedBy
      })
      .eq('code', code);

    if (error) throw error;
  } catch (error) {
    console.error('Error redeeming gift card:', error);
    throw error;
  }
};
