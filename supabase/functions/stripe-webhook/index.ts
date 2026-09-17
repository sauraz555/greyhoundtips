import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function corsResponse(body: string | object | null, status = 200) {
  const headers = corsHeaders;
  if (status === 204) {
    return new Response(null, { status, headers });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'Bolt Integration', version: '1.0.0' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse({}, 204);
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

    if (!signature) {
      return corsResponse({ error: 'Missing signature' }, 400);
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          await supabase
            .from('stripe_subscriptions')
            .update({
              subscription_id: subscription.id,
              price_id: subscription.items.data[0]?.price?.id ?? null,
              status: subscription.status,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_end: subscription.trial_end,
            })
            .eq('customer_id', customerId);
        }

        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string,
          );
          await supabase.from('stripe_orders').insert({
            checkout_session_id: session.id,
            payment_intent_id: paymentIntent.id,
            customer_id: customerId,
            amount_subtotal: session.amount_subtotal ?? 0,
            amount_total: session.amount_total ?? 0,
            currency: session.currency ?? 'aud',
            payment_status: session.payment_status,
            status: 'completed',
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from('stripe_subscriptions')
          .update({
            subscription_id: subscription.id,
            price_id: subscription.items.data[0]?.price?.id ?? null,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
            trial_end: subscription.trial_end,
            updated_at: new Date().toISOString(),
          })
          .eq('customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from('stripe_subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription.id);
        break;
      }

      default:
        break;
    }

    return corsResponse({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return corsResponse({ error: message }, 400);
  }
});
