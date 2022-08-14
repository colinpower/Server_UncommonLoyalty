

import admin from "firebase-admin";
import functions from "firebase-functions";



const nameOfTest123 = functions.firestore
  .document('orders-zKL7SQ0jRP8351a0NnHM/{orderID}')
  .onCreate(async (snap, context) => {

    const var123 = {
        description: "fill in later",
    };

    return admin.firestore().collection("history").add(var123);

});  

export default nameOfTest123;
