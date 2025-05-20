import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const createCheckout = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const {
      amount,
      donationType,
      purpose,
      email,
      donationId,
      metadata
    } = req.body;

    const isRecurring = donationType !== 'one_time';

    let session;
    if (isRecurring) {
      // Create recurring price
      const price = await stripe.prices.create({
        unit_amount: Math.round(parseFloat(amount) * 100),
        currency: 'usd',
        recurring: {
          interval: donationType === 'monthly' ? 'month' : 
                    donationType === 'quarterly' ? 'quarter' : 'year'
        },
        product_data: {
          name: `${purpose} Donation`,
        },
      });

      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: price.id,
          quantity: 1,
        }],
        success_url: `${req.headers.origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/donation`,
        customer_email: email,
        client_reference_id: donationId,
        metadata: metadata
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(parseFloat(amount) * 100),
            product_data: {
              name: `${purpose} Donation`,
            },
          },
          quantity: 1,
        }],
        success_url: `${req.headers.origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/donation`,
        customer_email: email,
        client_reference_id: donationId,
        metadata: metadata
      });
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});
