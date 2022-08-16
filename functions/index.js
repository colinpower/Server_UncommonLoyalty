//Set up Firebase
import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

//Required Firebase on every file
import functions from "firebase-functions";

//Pull in all the functions from the dif files

// ---- Shopify Import ----
//import app from "./shopify-auth.js";
import shopifyReceiveWebhook from "./shopify-receiveWebhook.js";
import shopifyCreateDiscount from "./shopify-createDiscount.js";

// ---- Shopify Export ----
//export const shopifyAuth = functions.https.onRequest(app);
export const shopify_receiveWebhook = functions.https.onRequest(shopifyReceiveWebhook);
export const shopify_createDiscount = functions.https.onRequest(shopifyCreateDiscount);


// ---- Firestore Function Import ----
import discountOnCreate from "./discount-onCreate.js";
import referralOnCreate from "./referral-onCreate.js";
import reviewOnCreate from "./review-onCreate.js";
//import reviewOnCreate from "./createHistoryOnNewOrder.js";

// ---- Firestore Function Export ----
export const discount_onCreate = discountOnCreate;
export const referral_onCreate = referralOnCreate;
export const review_onCreate = reviewOnCreate;















// SCHEDULED FUNCTIONS
  // note for scheduled functions like pubsub, see this video at 28 min https://www.youtube.com/watch?v=gA6WGYQWrKc
// AUTH MIDDLEWARE
  // https://diligentdev.medium.com/firebase-functions-tutorial-authentication-1e39b97f448c
// HOW TO SET PRIVATE KEYS FOR FIREBASE AUTH
  // https://blog.logrocket.com/rest-api-firebase-cloud-functions-typescript-firestore/
// ALLOW UNAUTHENTICATED INVOKATION OF FUNCTION TO WRITE TO DB
  // https://cloud.google.com/functions/docs/securing/managing-access-iam#console_4
