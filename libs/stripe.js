const config = require('../config/config');
const stripe = require('stripe')(config.stripeSecretKey);

stripe.setApiVersion('2019-05-16');

module.exports = {

  getSubscriptions: async (customerId) => {
    return stripe.subscriptions.list({
      customer: customerId,
      limit: 100
    });
  },

  updateSubscriptionsAttached: async (customerId, oldCardId, newCardId) => {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100
    });

    await Promise.all(
      subscriptions.data.map(async subscription => {
        if (subscription.default_source && subscription.default_source == oldCardId) {
          await stripe.subscriptions.update(subscription.id, {
            default_source: newCardId
          });
        }
      })
    )
  },

  getCustomer: async (customerId) => {
    return stripe.customers.retrieve(customerId);
  },

  getCards: async (customerId) => {
    return stripe.customers.listSources(
      customerId, {
        limit: 100
      }
    );
  },

  getCard: async (customerId, cardId) => {
    return stripe.customers.retrieveSource(customerId, cardId);
  },

  updateCard: async (customerId, cardId, data) => {
    const { cardholder_name, expdate, zipcode } = data;
    const [exp_month, exp_year] = expdate.split('/');
    return stripe.customers.updateSource(
      customerId,
      cardId, {
        name: cardholder_name,
        exp_month: exp_month,
        exp_year: exp_year,
        address_zip: zipcode
      }
    );
  },

  createCvcCharge: async (customerId, cardId, cvcToken) => {
    return stripe.charges.create({
      amount: 100,
      currency: "usd",
      source: cardId,
      description: "CVC update",
      cvc_update: cvcToken,
      customer: customerId,
      capture: false
    });
  },

  cancelCharge: async (chargeId) => {
    return stripe.refunds.create({
      charge: chargeId
    });
  },

  saveCard: async (customerId, token) => {
    return stripe.customers.createSource(
      customerId, {
        source: token
      }
    );
  },

  defaultCard: async (customerId, cardId) => {
    return stripe.customers.update(
      customerId, {
        default_source: cardId
      }
    );
  },

  deleteCard: async (customerId, cardId) => {
    return stripe.customers.deleteSource(customerId, cardId);
  }

}
