import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

const referralOnCreate = functions.firestore
  .document('referral/{referralID}')
  .onCreate(async (snap, context) => {
    
    //First, get the entire referral object (to be updated later)
    const referralObject = snap.data();

    //get the new discount ID
    const referralID = context.params.referralID;

    //get values from document
    const code = snap.data().card.discountCode;
    const rewardAmount = snap.data().offer.rewardAmount;
    const domain = snap.data().ids.domain;
    const usageLimit = snap.data().offer.usageLimit;
    
    //Create the additional variables you need
    const title = code + " for $" + rewardAmount.toString() + " (Referral)"; 
    
    console.log(code)
    console.log(rewardAmount.toString())
    console.log(domain)
    console.log(usageLimit.toString())

    //Create the JSON to send to the GraphQL API
    const createJSON = {
        code: code,
        rewardAmount: rewardAmount,
        domain: domain,
        title: title,
        usageLimit: usageLimit
    }; 

    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommon-loyalty.cloudfunctions.net/shopify_createDiscount", {
        method: "POST", 
        body: JSON.stringify(createJSON),
        headers: { "Content-Type": "application/json" }
    });
    
    if (response.status == 201) {

        console.log(code);
        console.log("Referral discount created successfully!");

        // create entry for this discount
        const responseData = await response.json();

        const gid = responseData.graphqlID;

        referralObject.ids.graphQLID = gid;
        referralObject.status.status = "CREATED";

        return admin.firestore().collection("referral").doc(referralID).update(referralObject);

    } else {

        console.log(code);
        console.log("Referral creation not available!");

        // const discountUpdate = {
        //     code: code,
        //     available: false
        // };

        referralObject.status.status = "UNAVAILABLE";

        return admin.firestore().collection("referral").doc(referralID).update(referralObject);
    }

    
});

export default referralOnCreate;