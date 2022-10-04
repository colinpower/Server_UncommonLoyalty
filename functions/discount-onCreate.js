import admin from "firebase-admin";
import functions from "firebase-functions";
import fetch from "node-fetch";

const discountOnCreate = functions.firestore
  .document('discount/{discountID}')
  .onCreate(async (snap, context) => {

    //First, get the entire referral object (to be updated later)
    const discountObject = snap.data();

    //get the new discount ID
    const discountID = context.params.discountID;

    //get values from document
    const code = snap.data().card.discountCode;
    const rewardAmount = snap.data().reward.rewardAmount;
    const domain = snap.data().ids.domain;
    const minimumSpendRequired = snap.data().reward.minimumSpendRequired;
    const pointsSpent = snap.data().reward.pointsSpent;

    const status = snap.data().status.status;

    // const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    // const randomArray = Array.from(
    //     { length: 2 },
    //     (v, k) => chars[Math.floor(Math.random() * chars.length)]
    //     );
    
    //const code = firstNameID // + randomArray.join("");
    

    //Create the additional variables you need
    const title = code + " for $" + rewardAmount.toString() + " (spent " + pointsSpent.toString() + " Points)";


    //Create the JSON to send to the GraphQL API
    const createJSON = {
        code: code,
        rewardAmount: rewardAmount,
        domain: domain,
        title: title,
        usageLimit: 1
    }; 

    //make a request to create the discount
    const response = await fetch("https://us-central1-uncommon-loyalty.cloudfunctions.net/shopify_createDiscount", {
        method: "POST", 
        body: JSON.stringify(createJSON),
        headers: { "Content-Type": "application/json" }
    });
    
    if (response.status == 201) {

        console.log(code);
        console.log("Discount created successfully!");

        // grab the response from Shopify
        const responseData = await response.json();
        
        // grab updates for the discount object
        const gid = responseData.graphqlID;

        //check to see if it's a PERSONAL-CARD-PERMANENT or just a regular single-use code
        const cardType = snap.data().card.cardType;

        if (cardType == "PERSONAL-CARD-PERMANENT") {

            //if so, mark it as pending (don't know if user wants it yet)
            discountObject.status.status = "CREATED-PendingUserApproval";

        } else {

            discountObject.status.status = "ACTIVE";

        }


        discountObject.ids.graphQLID = gid; 

        return admin.firestore().collection("discount").doc(discountID).update(discountObject);

    } else {

        console.log(code);
        console.log("ERROR CREATING DISCOUNT");

        // const discountUpdate = {
        //     code: code,
        //     available: false
        // };

        discountObject.status.failedToBeCreated = true;
        discountObject.status.status = "UNAVAILABLE";

        return admin.firestore().collection("discount").doc(discountID).update(discountObject);
    }

    
});

export default discountOnCreate;