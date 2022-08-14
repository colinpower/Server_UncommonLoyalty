import { createRequire } from "module";
const require = createRequire(import.meta.url);


const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const testReceiveOrder = express();
testReceiveOrder.use(bodyParser.json());
testReceiveOrder.use(bodyParser.urlencoded({
    extended: true,
}));

//Batching
//https://firebase.google.com/docs/firestore/manage-data/transactions#node.js_2

//Get document ID that you just created
// const newref = ref().doc()
// newref.id

testReceiveOrder.post('/', async (req, res) => {
    
    const data = req.body;
    console.log(req.body.email)

    //const snapshot1 = await admin.firestore().collection('users').where('email', '==', data.email).get();
    const snapshot1 = await admin.firestore().collection('users').where('email', '==', "colinjpower1@gmail.com").limit(1).get();
    //const snapshot2 = await admin.firestore().collection('users').where('email', '==', "test@gmail.com").get();
    
    if (snapshot1.empty) {
        console.log("Didn't find a user")
    } else {
        console.log("this is the first name")
        console.log(snapshot1.docs[0].data().firstName)
    }
    


    var collection = {};

    console.log("This is if you match the email")
    if (snapshot1.empty) {
        console.log("got an empty snapshot")
    } else {
        snapshot1.forEach(doc => {
            console.log(doc.data().lastName)
            collection[doc.id] = doc.data().lastName;
        });

        console.log("this is in the collection");
        //console.log(collection[0].lastName);

        console.log(Object.values(collection)[0]);
    }
    // console.log(snapshot1);
    // console.log(snapshot1);

    res.send(collection);


    //Step 1: figure out the type of request

    // var requestType = req.header('x-shopify-topic');
    // const data = req.body;

    //#region ORDERS/PAID
    // if (requestType == "orders/paid") {
    //     //This is a new paid order

    //     //Step 2: figure out if there's a discount code
    //     if (data.discount_codes.length > 0) {
    //         //New paid order + discount code

    //         //Step 3: Figure out if it's a referral code



    //     } else {
    //         //New paid order + No discount code
    //     }



    //     console.log("The request type was orders/paid")
    // }
    //#endregion

    //#region ORDERS/REFUND or /update, /cancelled, etc...
    // else if (requestType == "orders/refund") {
    //     //refund for existing order

    //     console.log("The request type was orders/refund")

    // } else if (requestType == "orders/update") {
    //     //need to check if the price has changed

    // } else if (requestType == "orders/cancel") { //or /delete.. need to figure out if /refund is called here
    //     //order cancelled / deleted.. need to figure out if refund is called here

    // } else {
    //     //possible error.. the requestType should be /paid, /refund, /update ONLY
    // }
    //#endregion

    // const webhookData = req.body;
    // const domain = req.header('x-shopify-shop-domain')
    // console.log(`domain is ${domain}`)

    // var companyID = ""

    // switch(domain) {
    //     case "athleisure-la.myshopify.com":
    //         companyID = "zKL7SQ0jRP8351a0NnHM"
    //         console.log("Matched the webhook header");
    //         break;
    //     case "ABC123":
    //         companyID = "ABC123-noHeaderMatched"
    //         break;
    //     default:
    //         companyID = "No header matched! We have an issue"
    // }


    // console.log("email is " + webhookData.email);

    // let newOrderRef = admin.firestore().collection("orders-zKL7SQ0jRP8351a0NnHM").doc();

    // let discountCodeName = "";
    // let discountCodeValue = "";

    //get discount code if not null

    // if(webhookData.discount_codes.length !== 0) {
    //     discountCodeName = webhookData.discount_codes[0].code;
    //     discountCodeValue = webhookData.discount_codes[0].amount;
    // }


    
    //meed to update to email variable, webhookData.email

    // return await admin.firestore().collection('users').where('email', '==', "colinjpower1@gmail.com")
    //     .get()
    //     .then(result => {

    //         if (result.empty) {
    //             console.log("12345")
    //         }
    //         else {
    //             const orderData = {
    //                 email: "colinjpower1@gmail.com", //webhookData.email,
    //             }

    //             newOrderRef.set(orderData);
    //             res.status(201).send();
    //         }

    //     }).catch(error => {
    //         console.log(error);
    //         res.status(500).send();
    //     })
    //res.send(req.header('Content-Type'))

    //res.send("hello world");
})


exports.testReceiveOrder = functions.https.onRequest(testReceiveOrder);





// testReceiveOrder.get('/', (req, res) => {
//     //res.send(req.headers)

//     res.send("hello world");
// })