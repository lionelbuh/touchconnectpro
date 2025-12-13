import { getUncachableStripeClient } from './stripeClient';

async function createSubscriptionPrice() {
  try {
    console.log('Creating TouchConnectPro subscription product and price...');
    
    const stripe = await getUncachableStripeClient();
    
    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: "name:'TouchConnectPro Membership'"
    });
    
    let product;
    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log('Product already exists:', product.id);
    } else {
      // Create product
      product = await stripe.products.create({
        name: 'TouchConnectPro Membership',
        description: 'Monthly membership for entrepreneurs - includes mentor matching, coaching access, and investor visibility',
        metadata: {
          type: 'entrepreneur_membership'
        }
      });
      console.log('Created product:', product.id);
    }
    
    // Check if price already exists for this product
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    
    const monthlyPrice = existingPrices.data.find(p => 
      p.recurring?.interval === 'month' && p.unit_amount === 4900
    );
    
    if (monthlyPrice) {
      console.log('Price already exists:', monthlyPrice.id);
      console.log('\n=== USE THIS PRICE ID ===');
      console.log('STRIPE_PRICE_ID=' + monthlyPrice.id);
      return;
    }
    
    // Create $49/month recurring price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 4900, // $49.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        type: 'entrepreneur_monthly'
      }
    });
    
    console.log('Created price:', price.id);
    console.log('\n=== USE THIS PRICE ID ===');
    console.log('STRIPE_PRICE_ID=' + price.id);
    
  } catch (error) {
    console.error('Error creating price:', error);
  }
}

createSubscriptionPrice();
