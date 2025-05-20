import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const db = admin.firestore();

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig || '',
      endpointSecret || ''
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { client_reference_id, metadata } = session;

        if (metadata?.type === 'donation') {
          await handleDonationSuccess(session);
        } else if (metadata?.type === 'membership') {
          await handleMembershipSuccess(session);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Handle successful payment
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Handle failed payment
        await handlePaymentFailure(paymentIntent);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

async function handleDonationSuccess(session: Stripe.Checkout.Session) {
  if (!session.client_reference_id) return;

  await db.collection('donations')
    .doc(session.client_reference_id)
    .update({
      status: 'completed',
      transaction_id: session.payment_intent as string,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
}

async function handleMembershipSuccess(session: Stripe.Checkout.Session) {
  if (!session.client_reference_id) return;

  await db.collection('members')
    .doc(session.client_reference_id)
    .update({
      membership_status: 'active',
      last_renewal_date: admin.firestore.FieldValue.serverTimestamp(),
      next_renewal_date: getNextRenewalDate(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.metadata.reference_id) return;

  const type = paymentIntent.metadata.type;
  const referenceId = paymentIntent.metadata.reference_id;

  if (type === 'donation') {
    await db.collection('donations')
      .doc(referenceId)
      .update({
        status: 'completed',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.metadata.reference_id) return;

  const type = paymentIntent.metadata.type;
  const referenceId = paymentIntent.metadata.reference_id;

  if (type === 'donation') {
    await db.collection('donations')
      .doc(referenceId)
      .update({
        status: 'failed',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
  }
}

function getNextRenewalDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
}
