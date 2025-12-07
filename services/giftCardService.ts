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

// Generate unique ID
const generateId = (): string => {
  return `gc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Fallback: Send gift card via email if database fails
const sendGiftCardViaEmail = async (formData: GiftCardPurchaseForm, code: string, pkg: any): Promise<void> => {
  // Create email body with all gift card info
  const emailBody = encodeURIComponent(`
NEW GIFT CARD REQUEST - URGENT (Database unavailable)

CODE: ${code}
Package: ${pkg.name}
Amount: $${pkg.price} ${pkg.currency}

PURCHASER:
Name: ${formData.purchaserName}
Email: ${formData.purchaserEmail}
Phone: ${formData.purchaserPhone}

RECIPIENT:
Name: ${formData.recipientName}
Email: ${formData.recipientEmail}

Delivery: ${formData.deliveryType === 'immediate' ? 'Immediate' : formData.deliveryDate}
Message: ${formData.personalMessage || 'None'}

⚠️ This request was sent via fallback because the database was unavailable.
Please process manually and add to database when possible.
  `);

  // Create mailto link
  const mailtoLink = `mailto:maksym.sudarikov@gmail.com?subject=URGENT: Gift Card Request ${code}&body=${emailBody}`;

  // Only open email client after a small delay to ensure user sees the success page first
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
        // FALLBACK: Send via email
        console.warn('Database RLS error detected, using email fallback');
        console.warn('Please apply SQL policy in Supabase to fix this!');

        // Only use email fallback if user confirms (to avoid browser blocking)
        if (confirm('Database is unavailable. Send request via email instead?')) {
          await sendGiftCardViaEmail(formData, code, pkg);
        }

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

      // Only use email fallback if user confirms
      if (confirm('Database is unavailable. Send request via email instead?')) {
        await sendGiftCardViaEmail(formData, code, pkg);
      }

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
