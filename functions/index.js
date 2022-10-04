//Set up Firebase
import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

//Required Firebase on every file
import functions from "firebase-functions";

//Pull in all the functions from the dif files

// ---- Shopify Import ----
//import app from "./shopify-auth.js";
import shopifyReceiveWebhook from "./shopify-receiveWebhook.js";
import shopifyReceiveWebhook2 from "./shopify-receiveWebhook2.js";
import shopifyCreateDiscount from "./shopify-createDiscount.js";
import shopifyUpdateDiscount from "./shopify-updateDiscount.js";

// ---- Shopify Export ----
//export const shopifyAuth = functions.https.onRequest(app);
export const shopify_receiveWebhook = functions.https.onRequest(shopifyReceiveWebhook);
export const shopify_receiveWebhook2 = functions.https.onRequest(shopifyReceiveWebhook2);
export const shopify_createDiscount = functions.https.onRequest(shopifyCreateDiscount);
export const shopify_updateDiscount = functions.https.onRequest(shopifyUpdateDiscount);


// ---- Firestore Function Import ----
import authOnCreate from "./auth-onCreate.js";
import discountOnCreate from "./discount-onCreate.js";
import discountAdditionOnCreate from "./discountAddition-onCreate.js";
import itemOnCreate from "./item-onCreate.js";
import orderOnCreate from "./order-onCreate.js";
import reviewOnCreate from "./review-onCreate.js";
import referralOnCreate from "./referral-onCreate.js";

// ---- Firestore Function Export ----
export const auth_onCreate = authOnCreate;
export const discount_onCreate = discountOnCreate;
export const discountAddition_onCreate = discountAdditionOnCreate;
export const item_onCreate = itemOnCreate;
export const order_onCreate = orderOnCreate;
export const review_onCreate = reviewOnCreate;
export const referral_onCreate = referralOnCreate;















// SCHEDULED FUNCTIONS
  // note for scheduled functions like pubsub, see this video at 28 min https://www.youtube.com/watch?v=gA6WGYQWrKc
// AUTH MIDDLEWARE
  // https://diligentdev.medium.com/firebase-functions-tutorial-authentication-1e39b97f448c
// HOW TO SET PRIVATE KEYS FOR FIREBASE AUTH
  // https://blog.logrocket.com/rest-api-firebase-cloud-functions-typescript-firestore/
// ALLOW UNAUTHENTICATED INVOKATION OF FUNCTION TO WRITE TO DB
  // https://cloud.google.com/functions/docs/securing/managing-access-iam#console_4
