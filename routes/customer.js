var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_Gxr8M1MRZLzF34kDIunVrKOM00K4Cv02R8');

let createCustomer = async(customerName, customerEmail, customerDescription, customerReferenceNo=null) => {
  let customer = await stripe.customers.create({
    name: customerName,
    email: customerEmail,
    description: customerDescription
  });
  return customer;
}

let retrieveCustomer = async(customerEmail) => {
  let customer = await stripe.customers.list(
    {email: customerEmail}
  );
  return customer.data[0].id;
}

let createCardToken = async(cardDetail) => {
  let token = await stripe.tokens.create(
    {card: cardDetail}
  );
  return token.id;
}

let addCardToCustomer = async(customerId, cardToken) => {
  let card = await stripe.customers.createSource(
    customerId, {source: cardToken}
  );
  return card
}

let createInvoice = async(billAmount, billCurrency, customerId, billDescription) => {
  let invoice = await stripe.invoiceItems.create({
    amount: billAmount, currency: billCurrency, customer: customerId, description: billDescription
  });
  return invoice;
}

let createInvoice = async(customerId, collectionMethod, daysUntilDue) => {
  let invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: collectionMethod,
    days_until_due: daysUntilDue
  });
  return invoice;
}

let sendInvoice = async(invoiceId) => {
  let sentInvoice = await stripe.invoices.sendInvoice(invoiceId);
  return sentInvoice
}
router.post('/newcustomer', async(req, res, next) => {
  let customerCreated = await createCustomer(req.body.name, req.body.email, req.body.description);
  res.send(customerCreated);
});

router.post('/newcard', async(req, res, next) => {
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

router.post('/sent', async(req, res, next) => {
  let customerId = await retrieveCustomer(req.body.email);
  await createInvoiceItems(req.body.amount, req.body.currency, customerId, req.body.description)
  let invoice = await createInvoice(customerId, req.body.collection_method, req.body.days_payment_dued)
  let invoiceSent = await sendInvoice(invoice.id);
  let invoicePdfLink = invoiceSent.invoice_pdf;
  let invoiceNumber = invoiceSent.number;
  res.send(invoiceSent)
});
  let customerId = await retrieveCustomer(customerEmail);
  await createInvoice(amount, currency, customerId, description);
  res.send("Create Invoice Success");
});
module.exports = router;