//simple overview of shopify webhooks.. also use beeceptor to test
//https://gist.github.com/magician11/08a226555161d633e21fc2bcf374e708


// import * as http from 'http';


import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// const express = require('express');
// const bodyParser = require('body-parser');
// const admin = require('firebase-admin');
// const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

//used for local testing
// const host = '192.168.0.127';
// const port = 3000;


const shopifyWebhook = express();
shopifyWebhook.use(bodyParser.json());
shopifyWebhook.use(bodyParser.urlencoded({
    extended: true,
}));

shopifyWebhook.post("/", async (req, res) => {

    //res.send('OK');

    // x-shopify-topic: orders/cancelled
    // x-shopify-shop-domain: 	athleisure-la.myshopify.com
    // x-shopify-order-id: 820982911946154508

    const webhookData = req.body;
    const webhookHeader = req.header('x-shopify-shop-domain')
    console.log(webhookHeader)

    var companyID = ""


    switch(webhookHeader) {
        case "athleisure-la.myshopify.com":
            companyID = "zKL7SQ0jRP8351a0NnHM"
            console.log("Matched the webhook header");
            break;
        case "ABC123":
            companyID = "ABC123-noHeaderMatched"
            break;
        default:
            companyID = "No header matched! We have an issue"
    }

    const current_timestamp = new Date().getTime();
    //console.log(webhookData.email);

    let newOrderRef = admin.firestore().collection("orders-zKL7SQ0jRP8351a0NnHM").doc();

    let discountCodeName = "";
    let discountCodeValue = "";

    //get discount code if not null
    if(webhookData.discount_codes.length !== 0) {
        discountCodeName = webhookData.discount_codes[0].code;
        discountCodeValue = webhookData.discount_codes[0].amount;
    }


    var userID = "";
    
    //meed to update to email variable, webhookData.email

    return await admin.firestore().collection('users').where('email', '==', "colinjpower1@gmail.com")
        .get()
        .then(result => {

            if (result.empty) {
                //there is no userID for this user's email address
                //post to the orders collection anyway, without a userID

                

                //create the payload to send to the orders collection
                const orderData = {
                    companyID: "zKL7SQ0jRP8351a0NnHM",
                    //company: webhookData.line_items[0].vendor,
                    discountAmount: discountCodeValue,
                    discountCode: discountCodeName,
                    discountCodeID: "fill in later",
                    email: "colinjpower1@gmail.com", //webhookData.email,
                    historyID: "fill in later",
                    item: webhookData.line_items[0].title,
                    numberOfItemsInOrder: 10,
                    orderID: newOrderRef.id,
                    pointsEarned: 100*Number(webhookData.total_line_items_price),
                    reviewID: "fill in later",
                    status: "COMPLETE",
                    timestamp: Math.round(current_timestamp / 1000),
                    title: webhookData.line_items[0].title,
                    totalPrice: Number(webhookData.total_line_items_price),
                    userID: userID
                    //optional... orderReference: newOrderRef.id
                    //should add order status URL here
                }

                newOrderRef.set(orderData);
                res.status(201).send();


            } else {
                userID = result.docs[0].data().userID
    
                //create the payload to send to the orders collection
                const orderData = {
                    companyID: "zKL7SQ0jRP8351a0NnHM",
                    //company: webhookData.line_items[0].vendor,
                    discountAmount: discountCodeValue,
                    discountCode: discountCodeName,
                    discountCodeID: "fill in later",
                    email: "colinjpower1@gmail.com", //webhookData.email,
                    historyID: "fill in later",
                    item: webhookData.line_items[0].title,
                    numberOfItemsInOrder: 10,
                    orderID: newOrderRef.id,
                    pointsEarned: 100*Number(webhookData.total_line_items_price),
                    reviewID: "fill in later",
                    status: "COMPLETE",
                    timestamp: Math.round(current_timestamp / 1000),
                    title: webhookData.line_items[0].title,
                    totalPrice: Number(webhookData.total_line_items_price),
                    userID: userID
                    //optional... orderReference: newOrderRef.id
                    //should add order status URL here
                }

                newOrderRef.set(orderData);
                res.status(201).send();
            }
            
        })
        .catch(error => {
            console.log(error)
            res.status(500).send();
        })


});

//exports.shopifyWebhook = functions.https.onRequest(shopifyWebhook);
export { shopifyWebhook };

//used for testing
// shopifyWebhook.listen(port, () => {
//     console.log(`Server running at ${port}`);
// });


// const orderData = {
//     companyID: "zKL7SQ0jRP8351a0NnHM",
//     //company: webhookData.line_items[0].vendor,
//     discountAmount: discountCodeValue,
//     discountCode: discountCodeName,
//     discountCodeID: "fill in later",
//     email: "colinjpower1@gmail.com", //webhookData.email,
//     historyID: "fill in later",
//     item: webhookData.line_items[0].title,
//     numberOfItemsInOrder: 10,
//     orderID: newOrderRef.id,
//     pointsEarned: 100*Number(webhookData.total_line_items_price),
//     reviewID: "fill in later",
//     status: "COMPLETE",
//     title: webhookData.line_items[0].title,
//     totalPrice: Number(webhookData.total_line_items_price),
//     userID: userID
//     //optional... orderReference: newOrderRef.id
//     //should add order status URL here
// };

// await newOrderRef.set(orderData);