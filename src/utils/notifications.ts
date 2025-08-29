import { supabase } from "../integrations/supabase/client";

export type EmailEvent =
  | {
      type: "user.registered";
      payload: {
        email: string;
        name?: string;
        phone?: string;
        membershipType?: string;
        memberId?: string;
      };
    }
  | {
      type: "membership.pending_payment";
      payload: {
        email: string;
        name?: string;
        membershipType?: string;
        amount?: string;
        checkoutUrl?: string;
      };
    }
  | {
      type: "appointment.requested";
      payload: {
        email: string;
        name?: string;
        phone?: string;
        datetime?: string;
        message?: string;
      };
    }
  | {
      type: "donation.created";
      payload: {
        amount: number;
        currency: string;
        donorEmail: string;
        donorName?: string;
        purpose?: string;
        receiptUrl?: string;
        paymentMethod?: string;
        paymentId?: string;
        donationDate?: string;
      };
    }
  | {
      type: "membership.payment_confirmed";
      payload: {
        email: string;
        name?: string;
        amount: number;
        currency: string;
        receiptUrl?: string;
      };
    };

// Track notification attempts to prevent flooding
const notificationAttempts = new Map<
  string,
  { count: number; timestamp: number }
>();

/**
 * Send email notifications based on various events
 * @param event The email event to send
 * @param retryCount Number of retry attempts (internal use)
 * @returns The response data from the notification service
 */
export async function sendNotification(
  event: EmailEvent,
  retryCount = 0,
): Promise<any> {
  try {
    // Generate a key for tracking notification attempts
    const key = `${event.type}-${JSON.stringify(event.payload)}`;
    const now = Date.now();

    // Check if we've tried to send this notification recently
    const attempts = notificationAttempts.get(key);
    if (attempts && now - attempts.timestamp < 60000 && attempts.count >= 3) {
      console.warn(
        `Too many notification attempts for ${event.type}. Skipping.`,
      );
      return { success: false, error: "Rate limited" };
    }

    // Update attempts counter
    notificationAttempts.set(key, {
      count: (attempts?.count || 0) + 1,
      timestamp: now,
    });

    // Invoke the Supabase function
    const { data, error } = await supabase.functions.invoke("notify-emails", {
      body: event,
    });

    if (error) {
      console.error(`Error sending ${event.type} notification:`, error);

      // Retry logic for transient errors
      if (retryCount < 2) {
        console.log(`Retrying notification (attempt ${retryCount + 1})...`);
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
        );
        return sendNotification(event, retryCount + 1);
      }

      throw error;
    }

    // Reset attempts counter on success
    if (attempts) {
      notificationAttempts.delete(key);
    }

    return data;
  } catch (err) {
    console.error(`Failed to send ${event.type} notification:`, err);
    throw err;
  }
}

/**
 * Helper function to send user registration notification
 */
export async function sendUserRegistrationNotification({
  email,
  name,
  phone,
  membershipType,
  memberId,
}: {
  email: string;
  name?: string;
  phone?: string;
  membershipType?: string;
  memberId?: string;
}) {
  return sendNotification({
    type: "user.registered",
    payload: { email, name, phone, membershipType, memberId },
  });
}

/**
 * Helper function to send membership payment pending notification
 */
export async function sendMembershipPendingNotification({
  email,
  name,
  membershipType,
  amount,
  checkoutUrl,
}: {
  email: string;
  name?: string;
  membershipType?: string;
  amount?: string;
  checkoutUrl?: string;
}) {
  return sendNotification({
    type: "membership.pending_payment",
    payload: { email, name, membershipType, amount, checkoutUrl },
  });
}

/**
 * Helper function to send appointment request notification
 */
export async function sendAppointmentRequestNotification({
  email,
  name,
  phone,
  datetime,
  message,
}: {
  email: string;
  name?: string;
  phone?: string;
  datetime?: string;
  message?: string;
}) {
  return sendNotification({
    type: "appointment.requested",
    payload: { email, name, phone, datetime, message },
  });
}

/**
 * Helper function to send donation notification
 */
export async function sendDonationNotification({
  amount,
  currency,
  donorEmail,
  donorName,
  purpose,
  receiptUrl,
  paymentMethod,
  paymentId,
  donationDate,
}: {
  amount: number;
  currency: string;
  donorEmail: string;
  donorName?: string;
  purpose?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  paymentId?: string;
  donationDate?: string;
}) {
  return sendNotification({
    type: "donation.created",
    payload: {
      amount,
      currency,
      donorEmail,
      donorName,
      purpose,
      receiptUrl,
      paymentMethod,
      paymentId,
      donationDate,
    },
  });
}

/**
 * Helper function to send membership payment confirmation notification
 */
export async function sendMembershipPaymentConfirmation({
  email,
  name,
  amount,
  currency,
  receiptUrl,
}: {
  email: string;
  name?: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
}) {
  return sendNotification({
    type: "membership.payment_confirmed",
    payload: { email, name, amount, currency, receiptUrl },
  });
}
