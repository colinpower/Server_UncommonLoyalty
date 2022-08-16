import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

const discountOnCreate = functions.firestore
  .document('discount/{discountID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the review
    const company = snap.data().company
    const code = snap.data().code
    const pointsSpent = snap.data().pointsSpent
    const dollarAmount = snap.data().dollarAmount
    const title = pointsSpent.toString() + " Points Redeemed for $" + dollarAmount + " Discount"
    
    //grab necessary variables from the discount
    const companyID = "zKL7SQ0jRP8351a0NnHM";
    const discountAmount = snap.data().dollarAmount;
    const discountCode = snap.data().code;
    const pointsSpent = snap.data().pointsSpent;
    const email = snap.data().email;
    // const historyID = snap.data().historyID;
    // const orderID = snap.data().orderID;
    // const photoID = snap.data().photoID;
    // const timestamp = snap.data().timestamp;
    const userID = snap.data().userID;
    //const reviewID = context.params.reviewID

    //const referralID = context.params.referralID

    const current_timestamp = new Date().getTime();
    // timestamp: Math.round(current_timestamp / 1000),


    const bodyOfPOST = {
        company: "Athleisure",
        code: code,
        title: "created by postman",
        dollarAmount: 10.05
    };

    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommon-loyalty.cloudfunctions.net/makeDiscountRequestGQL",
        { method: "POST", 
        body: JSON.stringify(bodyOfPOST),
        headers: { "Content-Type": "application/json" }
    });

    const jsonResponse = await response.json();
    const parsedJSON = JSON.parse(jsonResponse);
    const gid = parsedJSON.graphqlID;


    // create entry for this discount
    const updateToDiscount = {
        status: "created",
        GID: gid
    };

    // create history entry for this order
    const historyEntry = {
        companyID: companyID,
        description: "fill in later",
        discountAmount: discountAmount,
        discountCode: discountCode,
        email: email,
        orderID: "fill in later",
        pointsEarnedOrSpent: pointsSpent * -1,
        price: 0,
        reviewID: "",
        timestamp: Math.round(current_timestamp / 1000),
        type: "DISCOUNTCODE",
        userID: userID
    };

    await admin.firestore().collection("history").add(historyEntry);
    return admin.firestore().collection("discount2").add(update)
})

export default discountOnCreate;