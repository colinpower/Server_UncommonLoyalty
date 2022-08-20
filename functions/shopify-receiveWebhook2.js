//simple overview of shopify webhooks.. also use beeceptor to test
//https://gist.github.com/magician11/08a226555161d633e21fc2bcf374e708

// #region Imports
import admin from "firebase-admin";
import functions from "firebase-functions";
import express from "express";
import bodyParser from "body-parser";
import { title } from "process";
//#endregion

// #region Local testing
//used for local testing
// const host = '192.168.0.127';
// const port = 3000;
// #endregion

// #region Initialize express app
const shopifyReceiveWebhook2 = express();
shopifyReceiveWebhook2.use(bodyParser.json());
shopifyReceiveWebhook2.use(bodyParser.urlencoded({
    extended: true,
}));
// #endregion

shopifyReceiveWebhook2.post("/", async (req, res) => {


    //#region Step 1: Get the necessary variables from the webhook
    const shopDomain = req.header('x-shopify-shop-domain');     //this tells you which shop it's from
    //const webhookType = req.header('x-shopify-topic');     //this tells you which shop it's from
    //const shopifyOrderID = req.header('x-shopify-order-id');     //the order ID, if it exists... if webhookType=="refund", you need to get the orderID from the body
    const webhookData = req.body;        //this has the payload
    const email = webhookData.email;     //
    const current_timestamp_milliseconds = new Date().getTime();
    const current_timestamp = Math.round(current_timestamp_milliseconds / 1000);
    const numberOfOrderDiscountCodes = webhookData.discount_codes.length;
        
    
    //#endregion

    //#region Step 2: Figure out what shop we received the webhook from
    switch(shopDomain) {
        case "athleisure-la.myshopify.com":
            var companyID = "zKL7SQ0jRP8351a0NnHM"
            var pointsPerDollar = 10
            console.log("Matched to Athleisure company ID");
            break;
        case "hello-vip.myshopify.com":
            var companyID = "QVmwSAakMGqIwi8Ewg7S"
            var pointsPerDollar = 10
            console.log("Matched to hello-vip company ID");
            break;
        case "hello-vip-test-1.myshopify.com":
            var companyID = "HcTcyHHdGwPWNPnKoVll"
            var pointsPerDollar = 10
            console.log("Matched to hello-vip-test-1 company ID");
            break;
        default:
            var companyID = "No header matched! We have an issue"
            var pointsPerDollar = 10
    }
    // #endregion

    //#region Step 3: Determine if you have a loyalty program
    const loyaltyprogramResult = await admin.firestore().collection("loyaltyprograms")
        .where("domain", "==", shopDomain)
        .where("email", "==", email)
        .get()

    //#endregion
    
    //#region Step 4: Create the Order, History and Items objects, and add the items
    
    // Check if UserID exists
    if (!loyaltyprogramResult.empty) {
        var userID = loyaltyprogramResult.docs[0].data().userID;
    } else {
        var userID = "";
    }

    // Create the reference to the Order and the History entries
    let newOrderRef = admin.firestore().collection("order").doc();
    let newHistoryRef = admin.firestore().collection("history").doc();

    // Create the empty array of itemIDs
    var itemIDs = []

    // Get the number of items in the order
    const itemsInOrder = webhookData.line_items;
            

    console.log("reaching this point");
    console.log(webhookData.line_items[0]);
    // Iterate over each item in the order, create a new entry in Items collection
    for (const orderItem of itemsInOrder) {

        console.log("iterating")
        let newItemRef = admin.firestore().collection("item-" + companyID).doc();

        itemIDs.push(newItemRef.id)

        var itemObject = {
            companyID: companyID,
            domain: shopDomain,
            email: email,
            itemID: newItemRef.id,
            orderID: newOrderRef.id,
            price: orderItem.price,
            name: orderItem.name,
            title: orderItem.title,
            quantity: orderItem.quantity,
            reviewID: "",
            reviewRating: 0,
            shopifyItemID: orderItem.id,
            status: "PAID",                         //PAID, REFUNDED, PARTIALLY REFUNDED
            timestamp: current_timestamp,
            userID: userID
        };

        await newItemRef.set(itemObject);
    };

    // Create the unfinished Order object
    var orderObject = {
        companyID: companyID,
        discountAmount: "",
        discountCode: "",
        discountCodeID: "",
        domain: shopDomain,
        email: email,
        historyID: newHistoryRef.id,
        itemIDs: itemIDs,
        item_firstItemTitle: webhookData.line_items[0].title,
        orderID: newOrderRef.id,
        orderStatusURL: webhookData.order_status_url,
        pointsEarned: 0,
        numberOfReviews: 0,
        referralID: "",
        referralCode: "",
        shopifyOrderID: webhookData.id,
        status: "PAID",                         //PAID, REFUNDED, PARTIALLY REFUNDED
        timestamp: current_timestamp,
        totalPrice: Number(webhookData.total_line_items_price),
        userID: userID
    };

    // Create the unfinished History object
    var historyObject = {
        companyID: companyID,
        discountAmount: "",
        discountCode: "",
        discountCodeID: "",
        domain: shopDomain,
        email: email,
        historyID: newHistoryRef.id,
        itemIDs: itemIDs,
        item_firstItemTitle: webhookData.line_items[0].title,
        orderID: newOrderRef.id,
        orderStatusURL: webhookData.order_status_url,
        pointsEarned: 0,
        numberOfReviews: 0,
        referralID: "",
        referralCode: "",
        referredOrderID: "",
        shopifyOrderID: webhookData.id,
        type: "ORDER",                         //PAID, REFUNDED, PARTIALLY REFUNDED
        timestamp: current_timestamp,
        totalPrice: Number(webhookData.total_line_items_price),
        userID: userID
    };

    //#endregion

    //Step 5: determine the scenario
    
    if (numberOfOrderDiscountCodes > 0) {           //it's a KNOWN USER + KNOWN DISCOUNT, KNOWN USER + UNKNOWN DISCOUNT, UNKNOWN USER + KNOWN REFERRAL, UNKNOWN USER + UNKNOWN DISCOUNT
        //HAS DISCOUNT CODE

        const orderDiscountCode = webhookData.discount_codes[0].code;

        //Does the user have a loyalty account?
        if (!loyaltyprogramResult.empty) {          //it's a KNOWN USER + KNOWN DISCOUNT, KNOWN USER + UNKNOWN DISCOUNT

            //Is the discount one of the ones created in the app?
            const discountResult = await admin.firestore().collection("discount")
                .where("domain", "==", shopDomain)
                .where("code", "==", orderDiscountCode)
                .get()

            if (!discountResult.empty) {            //it's a KNOWN USER + KNOWN DISCOUNT
                
                var additionalPoints = Number(webhookData.total_line_items_price) * pointsPerDollar;
                var currentPoints = loyaltyprogramResult.docs[0].data().currentPointsBalance;
                var lifetimePoints = loyaltyprogramResult.docs[0].data().lifetimePoints;

                // Step 1: modify the order object as needed, then add it
                orderObject.pointsEarned = additionalPoints;  // set the amount of points earned
                await newOrderRef.set(orderObject);  // add the order

                // Step 2: modify the history object as needed, then add it
                historyObject.pointsEarned = additionalPoints;  // set the amount of points earned
                await newHistoryRef.set(historyObject);  // add history (order)

                // Step 3: update loyaltyprogram
                var loyaltyprogramUpdate = {
                    currentPointsBalance: currentPoints + additionalPoints,
                    lifetimePoints: lifetimePoints + additionalPoints
                };
                await admin.firestore().collection("loyaltyprograms").doc(loyaltyprogramResult.docs[0].id).update(loyaltyprogramUpdate);

                // Step 4: update discount (used)
                var discountUpdate = {
                    status: "USED",
                    timestamp_Used: current_timestamp,
                    usedOnOrderID: newOrderRef.id
                };
                console.log("the discount ID is...")
                console.log(discountResult.docs[0].id)
                await admin.firestore().collection("discount").doc(discountResult.docs[0].id).update(discountUpdate);

                // Step 5: End and send 200 status
                console.log("known user, known discount code");
                res.sendStatus(200);
            
            } else {                                //it's a KNOWN USER + UNKNOWN DISCOUNT

                console.log("known user, unknown discount code");
                res.sendStatus(200);

                // add order
                // add history (order)
                // add history (discount)
                // update loyaltyprogram (points)
            }

        } else {                                    //it's an UNKNOWN USER + KNOWN REFERRAL, UNKNOWN USER + UNKNOWN DISCOUNT

            //Is the discount a referral code?
            const referralResult = await admin.firestore().collection("referral")
                .where("domain", "==", shopDomain)
                .where("referralCode", "==", orderDiscountCode)
                .get()

            if (!referralResult.empty) {            //it's an UNKNOWN USER + KNOWN REFERRAL

                console.log("unknown user, known referral code");
                res.sendStatus(200);

            } else {                                //it's an UNKNOWN USER + UNKNOWN DISCOUNT

                console.log("unknown user, unknown discount code");
                res.sendStatus(200);

            }
        }

    } else {                                        //it's a KNOWN USER or an UNKNOWN USER
        //DOES NOT HAVE DISCOUNT CODE
        
        //Does the user have a loyalty account?
        if (!loyaltyprogramResult.empty) {          //it's a KNOWN USER

            var additionalPoints = Number(webhookData.total_line_items_price) * pointsPerDollar;
            var currentPoints = loyaltyprogramResult.docs[0].data().currentPointsBalance;
            var lifetimePoints = loyaltyprogramResult.docs[0].data().lifetimePoints;

            // Step 1: modify the order object as needed, then add it
            orderObject.pointsEarned = additionalPoints;  // set the amount of points earned
            await newOrderRef.set(orderObject);  // add the order

            // Step 2: modify the history object as needed, then add it
            historyObject.pointsEarned = additionalPoints;  // set the amount of points earned
            await newHistoryRef.set(historyObject);  // add history (order)

            // Step 3: update loyaltyprogram
            var loyaltyprogramUpdate = {
                currentPointsBalance: currentPoints + additionalPoints,
                lifetimePoints: lifetimePoints + additionalPoints
            };
            await admin.firestore().collection("loyaltyprograms").doc(loyaltyprogramResult.docs[0].id).update(loyaltyprogramUpdate);

            // Step 4: End and send 200 status
            console.log("known user, no discount code");
            res.sendStatus(200);

        } else {                                    //it's a UNKNOWN USER
            console.log("it's an unknown user");
            res.sendStatus(200);
        }
    }


    
    //const currentPointsAfterThisOrder = totalPointsEarnedOnThisOrder + Number(webhookData.total_line_items_price) * 100 + loyaltyprogramResult.docs[0].data().currentPointsBalance


    
    

    //Create an empty History object
    //create the history object
    // var historyDoc = {
    //     actualNewCustomerEmail: "",
    //     associatedOrderID: "",
    //     companyID: companyID,
    //     description: "",
    //     discountCodeAmount: "",
    //     discountCode: "",
    //     discountID: "",
    //     referralID: "",
    //     historyID: newHistoryRef.id,
    //     email: email,
    //     referralBonusPoints: 0,
    //     pointsEarnedOrSpent: 0,
    //     associatedOrderPrice: Number(webhookData.total_line_items_price),
    //     reviewID: "",
    //     status: "",
    //     status_Discount: "",
    //     status_Referral: "USED",
    //     totalSpent: 0,
    //     timestamp: current_timestamp,
    //     timestamp_Created: 0,
    //     timestamp_Active: 0,
    //     timestamp_Used: 0,
    //     type: "ORDER",
    //     userID: userID
    // };



    //const loyaltyprogramRef = loyaltyprogramResult.id;
    
    //const currentPointsAfterThisOrder = totalPointsEarnedOnThisOrder + Number(webhookData.total_line_items_price) * 100 + loyaltyprogramResult.docs[0].data().currentPointsBalance
    //Create an empty Referral object
    //Create an empty History object

    //create the loyaltyprogramUpdate object
    // const loyaltyProgramUpdate = {
    //     numberOfReferrals: 0,
    //     currentPointsBalance: currentPointsAfterThisOrder,
    //     lifetimePoints: 0,
    //     status: "TEST"
    // };

    
});

//exports.shopifyReceiveWebhook = functions.https.onRequest(shopifyReceiveWebhook);
export default shopifyReceiveWebhook2;

//used for testing
// shopifyReceiveWebhook.listen(port, () => {
//     console.log(`Server running at ${port}`);
// });
