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


const shopifyUpdateDiscount = express();
shopifyUpdateDiscount.use(bodyParser.json());
shopifyUpdateDiscount.use(bodyParser.urlencoded({
    extended: true,
}));
  

shopifyUpdateDiscount.post("/", async (req, res) => {

    //Get variables from the body of the request
    var rewardAmount = req.body.rewardAmount;
    var domain = req.body.domain;
    var graphqlID = req.body.graphqlID;

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

    //#region Step 3: Create the correct query
    var discountUpdate = 
        `mutation updateDiscount($id:ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
            discountCodeBasicUpdate(id:$id, basicCodeDiscount: $basicCodeDiscount) {
                codeDiscountNode {
                    id: id
                    }
                    userErrors { 
                    extraInfo
                    code
                    field
                    message
                    }
            }
        }`
    var variables = {
        "id": graphqlID,
        "basicCodeDiscount": {
            "customerGets": {
            "value": {
                "discountAmount": {
                "amount": rewardAmount
                    }
                }
            }
        }
    }

    //#endregion

    //#region Step 4: Authenticate with Shopify, make the request

    //Auth with Shopify
    const client = new Shopify.Clients.Graphql(domain, accessToken);
      
    //Making request to endpoint
    const result = await client.query({
        data: {
            query: discountUpdate,
            variables: variables
        }
    })
    //#endregion
     
    
    //#region Step 5. return the result from shopify

    //check if there was an error
    if (result.body.data.discountCodeBasicUpdate.userErrors.length > 0) {
        //if so, send 409: request could not be completed due to conflict with current state (i.e. duplicated existing code)
        
        console.log("error, could not update code.. error message below");

        //check if there's an error message
        if (result.body.data.discountCodeBasicUpdate.userErrors[0].messsage) {

            var errorMessageFromShopify = result.body.data.discountCodeBasicUpdate.userErrors[0].messsage;
            console.log(errorMessageFromShopify);

        }
        
        res.sendStatus(409);


    } else if (result.body.data.discountCodeBasicUpdate.userErrors.length == 0) {
        //no errors
        console.log("No errors when creating discount");
        
        console.log(result.body.data.discountCodeBasicUpdate.codeDiscountNode.id);
        console.log(typeof result.body.data.discountCodeBasicUpdate.codeDiscountNode.id);

        const gid = result.body.data.discountCodeBasicUpdate.codeDiscountNode.id
        const responseWithGID = {
            graphqlID: gid
        };

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


export default shopifyUpdateDiscount;