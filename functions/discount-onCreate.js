import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

const discountOnCreate = functions.firestore
  .document('discount/{discountID}')
  .onCreate(async (snap, context) => {


    //get the new discount ID
    const discountID = context.params.discountID;

    //get values from document
    const company = "Athleisure";     //snap.data().company; //NEED TO FIX THIS!!!! CONVERT companyName to company
    const companyID = snap.data().companyID;
    const companyName = snap.data().companyName;
    const dollarAmount = snap.data().dollarAmount;
    const domain = snap.data().domain;
    const email = snap.data().email;
    const graphqlID = snap.data().graphqlID;
    const minimumSpendRequired = snap.data().minimumSpendRequired;
    const pointsSpent = snap.data().pointsSpent;
    const status = snap.data().status;
    const userID = snap.data().userID;

    // Create a custom discount code for the user based on their firstNameID
    const firstNameID = snap.data().firstNameID;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const randomArray = Array.from(
        { length: 2 },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
        );
    
    const code = firstNameID + randomArray.join("");
    

    //Create the additional variables you need
    const title = pointsSpent.toString() + " Points Redeemed for $" + dollarAmount.toString() + " Discount";
    const current_timestamp_milliseconds = new Date().getTime();
    const current_timestamp = Math.round(current_timestamp_milliseconds / 1000);
    let newHistoryRef = admin.firestore().collection("history").doc();


    //Create the JSON to send to the GraphQL API
    const createJSON = {
        code: code,
        dollarAmount: dollarAmount,
        domain: domain,
        graphqlID: graphqlID,
        title: title,
        usageLimit: 1
    }; 

    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommon-loyalty.cloudfunctions.net/shopify_createDiscount", {
        method: "POST", 
        body: JSON.stringify(createJSON),
        headers: { "Content-Type": "application/json" }
    });
    
    // create entry for this discount
    const responseData = await response.json();
    const gid = responseData.graphqlID;
    const discountUpdate = {
        code: code,
        discountID: discountID,
        graphqlID: gid,
        historyID: newHistoryRef.id,
        status: "ACTIVE",
        timestamp_Active: current_timestamp
    };

    //create history entry for this order
    const historyDoc = {
        companyID: companyID,
        description: "fill in later",
        discountAmount: dollarAmount,
        discountCode: code,
        email: email,
        historyID: newHistoryRef.id,
        orderID: "fill in later",
        pointsEarnedOrSpent: pointsSpent * -1,
        price: 0,
        reviewID: "",
        timestamp: current_timestamp,
        type: "DISCOUNTCODE",
        userID: userID
    };
    
    await admin.firestore().collection("history").add(historyDoc);
    return admin.firestore().collection("discount").doc(discountID).update(discountUpdate);
})

export default discountOnCreate;