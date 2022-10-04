import admin from "firebase-admin";
import functions from "firebase-functions";

const orderOnCreate = functions.firestore
  .document('order/{orderID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the order
    const orderID = context.params.orderID;
    const companyID = snap.data().ids.companyID;
    const price = snap.data().order.price;
    const email = snap.data().order.email;
    const userID = snap.data().ids.userID;
    const orderTimestamp = snap.data().order.timestampCreated;
    const code = snap.data().discountCode.code;

    //If no discount code, no work needed
    if (code == "") {
        return;
    } else {

        const codeCaseInsensitive = code.toUpperCase();

        //Step 1: Determine if you have a discount
        const discountResult = await admin.firestore().collection("discount")
        .where("card.discountCodeCaseInsensitive", "==", codeCaseInsensitive)
        .where("ids.companyID", "==", companyID)
        .get()

        //If you found a discount code, mark it as used and add OrderID
        if (!discountResult.empty) {
            
            var discountObject = discountResult.docs[0].data();
            var discountID = discountObject.ids.discountID;

            discountObject.status.status = "USED";
            discountObject.status.timestampUsed = orderTimestamp;
            //discountObject.status.totalSpent = price;
            discountObject.ids.usedOnOrderID = orderID;

            return admin.firestore().collection("discount").doc(discountID).update(discountObject);
            
        } else {
            //If the discount is empty, then move on to checking the referrals

            const referralResult = await admin.firestore().collection("referral")
            .where("card.discountCodeCaseInsensitive", "==", codeCaseInsensitive)
            .where("ids.companyID", "==", companyID)
            .get()

            //If you found a discount code, mark it as used and add OrderID
            if (referralResult.empty) {
                return;
            } else {

                var updatedReferralObject = referralResult.docs[0].data();

                updatedReferralObject.status.status = "USED"
                updatedReferralObject.status.timestampUsed = orderTimestamp
                updatedReferralObject.recipient.email = email
                updatedReferralObject.ids.usedOnOrderID = orderID
                

                //This is the clever way to do it... but can just grab the whole object for now
                // const referralUpdate = { 
                //     [`status.${key}.status`]: "USED",
                //     [`status.${key}.timestampUsed`]: orderTimestamp,
                //     [`recipient.${key}.email`]: email,
                //     [`ids.${key}.usedOnOrderID`]: orderID
                // }

                var referralID = referralResult.docs[0].data().ids.referralID;

                return admin.firestore().collection("referral").doc(referralID).update(updatedReferralObject);   
            }
        }
    }
});

export default orderOnCreate;