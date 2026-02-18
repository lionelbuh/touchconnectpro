import { getUncachableStripeClient } from './stripeClient';

export class StripeService {
  async createCheckoutSession(
    entrepreneurEmail: string,
    entrepreneurName: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const stripe = await getUncachableStripeClient();
    
    const customer = await stripe.customers.create({
      email: entrepreneurEmail,
      name: entrepreneurName,
      metadata: { entrepreneurEmail },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "TouchConnectPro Membership",
              description: "Monthly membership with mentor access, AI business planning tools, and investor connections"
            },
            unit_amount: 999,
            recurring: { interval: "month" }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { entrepreneurEmail, source: "touchconnectpro" },
    });

    return { url: session.url, customerId: customer.id };
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }
}

export const stripeService = new StripeService();
