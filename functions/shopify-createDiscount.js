import dotenv from "dotenv";
import {GraphQLClient, gql} from "graphql-request";
import graphqlHTTP from "express-graphql";
import graphql from "graphql";
import {Headers} from "cross-fetch";
import { Shopify } from '@shopify/shopify-api';
import { onRequest } from 'firebase-functions/v1/https';





dotenv.config();

global.Headers = global.Headers || Headers;

import express from "express";
import bodyParser from "body-parser";  
//import pkg from "body-parser";
const { json } = bodyParser;


import fetch from "node-fetch";
// const host = '127.0.0.1';
// const port = 5000;


const shopifyCreateDiscount = express();
// graphQLExpress.use(express.json());
// graphQLExpress.use(express.urlencoded());
shopifyCreateDiscount.use(bodyParser.json());
shopifyCreateDiscount.use(bodyParser.urlencoded({
    extended: true,
}));
  

// shopifyCreateDiscount.get("/", async (req, res) => {

//     //https://us-central1-uncommon-loyalty.cloudfunctions.net/makeDiscountRequestGQL",

//     const bodyOfPOST = {
//         code: "B4",
//         company: "Athleisure",
//         dollarAmount: 10,
//         title: "fake title",
//         usageLimit: 1
//     };


//     const response = await fetch("https://8ed3-205-178-78-227.ngrok.io", {
//         method: "POST", 
//         body: JSON.stringify(bodyOfPOST),
//         headers: { "Content-Type": "application/json" }
//     });

//     //console.log(response.json());
//     //const response3 = response2.clone();
//     const data = await response.json();

//     console.log(typeof data);
//     console.log(data.graphqlID);
//     // const data2 = await JSON.parse(data);

//     // console.log(data2);
//     // const data3 = data2.graphqlID;

//     //console.log(gqlLink);

//     //console.log(responseJSON1);
//     //console.log(responseJSON1.body);
//     //const variable1 = JSON.parse(responseJSON1)
//     //console.log("ABOUT TO RESPOND TO POSTMAN");
//     //console.log(responseJSON1);

//     //console.log("REPSONSE IS" + JSON.parse(response.json));

//     res.sendStatus(200)
// })



shopifyCreateDiscount.post("/", async (req, res) => {

    //Get variables from the body of the request
    var code = req.body.code;
    var dollarAmount = req.body.dollarAmount;
    var domain = req.body.domain;
    var graphqlID = req.body.graphqlID;
    var title = req.body.title;
    var usageLimit = req.body.usageLimit;
    
    var typeOfDiscount = "AMOUNT_NOMINIMUM_1USE_1CUSTOMER_NODEADLINE";

    
    
    

    // var usageLimit = 1;
    // var dollarAmount = 10.00;
    // var code = code;
    // var title = "FIREBASETITLE123";  //"Uncommon: Redeemed Points for $" + String(dollarAmount) + " Discount"


    //#region Step 2: Use company name to get correct access token from process.env
    switch (domain) {
        case "athleisure-la.myshopify.com":
            var accessToken = process.env.ATHLEISURE_ACCESS_TOKEN;
            break;
        case "hello-vip.myshopify.com":
            var accessToken = process.env.HELLOVIP_ACCESS_TOKEN;
            break;
        case "hello-vip-test-1.myshopify.com":
            var accessToken = process.env.HELLOVIPTEST1_ACCESS_TOKEN;
            break;
        default:
            //throw an error.. can't find the access token
            var accessToken = "NO ACCESS TOKEN FOUND";
    }
    //#endregion

    //#region Step 3: Use typeOfDiscount to get the correct query
    switch (typeOfDiscount) {
        case "AMOUNT_NOMINIMUM_1USE_1CUSTOMER_NODEADLINE":
            var discountMutation = 
                //#region One Fixed Discount No Expiration
                `mutation OneFixedDiscountNoExpiration($usageLimit: Int, $dollarAmount: Decimal, $code:String, $title:String) {
                    discountCodeBasicCreate(basicCodeDiscount: {
                    title: $title,
                    usageLimit: $usageLimit,
                    startsAt: "2016-01-01",
                    customerSelection: {
                        all: true
                    }
                    code: $code,
                    customerGets: {
                        value: {
                        discountAmount:  {
                            amount: $dollarAmount,
                        appliesOnEachItem: false
                        }
                        }
                        items: {
                        all: true
                        }
                    }}) {
                    userErrors { field message code }
                    codeDiscountNode {
                        id
                        codeDiscount {
                        ... on DiscountCodeBasic {
                            title
                        usageLimit
                            summary
                        startsAt
                            status
                            codes (first:1) {
                            edges {
                                node {
                                code
                                }
                            }
                            }
                        }
                        }
                    }
                    }
            }`

            var variables = {
                "code": code,
                "dollarAmount": dollarAmount,
                "title": title,
                "usageLimit": usageLimit
            }
            break;
            //#endregion
            
        case "AMOUNT_MINIMUM_1USE_1CUSTOMER_NODEADLINE":
            var discountMutation = "NEED TO WRITE THIS LATER"
            var variables = {
                "code": code,
                "dollarAmount": dollarAmount,
                "title": title,
                "usageLimit": usageLimit
            }
            break;

        case "DELETE":
            var discountMutation = 
                `mutation deleteDiscount($id: ID!) {
                    discountCodeDelete (id: $id) {
                      deletedCodeDiscountId
                    }
                  }`
            var variables = {
                "id": graphqlID,
            }
        default:
            var discountMutation = "NEED TO WRITE THIS LATER"
    }
    //#endregion

    //#region Step 4: Authenticate with Shopify, make the request

    //Auth with Shopify
    const client = new Shopify.Clients.Graphql(domain, accessToken);
      
    //Making request to endpoint
    const result = await client.query({
        data: {
            query: discountMutation,
            variables: variables
        }
    })
    //#endregion
     
    
    //Step 4. return the products

    //check if there was an error
    if (result.body.data.discountCodeBasicCreate.userErrors.length > 0) {
        //if so, send 409: request could not be completed due to conflict with current state (i.e. duplicated existing code)
        console.log("error, duplicate code");
        res.sendStatus(409);
    } else if (result.body.data.discountCodeBasicCreate.userErrors.length == 0) {
        //no errors
        console.log("No errors");
        
        console.log(result.body.data.discountCodeBasicCreate.codeDiscountNode.id);
        console.log(typeof result.body.data.discountCodeBasicCreate.codeDiscountNode.id);

        const gid = result.body.data.discountCodeBasicCreate.codeDiscountNode.id
        const responseWithGID = {
            graphqlID: gid
        };

        //const responseWithGIDToJSON = JSON.stringify(responseWithGID);

        // console.log(responseWithGIDToJSON);

        //send 201: Created. Then pass back the GID for this resource, so I can cancel it in the future.. e.g. gid://shopify/DiscountCodeNode/1197363626239
        res.status(201).json(responseWithGID);

    } else {
        //other error...
        console.log("unspecified error");
        res.sendStatus(500)
    }
    //console.log(JSON.stringify(result.body))
    //console.log(products.body.data.products.edges[0].node.title);

    

});

// shopifyCreateDiscount.listen(port, () => {
//     console.log(`Server running at http://${host}:${port}`)
// })


export default shopifyCreateDiscount;



//const queryData = await graphQLClient.request(query, variables).then((data) => console.log(JSON.stringify(data, undefined, 2)))

//console.log(JSON.stringify(queryData, undefined, 2))
  //return JSON.stringify(queryData, undefined, 2)
//};










// MORE CODE
// const query = gql`
//   query OrdersForEmailAddress($emailQuery: String!) {
//       orders(first: 100 query: $emailQuery) {
//         edges {
//           cursor
//           node {
//             id
//             discountCode
//             processedAt
//           }
//         }
//         pageInfo {
//           hasNextPage
//         }
//       }
//     }
//   `

// const variables = {
//     emailQuery: "email:colinjpower1@gmail.com"
// }


// curl -X POST \
//   https://hello-vip.myshopify.com/admin/api/2022-07/graphql.json \
//   -H 'Content-Type: application/graphql' \
//   -H 'X-Shopify-Access-Token: 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' \
//   -d '
//   {
//     products(first: 3) {
//       edges {
//         node {
//           id
//           title
//         }
//       }
//     }
//   }