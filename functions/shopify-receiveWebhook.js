//simple overview of shopify webhooks.. also use beeceptor to test
//https://gist.github.com/magician11/08a226555161d633e21fc2bcf374e708


import admin from "firebase-admin";
import functions from "firebase-functions";
import express from "express";
import bodyParser from "body-parser";
import { title } from "process";




//admin.initializeApp(functions.config().firebase);

//used for local testing
// const host = '192.168.0.127';
// const port = 3000;

//Need to add Math.round() to the timestamps!


const shopifyReceiveWebhook = express();
shopifyReceiveWebhook.use(bodyParser.json());
shopifyReceiveWebhook.use(bodyParser.urlencoded({
    extended: true,
}));

shopifyReceiveWebhook.post("/", async (req, res) => {

    // x-shopify-topic: orders/cancelled
    // x-shopify-shop-domain: 	athleisure-la.myshopify.com
    // x-shopify-order-id: 820982911946154508

    //Get your variables from the request
    const shopDomain = req.header('x-shopify-shop-domain');     //this tells you which shop it's from
    //const webhookType = req.header('x-shopify-topic');     //this tells you which shop it's from
    //const shopifyOrderID = req.header('x-shopify-order-id');     //the order ID, if it exists... if webhookType=="refund", you need to get the orderID from the body
    const webhookData = req.body;        //this has the payload
    const email = webhookData.email;     //
    const current_timestamp_milliseconds = new Date().getTime();
    const current_timestamp = current_timestamp_milliseconds / 1000;
    var referralBonusPoints = 0;

    var referral_timestamp_Created = 0;
    
    console.log(shopDomain);

    //figure out what shop we're working with
    switch(shopDomain) {
        case "athleisure-la.myshopify.com":
            var companyID = "zKL7SQ0jRP8351a0NnHM"
            console.log("Matched to Athleisure company ID");
            break;
        case "hello-vip.myshopify.com":
            var companyID = "QVmwSAakMGqIwi8Ewg7S"
            console.log("Matched to hello-vip company ID");
            break;
        case "hello-vip-test-1.myshopify.com":
            var companyID = "HcTcyHHdGwPWNPnKoVll"
            console.log("Matched to hello-vip-test-1 company ID");
            break;
        default:
            var companyID = "No header matched! We have an issue"
    }


    var discountCodeID = "";

    let newOrderRef = admin.firestore().collection("order").doc();
    let discountCodeName = "";
    let discountCodeValue = "";

    var totalPointsEarnedOnThisOrder = 0;
    var userID = "";

    //Create an empty Order object
    //Create an empty Referral object
    //Create an empty History object



    //figure out if there's a discount or referral code
    if (webhookData.discount_codes.length !== 0) {                 //if there's a discount code used..
        discountCodeName = webhookData.discount_codes[0].code;
        discountCodeValue = webhookData.discount_codes[0].amount;

        console.log("discount code name and value");
        console.log(discountCodeName);
        console.log(discountCodeValue);

        const discountCodeResult = await admin.firestore().collection('discount')
            .where("domain", "==", shopDomain)
            .where("code", "==", discountCodeName)
            .get()
        
        if (!discountCodeResult.empty) {             //if there's an Uncommon discount code found...
            //update the discount code to say used, + timestamp

            console.log("found a discount code");
            var discountID = discountCodeResult.docs[0].data().discountID;

            const discountUpdate = {
                status: "USED",
                timestamp_Used: current_timestamp,
                usedOnOrderID: newOrderRef.id
            };

            const historyUpdate = {
                status_Discount: "USED",
                timestamp_DiscountUsed: current_timestamp,
                associatedOrderID: newOrderRef.id
            }

            await admin.firestore().collection("discount").doc(discountID).update(discountUpdate);
            
            //update history for discount code, which has been logged a while ago
            await admin.firestore().collection("history").doc(discountID).update(historyUpdate);

        } else {                           //if none found, check if there's a referral code
            // check if there is referral code or not
            console.log("found a referral code")
            const referralCodeResult = await admin.firestore().collection('referral')
                .where("domain", "==", shopDomain)
                .where("code", "==", discountCodeName)
                .get()

            if (!referralCodeResult.empty) {        //if there's a referral code found...
                //create a history reference for new entry
                //let newHistoryReferralRef = admin.firestore().collection("history").doc();
                //actually.. do the same thing as discounts and keep the ID the same
                
                //get relevant variables
                var referralID = referralCodeResult.docs[0].data().referralID;
                var referralBonusPoints = referralCodeResult.docs[0].data().referralBonusPoints;
                var referral_timestamp_Created = referralCodeResult.docs[0].data().timestamp_Created;
                var userID = referralCodeResult.docs[0].data().userID;

                //update referral
                const referralUpdate = {
                    actualNewCustomerEmail: email,
                    associatedOrderID: newOrderRef.id,
                    historyID: referralID,
                    status: "USED",
                    timestamp_Used: current_timestamp,
                    totalSpent: Number(webhookData.total_line_items_price)
                };

                const historyReferralDoc = {
                    companyID: companyID,
                    description: "fill in later",
                    discountCodeAmount: discountCodeValue,
                    discountCode: discountCodeName,
                    discountID: "",
                    referralID: referralID,
                    historyID: referralID,
                    email: email,
                    associatedOrderID: newOrderRef.id,
                    referralBonusPoints: referralBonusPoints,
                    pointsEarnedOrSpent: referralBonusPoints,
                    associatedOrderPrice: Number(webhookData.total_line_items_price),
                    reviewID: "",
                    status_Discount: "",
                    status_Referral: "USED",
                    timestamp_Created: referral_timestamp_Created,
                    timestamp_Used: current_timestamp,
                    type: "REFERRAL",
                    userID: userID
                };

                //add to totalPointsEarnedOnThisOrder
                totalPointsEarnedOnThisOrder = totalPointsEarnedOnThisOrder + referralBonusPoints

                //update referral
                await admin.firestore().collection("referral").doc(referralID).update(referralUpdate);
            
                //add to history
                await admin.firestore().collection("history").doc(referralID).set(historyReferralDoc);
            }
        }
    }
         
    //figure out if there's a loyalty program for this order      //no discount code.. just post the order + history
    const loyaltyprogramResult = await admin.firestore().collection("loyaltyprograms")
        .where("domain", "==", shopDomain)
        .where("email", "==", email)
        .get()

    if (!loyaltyprogramResult.empty) {           //found a loyalty program
        console.log("found a loyalty program");

        const loyaltyprogramRef = loyaltyprogramResult.id;
        //calculate how many points the user should have now
        // var currentPointsForUser = loyaltyprogramResult.docs[0].data().currentPointsBalance
        // var newPointsForOrder = Number(webhookData.total_line_items_price) * 100
        const currentPointsAfterThisOrder = totalPointsEarnedOnThisOrder + Number(webhookData.total_line_items_price) * 100 + loyaltyprogramResult.docs[0].data().currentPointsBalance

        //create the order object
        const orderData = {
            companyID: "zKL7SQ0jRP8351a0NnHM",
            //company: webhookData.line_items[0].vendor,
            domain: "saldkfjas",
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
        };

        //create the loyaltyprogramUpdate object
        const loyaltyProgramUpdate = {
            numberOfReferrals: 0,
            currentPointsBalance: currentPointsAfterThisOrder,
            lifetimePoints: 0,
            status: "TEST"
        };


        await admin.firestore().collection("history").add(historyDoc);

    }

    //create the history object
    const historyDoc = {
        actualNewCustomerEmail: "",
        associatedOrderID: "",
        companyID: companyID,
        description: "fill in later",
        discountCodeAmount: discountCodeValue,
        discountCode: discountCodeName,
        discountID: "",
        referralID: "",
        historyID: "",
        email: email,
        associatedOrderID: newOrderRef.id,
        referralBonusPoints: referralBonusPoints,
        pointsEarnedOrSpent: referralBonusPoints,
        associatedOrderPrice: Number(webhookData.total_line_items_price),
        reviewID: "",
        status: "",
        status_Discount: "",
        status_Referral: "USED",
        totalSpent: 0,
        timestamp: current_timestamp,
        timestamp_Created: referral_timestamp_Created,
        timestamp_Active: 0,
        timestamp_Used: current_timestamp,
        type: "REFERRAL",
        userID: userID
    };
    
    //update history for discount code, which has been logged a while ago
    await admin.firestore().collection("history").add(historyDoc);
    
    
});

//exports.shopifyReceiveWebhook = functions.https.onRequest(shopifyReceiveWebhook);
export default shopifyReceiveWebhook;

//used for testing
// shopifyReceiveWebhook.listen(port, () => {
//     console.log(`Server running at ${port}`);
// });
