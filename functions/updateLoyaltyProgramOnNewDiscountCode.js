



import { createRequire } from "module";
const require = createRequire(import.meta.url);


const admin = require('firebase-admin');
const functions = require('firebase-functions');
//need to switch to FieldValue.increment, because this function might be called at the same time for dif things?
//const FieldValue = require('firebase-admin');

exports.updateLoyaltyProgramOnNewDiscountCode = functions.firestore
  .document('discountcodes-zKL7SQ0jRP8351a0NnHM/{discountID}')
  .onCreate(async (snap, context) => {

    //grab necessary variables from the discount item
    const companyID = "zKL7SQ0jRP8351a0NnHM";
    const changeInPoints = snap.data().pointsSpent;
    const userID = snap.data().userID;

    //create reference to loyaltyProgram
    var loyaltyProgramRef = userID + "-" + companyID

    //update lifetimePoints, currentPointsBalance

    return await admin.firestore().collection("loyaltyprograms").doc(loyaltyProgramRef)
        .get()
        .then(result => {

            const loyaltyProgramUpdateData = {
                currentPointsBalance: result.data().currentPointsBalance - changeInPoints
            }

            return admin.firestore().collection("loyaltyprograms").doc(loyaltyProgramRef)
                .update(loyaltyProgramUpdateData)
            
        })
        .catch(error => {
            console.log(error)
        })
})