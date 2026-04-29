// Backend API example for Stripe integration
// This should be implemented in your backend server (Node.js, Python, etc.)

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Create checkout session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail, metadata } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: metadata || {},
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get products and prices
app.get('/api/stripe/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    res.json({ products: products.data, prices: prices.data });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create customer portal session
app.post('/api/stripe/customer-portal', async (req, res) => {
  try {
    const { customerId } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session.id);
      // Update your database with the subscription
      break;
    
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      // Update your database with the new subscription
      break;
    
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      // Update your database with the subscription changes
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // Update your database to cancel the subscription
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded:', invoice.id);
      // Update your database with the successful payment
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Payment failed:', failedInvoice.id);
      // Handle failed payment (send email, update database, etc.)
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
