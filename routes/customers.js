const config = require('../config/config');
var express = require('express');
const stripe = require('../libs/stripe');
var router = express.Router();

router.get('/', function (req, res, next) {
  const { customerId } = req.query;
  if (customerId) {
    res.redirect(`/customers/${customerId}`);
  } else {
    res.redirect('/');
  }

});

router.get('/:customerId', async function (req, res, next) {
  const { customerId } = req.params;
  try {
    const customer = await stripe.getCustomer(customerId);
    const cards = await stripe.getCards(customerId);
    const subscriptions = await stripe.getSubscriptions(customerId);
    res.render('customers', {
      customer: customer,
      cards: cards,
      subscriptions: subscriptions,
      stripePublicKey: config.stripePublicKey
    });
  } catch (error) {
    res.render('error', { error });
  }
});

router.post('/:customerId/cards/add', async function (req, res, next) {
  const { stripeToken, default_source } = req.body;
  const { customerId } = req.params;
  try {
    const card = await stripe.saveCard(customerId, stripeToken);
    if (default_source && card.id) {
      await stripe.defaultCard(customerId, card.id);
    }
    res.redirect(`/customers/${customerId}`);
  } catch (error) {
    res.render('error', { error });
  }
});

router.get('/:customerId/cards/:cardId/edit', async function (req, res, next) {
  const { cardId, customerId } = req.params;
  try {
    const customer = await stripe.getCustomer(customerId);
    const card = await stripe.getCard(customerId, cardId);
    res.render('edit', {
      customer: customer,
      card: card,
      stripePublicKey: config.stripePublicKey
    });
  } catch (error) {
    res.render('error', { error });
  }
});

router.post('/:customerId/cards/:cardId/edit', async function (req, res, next) {
  const { stripeToken, update_cvc, default_source } = req.body;
  const { cardId, customerId } = req.params;

  try {
    let updatedCardId;
    if (!update_cvc) {
      await stripe.updateCard(customerId, cardId, req.body);
      updatedCardId = cardId;
    } else {
      const newCard = await stripe.saveCard(customerId, stripeToken);
      await stripe.updateSubscriptionsAttached(customerId, cardId, newCard.id);
      await stripe.deleteCard(customerId, cardId);
      updatedCardId = newCard.id;
    }
    if (default_source && updatedCardId) {
      await stripe.defaultCard(customerId, updatedCardId);
    }
    res.redirect(`/customers/${customerId}`);
  } catch (error) {
    res.render('error', { error });
  }
});

router.get('/:customerId/cards/:cardId/editcvc', async function (req, res, next) {
  const { cardId, customerId } = req.params;
  try {
    const customer = await stripe.getCustomer(customerId);
    const card = await stripe.getCard(customerId, cardId);
    res.render('editcvc', {
      customer: customer,
      card: card,
      stripePublicKey: config.stripePublicKey
    });
  } catch (error) {
    res.render('error', { error });
  }

});

router.post('/:customerId/cards/:cardId/editcvc', async function (req, res, next) {
  const { cvcToken } = req.body;
  const { cardId, customerId } = req.params;
  try {
    const charge = await stripe.createCvcCharge(customerId, cardId, cvcToken);
    if (charge && charge.id) {
      await stripe.cancelCharge(charge.id);
    }
    res.redirect(`/customers/${customerId}`);
  } catch (error) {
    res.render('error', { error });
  }
});

router.get('/:customerId/cards/:cardId/delete', async function (req, res, next) {
  const { cardId, customerId } = req.params;
  try {
    const customer = await stripe.getCustomer(customerId);
    if (customer.default_source != cardId) {
      await stripe.updateSubscriptionsAttached(customerId, cardId, customer.default_source);
      await stripe.deleteCard(customerId, cardId);
    }
    res.redirect(`/customers/${customerId}`);
  } catch (error) {
    res.render('error', { error });
  }
});

module.exports = router;
