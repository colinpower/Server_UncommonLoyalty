import admin from "firebase-admin";
import functions from "firebase-functions";

import { Shopify } from '@shopify/shopify-api';
import { onRequest } from 'firebase-functions/v1/https';

const GQLresult = functions.firestore
  .document('discountcodes-zKL7SQ0jRP8351a0NnHM/{discountID}')
  .onCreate(async (snap, context) => {

    const queryString = `{
        products (first: 3) {
          edges {
            node {
              id
              title
            }
          }
        }
      }`

    // `session` is built as part of the OAuth process
    const client = new Shopify.Clients.Graphql(
        // session.shop,
        // session.accessToken
        "https://hello-vip.myshopify.com/admin/api/2022-07/graphql.json",
        process.env.TEST_ACCESS_TOKEN
    );
    
    const products = await client.query({
        data: queryString,
      });


    return console.log(products);
    //admin.firestore().collection("gql").add(historyEntryForNewReview)

})

export default GQLresult;