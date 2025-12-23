import { getStripeSync } from './stripeClient';
import { createClient } from "@supabase/supabase-js";
import { Resend } from 'resend';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "buhler.lionel+admin@gmail.com";

async function getResendClient() {
  // First try direct RESEND_API_KEY (for production deployments like Render)
  if (process.env.RESEND_API_KEY) {
    console.log("[WEBHOOK] Using RESEND_API_KEY environment variable");
    return {
      client: new Resend(process.env.RESEND_API_KEY),
      fromEmail: process.env.RESEND_FROM_EMAIL || "hello@touchconnectpro.com"
    };
  }

  // Fallback to Replit connectors (for development on Replit)
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    console.log("[WEBHOOK] No RESEND_API_KEY and no Replit connector available");
    return null;
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    if (!response.ok) {
      console.log("[WEBHOOK] Failed to fetch Resend connection settings");
      return null;
    }

    const connections = await response.json();
    const connectionSettings = connections?.items?.[0];

    if (!connectionSettings?.settings?.api_key) {
      console.log("[WEBHOOK] No API key found in Resend connection settings");
      return null;
    }

    console.log("[WEBHOOK] Using Resend via Replit connector");
    return {
      client: new Resend(connectionSettings.settings.api_key),
      fromEmail: connectionSettings.settings.from_email || "hello@touchconnectpro.com"
    };
  } catch (error) {
    console.error("[WEBHOOK] Error getting Resend client:", error);
    return null;
  }
}

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
    console.log("[STRIPE WEBHOOK] ========== MEMBERSHIP PAYMENT ==========");
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
      .ilike("entrepreneur_email", customerEmail)
      .select();
    
    if (error) {
      console.error("[STRIPE WEBHOOK] Error updating idea:", error);
    } else {
      console.log("[STRIPE WEBHOOK] Updated idea payment status to paid for:", customerEmail);
      console.log("[STRIPE WEBHOOK] Status remains pre-approved - admin will manually approve after mentor assignment");
      
      // Send notification emails
      const entrepreneurName = (data as any)?.[0]?.entrepreneur_name || "Entrepreneur";
      const resendData = await getResendClient();
      if (resendData) {
        const { client: resendClient, fromEmail } = resendData;
        
        // Email to entrepreneur
        try {
          await resendClient.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: "Payment Received - TouchConnectPro Membership",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Payment Confirmed!</h2>
                <p>Hi ${entrepreneurName},</p>
                <p>Your $49/month membership payment has been received. A mentor will be assigned to you shortly.</p>
                <p>You'll receive a notification once your mentor is ready to connect with you.</p>
                <p>Best regards,<br>The TouchConnectPro Team</p>
              </div>
            `
          });
          console.log("[STRIPE WEBHOOK] Payment confirmation email sent to:", customerEmail);
        } catch (emailError: any) {
          console.error("[STRIPE WEBHOOK] Error sending entrepreneur email:", emailError.message);
        }
        
        // Email to admin
        try {
          await resendClient.emails.send({
            from: fromEmail,
            to: ADMIN_EMAIL,
            subject: `New Paid Member: ${entrepreneurName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Membership Payment</h2>
                <p><strong>Entrepreneur:</strong> ${entrepreneurName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Status:</strong> Payment received, awaiting mentor assignment</p>
                <p>Please assign a mentor to this entrepreneur in the admin dashboard.</p>
              </div>
            `
          });
          console.log("[STRIPE WEBHOOK] Admin notification sent for payment from:", customerEmail);
        } catch (emailError: any) {
          console.error("[STRIPE WEBHOOK] Error sending admin email:", emailError.message);
        }
      }
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

  static async handleCoachPurchase(session: any): Promise<void> {
    const coachId = session.metadata?.coach_id;
    const serviceType = session.metadata?.service_type || 'session';
    const entrepreneurEmail = session.metadata?.entrepreneur_email || session.customer_email;
    const entrepreneurName = session.metadata?.entrepreneur_name || 'Entrepreneur';
    const coachName = session.metadata?.coach_name || 'Coach';
    const amountTotal = session.amount_total || 0;
    const platformFee = Math.round(amountTotal * 0.20);
    const coachEarnings = amountTotal - platformFee;
    
    console.log("[STRIPE WEBHOOK] Coach ID:", coachId);
    console.log("[STRIPE WEBHOOK] Entrepreneur:", entrepreneurEmail);
    console.log("[STRIPE WEBHOOK] Service type:", serviceType);
    console.log("[STRIPE WEBHOOK] Amount:", amountTotal);
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("[STRIPE WEBHOOK] Supabase client not available");
      return;
    }
    
    // Idempotency guard: check if this session was already processed
    const { data: existingPurchase } = await supabase
      .from("coach_purchases")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();
    
    if (existingPurchase) {
      console.log("[STRIPE WEBHOOK] Duplicate event - session already processed:", session.id);
      return;
    }
    
    // Get service name based on type
    let serviceName = 'Coaching Session';
    if (serviceType === 'intro') serviceName = '15 Minutes Introductory Call';
    else if (serviceType === 'monthly') serviceName = 'Monthly Coaching / Full Course';
    
    // Save purchase to coach_purchases table
    try {
      const { error: insertError } = await supabase
        .from("coach_purchases")
        .insert({
          coach_id: coachId,
          coach_name: coachName,
          entrepreneur_email: entrepreneurEmail,
          entrepreneur_name: entrepreneurName,
          service_type: serviceType,
          service_name: serviceName,
          amount: amountTotal,
          platform_fee: platformFee,
          coach_earnings: coachEarnings,
          stripe_session_id: session.id,
          status: 'completed'
        });
      
      if (insertError) {
        console.error("[STRIPE WEBHOOK] Error saving coach purchase:", insertError);
      } else {
        console.log("[STRIPE WEBHOOK] Coach purchase saved successfully");
      }
    } catch (dbError: any) {
      console.error("[STRIPE WEBHOOK] Database error:", dbError.message);
    }
    
    // Get coach email for notification
    try {
      const { data: coach } = await supabase
        .from("coach_applications")
        .select("email")
        .eq("id", coachId)
        .single();
      
      const coachEmail = coach?.email;
      
      // Get Resend client for sending emails
      const resendData = await getResendClient();
      if (resendData) {
        const { client: resendClient, fromEmail } = resendData;
        
        // Send email to entrepreneur
        if (entrepreneurEmail) {
          try {
            await resendClient.emails.send({
              from: fromEmail,
              to: entrepreneurEmail,
              subject: `Coaching Service Purchased - ${coachName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Purchase Confirmed!</h2>
                  <p>Hi ${entrepreneurName},</p>
                  <p>Your purchase of <strong>${serviceName}</strong> with <strong>${coachName}</strong> has been confirmed.</p>
                  <p><strong>Amount Paid:</strong> $${(amountTotal / 100).toFixed(2)}</p>
                  <p>The coach will be notified and will reach out to you shortly to schedule your session.</p>
                  <p>Best regards,<br>The TouchConnectPro Team</p>
                </div>
              `
            });
            console.log("[STRIPE WEBHOOK] Purchase confirmation email sent to entrepreneur:", entrepreneurEmail);
          } catch (e: any) {
            console.error("[STRIPE WEBHOOK] Error sending entrepreneur email:", e.message);
          }
        }
        
        // Send email to coach
        if (coachEmail) {
          try {
            await resendClient.emails.send({
              from: fromEmail,
              to: coachEmail,
              subject: `New Booking: ${serviceName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>New Coaching Booking!</h2>
                  <p>Hi ${coachName},</p>
                  <p>You have a new booking for <strong>${serviceName}</strong>.</p>
                  <p><strong>Client:</strong> ${entrepreneurName}</p>
                  <p><strong>Your Earnings:</strong> $${(coachEarnings / 100).toFixed(2)} (after 20% platform fee)</p>
                  <p>Please reach out to your client to schedule the session.</p>
                  <p>Best regards,<br>The TouchConnectPro Team</p>
                </div>
              `
            });
            console.log("[STRIPE WEBHOOK] Booking notification email sent to coach:", coachEmail);
          } catch (e: any) {
            console.error("[STRIPE WEBHOOK] Error sending coach email:", e.message);
          }
        }
        
        // Send email to admin
        try {
          await resendClient.emails.send({
            from: fromEmail,
            to: ADMIN_EMAIL,
            subject: `New Coach Marketplace Sale: ${coachName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Coach Marketplace Sale</h2>
                <p><strong>Coach:</strong> ${coachName}</p>
                <p><strong>Client:</strong> ${entrepreneurName} (${entrepreneurEmail})</p>
                <p><strong>Service:</strong> ${serviceName}</p>
                <p><strong>Total Amount:</strong> $${(amountTotal / 100).toFixed(2)}</p>
                <p><strong>Platform Fee (20%):</strong> $${(platformFee / 100).toFixed(2)}</p>
                <p><strong>Coach Earnings:</strong> $${(coachEarnings / 100).toFixed(2)}</p>
              </div>
            `
          });
          console.log("[STRIPE WEBHOOK] Admin notification sent for coach purchase");
        } catch (e: any) {
          console.error("[STRIPE WEBHOOK] Error sending admin email:", e.message);
        }
      }
    } catch (e: any) {
      console.error("[STRIPE WEBHOOK] Error getting coach email:", e.message);
    }
  }
}
