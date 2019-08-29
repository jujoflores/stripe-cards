# stripe-cards

This is a demo application to showcase the use of Stripe Elements for credit card creation and edit

# How to install

Clone the repo, then install the dependencies:

`npm install`

Edit config file

You can use either env variables or set your variables directly in `/config/config.js` file for local development only.
If you like to test in your local environment using https set to true the variable `useNgrok` in config file, When you run the application it will show you the ngrok URL in the console.

```
const config = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  useNgrok: process.env.USE_NGROK,
};
```

Start application

`npm start`
