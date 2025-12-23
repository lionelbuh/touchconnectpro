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
    
    try {
      await sync.processWebhook(payload, signature, uuid);
      console.log("[STRIPE WEBHOOK] Webhook processed successfully by Replit connector");
    } catch (error: any) {
      console.error("[STRIPE WEBHOOK] Error processing webhook:", error.message);
      throw error;
    }
  }

  static async handleCheckoutCompleted(customerEmail: string, customerId: string, subscriptionId: string): Promise<void> {
    console.log("[STRIPE WEBHOOK] Processing checkout completion for:", customerEmail);
    console.log("[STRIPE WEBHOOK] Customer ID:", customerId);
    console.log("[STRIPE WEBHOOK] Subscription ID:", subscriptionId);
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("[STRIPE WEBHOOK] Supabase client not available");
      return;
    }

    // Only update payment_status to "paid" - admin will manually approve and assign mentor
    const { data, error } = await supabase
      .from("ideas")
      .update({
        payment_status: "paid",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        payment_date: new Date().toISOString()
      })
      .ilike("entrepreneur_email", customerEmail);
    
    if (error) {
      console.error("[STRIPE WEBHOOK] Error updating idea:", error);
    } else {
      console.log("[STRIPE WEBHOOK] Updated idea payment status to paid for:", customerEmail);
      console.log("[STRIPE WEBHOOK] Status remains pre-approved - admin will manually approve after mentor assignment");
    }
  }

  static async handlePaymentFailed(customerId: string): Promise<void> {
    console.log("[STRIPE WEBHOOK] Payment failed for customer:", customerId);
    
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase
      .from("ideas")
      .update({ payment_status: "payment_failed" })
      .eq("stripe_customer_id", customerId);
  }

  static async handleSubscriptionCancelled(customerId: string): Promise<void> {
    console.log("[STRIPE WEBHOOK] Subscription cancelled for customer:", customerId);
    
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase
      .from("ideas")
      .update({ 
        payment_status: "cancelled",
        status: "pre-approved"
      })
      .eq("stripe_customer_id", customerId);
  }
}
