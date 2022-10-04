import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

const discountAdditionOnCreate = functions.firestore
  .document('discount/{discountID}/additions/{additionID}')
  .onCreate(async (snap, context) => {

    //First, get the entire referral object (to be updated later)
    const additionObject = snap.data();

    //get the new discount ID
    const discountID = context.params.discountID;
    const additionID = context.params.additionID;

    //get values from document
    const domain = snap.data().domain;
    const graphqlID = snap.data().graphqlID;
    const rewardAmount = snap.data().rewardAmount;
    const minimumSpendRequired = snap.data().minimumSpendRequired;
    const pointsSpent = snap.data().pointsSpent;
    const status = snap.data().status;

    // const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    // const randomArray = Array.from(
    //     { length: 2 },
    //     (v, k) => chars[Math.floor(Math.random() * chars.length)]
    //     );
    
    //const code = firstNameID // + randomArray.join("");

    //Create the JSON to send to the GraphQL API
    const createJSON = {
        rewardAmount: rewardAmount,
        domain: domain,
        graphqlID: graphqlID
    }; 

    console.log("about to make a request to the endpoint");
    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommon-loyalty.cloudfunctions.net/shopify_updateDiscount", {
        method: "POST",          
        body: JSON.stringify(createJSON),
        headers: { "Content-Type": "application/json" }
    });
    
    if (response.status == 201) {

        //console.log(code);
        console.log("Discount created successfully!");

        // grab the response from Shopify
        const responseData = await response.json();
        
        // grab updates for the discount object
        const gid = responseData.graphqlID;

        var discountUpdate = {
            "reward.expirationTimestamp": -1,
            "reward.minimumSpendRequired": -1,
            "reward.pointsSpent": pointsSpent,
            "reward.rewardAmount": rewardAmount,
            "reward.rewardType": "DOLLARS",
            "reward.usageLimit": 1,
            "status.status": "ACTIVE",
            "status.failedToBeCreated": false
        } 

        return admin.firestore().collection("discount").doc(discountID).update(discountUpdate);

    } else {

        //console.log(code);
        console.log("ERROR CREATING DISCOUNT");

        const discountUpdate = {
            "status.status": "UPDATE-FAILED",
            "status.failedToBeCreated": true
        };

        return admin.firestore().collection("discount").doc(discountID).update(discountUpdate);
    }
});

export default discountAdditionOnCreate;