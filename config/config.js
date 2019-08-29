const config = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  useNgrok: process.env.USE_NGROK,
};

module.exports = config;
