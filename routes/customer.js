var express = require('express');
var config = require('../config.json');
console.log(config);

var router = express.Router();
const stripe = require('stripe')(config.stripeTestKey);

// Customer interactions and adding cards to customer
let createCustomer = async (customerName, customerEmail, customerDescription, customerReferenceNo = null) => {
  let customer = await stripe.customers.create({
    name: customerName,
    email: customerEmail,
    description: customerDescription
  });
  return customer;
}

let retrieveCustomer = async (customerEmail) => {
  let customer = await stripe.customers.list(
    { email: customerEmail }
  );
  return customer.data[0].id;
}

let createCardToken = async (cardDetail) => {
  let token = await stripe.tokens.create(
    { card: cardDetail }
  );
  return token.id;
}

let addCardToCustomer = async (customerId, cardToken) => {
  let card = await stripe.customers.createSource(
    customerId, { source: cardToken }
  );
  return card
}

// Sending one-off invoices
let createInvoiceItems = async (billAmount, billCurrency, customerId, billDescription) => {
  let invoice = await stripe.invoiceItems.create({
    amount: billAmount, currency: billCurrency, customer: customerId, description: billDescription
  });
  return invoice;
}

let createInvoice = async (customerId, collectionMethod, daysUntilDue) => {
  let invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: collectionMethod,
    days_until_due: daysUntilDue
  });
  return invoice;
}

let sendInvoice = async (invoiceId) => {
  let sentInvoice = await stripe.invoices.sendInvoice(invoiceId);
  return sentInvoice
}

// Sending subscription invoices
let sendInvoiceSubscription = async (customerId, planId, collectionMethod, daysUntilDue) => {
  let sentInvoiceSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ plan: planId }],
    collection_method: collectionMethod,
    days_until_due: daysUntilDue,
  });
  return sentInvoiceSubscription;
}

// Allow company to create subscription service
let createSubscriptionService = async (serviceName, serviceType) => {
  let service_product = await stripe.products.create({
    name: serviceName,
    type: serviceType
  });
  return service_product;
}

let createSubscriptionServicePlan = async (planNickname, serviceProductId, subscriptionAmount, subscriptionCurrency, subscriptionInterval, subscriptionIntervalCount = null, subscriptionUsage_Type) => {
  let service_subscription_plan = await stripe.plans.create({
    nickname: planNickname,
    product: serviceProductId,
    amount: subscriptionAmount,
    currency: subscriptionCurrency,
    interval: subscriptionInterval, //monthly, or yearly
    interval_count: subscriptionIntervalCount, //every number of months or year
    usage_type: subscriptionUsage_Type
  });
  return service_subscription_plan;
}

let addSubscriptionProductServiceToCustomer = async (customerId, serviceSubscriptionId, serviceQuantity) => {
  let subscription = await stripe.subscription.create({
    customer: customerId,
    items: [
      {
        plan: serviceSubscriptionId,
        quantity: serviceQuantity
      }
    ]
  });
  return subscription;
}
// must be able to add more than one subscription

router.post('/newcustomer', async (req, res, next) => {
  let customerCreated = await createCustomer(req.body.name, req.body.email, req.body.description);
  res.send(customerCreated);
});

router.post('/newcard', async (req, res, next) => {
  let customerId = await retrieveCustomer(req.body.email);
  let token = await createCardToken({
    number: req.body.card_number,
    exp_month: req.body.card_exp_mm,
    exp_year: req.body.card_exp_yyyy,
    cvc: req.body.card_cvc
  });
  let card = await addCardToCustomer(customerId, token);
  res.send(card);
});

router.post('/sent', async (req, res, next) => {
  let customerId = await retrieveCustomer(req.body.email);
  await createInvoiceItems(req.body.amount, req.body.currency, customerId, req.body.description)
  let invoice = await createInvoice(customerId, req.body.collection_method, req.body.days_payment_dued)
  let invoiceSent = await sendInvoice(invoice.id);
  let invoicePdfLink = invoiceSent.invoice_pdf;
  let invoiceNumber = invoiceSent.number;
  res.send(invoiceSent)
});

router.post('/billNewCustomer', async (req, res, next) => {
  //create customer
  let customer = await createCustomer(req.body.full_name, req.body.emailID);

  //token customer card
  let token = await createCardToken({
    number: req.body.credit_card_number,
    exp_month: req.body.expiry_month,
    exp_year: req.body.expiry_year,
    cvc: req.body.cvv
  });
  let card = await addCardToCustomer(customer.id, token);

  //send invoice 
  await createInvoiceItems(req.body.amount_to_pay*100, 'SGD', customer.id)
  let invoice = await createInvoice(customer.id, 'send_invoice',1)
  let invoiceSent = await sendInvoice(invoice.id);
  //let invoiceSent = await sendInvoice(invoice.id);

  res.json({"status":"OK"})
});

router.post('/subscriptionSent', async (req, res, next) => {
  let customerId = await retrieveCustomer(req.body.email);
  let subscriptionCreated = await sendInvoiceSubscription(customerId, req.body.subscriptionId, req.body.collection_method, req.body.days_payment_dued);
  res.send(subscriptionCreated);
});

router.post('/subscription/create', async (req, res, next) => {
  let service = await createSubscriptionService(req.body.service_name, req.body.service_type);
  let plan = await createSubscriptionServicePlan(req.body.plan_name, service.id, req.body.amount, req.body.currency, req.body.interval, req.body.count, req.body.usage_type);
  res.send(plan);
});


module.exports = router;