import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

const discountOnCreate = functions.firestore
  .document('discount/{discountID}')
  .onCreate(async (snap, context) => {

    //get values from document
    const code = snap.data().code;
    const company = "Athleisure";     //snap.data().company; //NEED TO FIX THIS!!!! CONVERT companyName to company
    const companyID = snap.data().companyID;
    const companyName = snap.data().companyName;
    const dollarAmount = snap.data().dollarAmount;
    const email = snap.data().email;
    const minimumSpendRequired = snap.data().minimumSpendRequired;
    const pointsSpent = snap.data().pointsSpent;
    const status = snap.data().status;
    const timestampCreated = snap.data().timestampCreated; //NEED TO ELIMINIATE AND MOVE TO _Pending
    //const timestamp_Pending = snap.data().timestamp_Pending;
    //const timestamp_Active = snap.data().timestamp_Active; //should be 0
    //const timestamp_Used = snap.data().timestamp_Used;     //should be 0
    //const usedOnOrderID = snap.data().usedOnOrderID;       //should set this when used
    //const historyID = snap.data().historyID;
    const userID = snap.data().userID;
    

    //Create the additional variables you need
    //const title = pointsSpent.toString() + " Points Redeemed for $" + dollarAmount.toString() + " Discount";
    const current_timestamp_milliseconds = new Date().getTime();
    const current_timestamp = Math.round(current_timestamp_milliseconds / 1000);


    //Create the JSON to send to the GraphQL API
    const createBody = {
        code: code,
        company: "Athleisure",
        dollarAmount: dollarAmount,
        title: "FAKE TITLE",
        usageLimit: 1
    };

    console.log(createBody);

    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommon-loyalty.cloudfunctions.net/makeDiscountRequestGQL", {
        method: "POST", 
        body: JSON.stringify(createBody),
        headers: { "Content-Type": "application/json" }
    });

    const responseData = await response.json();

    console.log(responseData.graphqlID);
    //console.log(data.graphqlID)

    const gid = responseData.graphqlID;


    // create entry for this discount
    const updateToDiscount = {
        status: "created",
        GID: gid
    };

    // create history entry for this order
    // const historyEntry = {
    //     companyID: companyID,
    //     description: "fill in later",
    //     discountAmount: dollarAmount,
    //     discountCode: code,
    //     email: email,
    //     orderID: "fill in later",
    //     pointsEarnedOrSpent: pointsSpent * -1,
    //     price: 0,
    //     reviewID: "",
    //     timestamp: current_timestamp,
    //     type: "DISCOUNTCODE",
    //     userID: userID
    // };

    //await admin.firestore().collection("history").add(historyEntry);
    return admin.firestore().collection("discount3").add(updateToDiscount);
})

export default discountOnCreate;