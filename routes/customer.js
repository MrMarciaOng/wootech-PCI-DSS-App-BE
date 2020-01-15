var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_Gxr8M1MRZLzF34kDIunVrKOM00K4Cv02R8');


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
router.post('/newcustomer', async(req, res) => {
  let customer = await stripe.customers.create({
    name: 'jenny rosen',  
    email: 'jenny.rosen@example.com',
    description: 'My First Test Customer (created for API docs)'
  })
  res.send(customer);
});

router.post('/newcard', async(req, res) => {
  let customerEmail = 'jenny.rosen@example.com';
  let testCard = {number: '4242424242424242', exp_month: 1, exp_year: 2021, cvc: '314'};
  //get customerID
  let customerId = await retrieveCustomer(customerEmail);
  let token = await createCardToken(testCard);
  let card = await addCardToCustomer(customerId, token);
  res.send(card);
});

router.post('/newpayable', async(req, res) => {
  let amount = 21000; //amount includes dollar and cents values
  let currency = 'sgd';
  let customerEmail = 'jenny.rosen@example.com';
  let description = 'Pest Control';
  let customerId = await retrieveCustomer(customerEmail);
  await createInvoice(amount, currency, customerId, description);
  res.send("Create Invoice Success");
});
module.exports = router;