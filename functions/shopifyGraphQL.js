// import dotenv from "dotenv";
// import {GraphQLClient, gql} from "graphql-request";
// import graphqlHTTP from "express-graphql";
// import graphql from "graphql";
// import {Headers} from "cross-fetch";

// dotenv.config();

// global.Headers = global.Headers || Headers;





// //const graphqlApp = express();

// // graphqlApp.use("/", graphqlHTTP({


// // }));

// //const graphQLRequest = async function() {


//   import express from "express";
//   import bodyParser from "body-parser";  
  
//   const graphQLExpress = express();
//   graphQLExpress.use(bodyParser.json());
//   graphQLExpress.use(bodyParser.urlencoded({
//       extended: true,
//   }));
  
// graphQLExpress.post("/", async (req, res) => {


//   //const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);
//   const client = new Shopify.Clients.Graphql("https://hello-vip.myshopify.com/admin/api/2022-01/graphql.json", process.env.TEST_ACCESS_TOKEN);


// const endpoint = "https://hello-vip.myshopify.com/admin/api/2022-01/graphql.json";
  
// const graphQLClient = new GraphQLClient(endpoint, {
//     headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": process.env.TEST_ACCESS_TOKEN
//     }
//   });

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

// const queryData = await graphQLClient.request(query, variables).then((data) => console.log(JSON.stringify(data, undefined, 2)))
//   //console.log(JSON.stringify(queryData, undefined, 2))
//   //return JSON.stringify(queryData, undefined, 2)
// //};

// //main().catch((error) => console.error(error))

// export default queryData;



// //Code for creating a discount
// //GraphiQL editor
// //https://hello-vip.myshopify.com/admin/apps/5a3c93b0e9bc8d5abf63531fcd829b5d/?hmac=3eec28d83eea69ae8cf58eaf50ecdf95f9aaca988f7e4795fa03a191d35e6f31&host=aGVsbG8tdmlwLm15c2hvcGlmeS5jb20vYWRtaW4&locale=en&session=6179d661c4be96831da601ca49027181f89721cdec072a29b4acf1e502ae174e&shop=hello-vip.myshopify.com&timestamp=1645145404
// // mutation {
// //   discountCodeBasicCreate(basicCodeDiscount: {
// //     title: "code basic test",
// //     usageLimit: 10,
// //     startsAt: "2016-01-01",
// //     appliesOncePerCustomer: true,
// //     customerSelection: {
// //       all: true
// //     }
// //     code: "123456",
// //     customerGets: {
// //       value: {
// //         discountAmount:  {
// //           amount: 1.00,
// //           appliesOnEachItem: false
// //         }
// //       }
// //       items: {
// //         all: true
// //       }
// //     }}) {
// //     userErrors { field message code }
// //     codeDiscountNode {
// //       id
// //         codeDiscount {
// //         ... on DiscountCodeBasic {
// //           title
// //           summary
// //           status
// //           codes (first:10) {
// //             edges {
// //               node {
// //                 code
// //               }
// //             }
// //           }
// //         }
// //       }
// //     }
// //   }
// // }



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
//   '