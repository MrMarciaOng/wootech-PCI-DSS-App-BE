var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_Gxr8M1MRZLzF34kDIunVrKOM00K4Cv02R8');

router.post('/invoice', async(req, res) => {
  let customer = await stripe.customers.create({
    name: 'jenny rosen',  
    email: 'jenny.rosen@example.com',
    description: 'My First Test Customer (created for API docs)'
  })
  res.send(customer);
});

module.exports = router;