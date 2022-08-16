

// SCHEDULED FUNCTIONS
// note for scheduled functions like pubsub, see this video at 28 min https://www.youtube.com/watch?v=gA6WGYQWrKc

// AUTH MIDDLEWARE
// https://diligentdev.medium.com/firebase-functions-tutorial-authentication-1e39b97f448c

// HOW TO SET PRIVATE KEYS FOR FIREBASE AUTH
// https://blog.logrocket.com/rest-api-firebase-cloud-functions-typescript-firestore/

// ALLOW UNAUTHENTICATED INVOKATION OF FUNCTION TO WRITE TO DB
// https://cloud.google.com/functions/docs/securing/managing-access-iam#console_4

//Set up Firebase
import admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

//Required Firebase on every file
import functions from "firebase-functions";

//Pull in all the functions from the dif files
import nameOfTest123 from "./test123.js";
//import app from "./shopify.js";
import shopifyWebhook from "./shopifyWebhook.js";
import testReceiveOrder from "./testReceiveOrder.js";
import receiveOrder from "./receiveOrder.js";
//import GQLresult from "./makeGQLonNewDiscount.js";

import discountOnCreate from "./discount-onCreate";

import graphQLExpress from "./shopifyGraphQL.js";
import createHistoryOnNewDiscountFunction from "./createHistoryOnNewDiscount.js";
import createHistoryOnNewOrderFunction from "./createHistoryOnNewOrder.js";
import createHistoryOnNewReferralFunction from "./createHistoryOnNewReferral.js";
import createHistoryOnNewReviewFunction from "./createHistoryOnNewReview.js";
import updateLoyaltyProgramOnNewDiscountCodeFunction from "./updateLoyaltyProgramOnNewDiscountCode.js";
import updateLoyaltyProgramOnNewHistoryItemFunction from "./updateLoyaltyProgramOnNewHistoryItem.js";

//Bring in the functions
export const helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
  });

export const api = nameOfTest123;

//export const shopifyAuth = functions.https.onRequest(app);

export const webhook = functions.https.onRequest(shopifyWebhook);

export const receivingOrderTest = functions.https.onRequest(testReceiveOrder);

export const receivingOrder = functions.https.onRequest(receiveOrder);

export const makeDiscountRequestGQL = functions.https.onRequest(graphQLExpress);

export const discount_onCreate = discountOnCreate;

//export const graphQLAPI = GQLresult;

export const createHistoryOnNewDiscount = createHistoryOnNewDiscountFunction;

export const createHistoryOnNewOrder = createHistoryOnNewOrderFunction;

export const createHistoryOnNewReferral = createHistoryOnNewReferralFunction;

export const createHistoryOnNewReview = createHistoryOnNewReviewFunction;

export const updateLoyaltyProgramOnNewDiscountCode = updateLoyaltyProgramOnNewDiscountCodeFunction;

export const updateLoyaltyProgramOnNewHistoryItem = updateLoyaltyProgramOnNewHistoryItemFunction;



// import express from "express";
// import { shopifyWebhook } from "./shopifyWebhook.js";


// const app = express();


//admin.initializeApp(functions.config().firebase);


//exports.shopify = app1.app;

//may need to install babel!
//https://www.freecodecamp.org/news/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab/

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);


// const shopify = require("./shopify");
// exports.shopify = shopify.app;

// const shopify1 = require("./shopifyWebhook");
// exports.shopifyWebhook = shopify1.shopifyWebhook;

// const postman = require("./receiveOrder");
// exports.receiveOrder = postman.receiveOrder;

// const history1 = require("./createHistoryOnNewOrder");
// exports.createHistoryOnNewOrder = history1.createHistoryOnNewOrder;

// const history2 = require("./createHistoryOnNewReferral");
// exports.createHistoryOnNewReferral = history2.createHistoryOnNewReferral;

// const history3 = require("./createHistoryOnNewReview");
// exports.createHistoryOnNewReview = history3.createHistoryOnNewReview;

// const history4 = require("./createHistoryOnNewDiscount");
// exports.createHistoryOnNewDiscount = history4.createHistoryOnNewDiscount;

// const history5 = require("./updateLoyaltyProgramOnNewHistoryItem");
// exports.updateLoyaltyProgramOnNewHistoryItem = history5.updateLoyaltyProgramOnNewHistoryItem;

// const history6 = require("./createHistoryTest");
// exports.createHistoryTest = history6.createHistoryTest;

// const test1 = require("./testapp");
// exports.testapp = test1.testapp;

// const test2 = require("./testReceiveOrder");
// exports.testReceiveOrder = test2.testReceiveOrder;



// const discount1 = require("./updateLoyaltyProgramOnNewDiscountCode");
// exports.updateLoyaltyProgramOnNewDiscountCode = discount1.updateLoyaltyProgramOnNewDiscountCode;





// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
