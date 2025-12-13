import { getStripeSync } from './stripeClient';
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[WEBHOOK] Missing Supabase credentials");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    const event = await sync.processWebhook(payload, signature, uuid);
    
    console.log("[STRIPE WEBHOOK] Event type:", event.type);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const entrepreneurEmail = session.metadata?.entrepreneurEmail;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      
      console.log("[STRIPE WEBHOOK] Checkout completed for:", entrepreneurEmail);
      console.log("[STRIPE WEBHOOK] Customer ID:", customerId);
      console.log("[STRIPE WEBHOOK] Subscription ID:", subscriptionId);
      
      if (entrepreneurEmail) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase
            .from("ideas")
            .update({
              payment_status: "paid",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              payment_date: new Date().toISOString()
            })
            .ilike("entrepreneur_email", entrepreneurEmail);
          
          if (error) {
            console.error("[STRIPE WEBHOOK] Error updating idea:", error);
          } else {
            console.log("[STRIPE WEBHOOK] Updated idea payment status to paid for:", entrepreneurEmail);
          }
        }
      }
    }
    
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      
      console.log("[STRIPE WEBHOOK] Payment failed for customer:", customerId);
      
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from("ideas")
          .update({ payment_status: "payment_failed" })
          .eq("stripe_customer_id", customerId);
      }
    }
    
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      
      console.log("[STRIPE WEBHOOK] Subscription cancelled for customer:", customerId);
      
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from("ideas")
          .update({ 
            payment_status: "cancelled",
            status: "pre-approved"
          })
          .eq("stripe_customer_id", customerId);
      }
    }
  }
}
