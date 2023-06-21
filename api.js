const db = require("./dynamodb");
const {
   GetItemCommand,
   PutItemCommand,
   UpdateItemCommand,
   DeleteItemCommand,
   ScanCommand,
   QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getUser = async (event) => {
   const responce = {
      statusCode: 200,
      headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
         "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
      },
   };

   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall({ userId: event.pathParameters.userId }),
      };
      const { Item } = await db.send(new GetItemCommand(params));
      console.log({ Item });

      responce.body = JSON.stringify({
         message: "Succses GET user",
         body: Item ? unmarshall(Item) : {},
      });
   } catch (error) {
      console.error(error);
      responce.statusCode = 500;
      responce.body = JSON.stringify({
         message: "Failed GET user",
         eMessage: error.message,
         errorStacl: error.stack,
      });
   }

   return responce;
};

const createUser = async (event) => {
   const response = {
      statusCode: 200,
      headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
         "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
      },
   };

   try {
      const body = JSON.parse(event.body);
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Item: marshall(body || {}),
      };
      const createResult = await db.send(new PutItemCommand(params));

      response.body = JSON.stringify({
         message: "Success PUT user",
         createResult,
      });
   } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
         message: "Failed PUT user",
         errorMsg: e.message,
         errorStack: e.stack,
      });
   }

   return response;
};

const updateUser = async (event) => {
   const response = {
      statusCode: 200,
      headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
         "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
      },
   };

   try {
      const body = JSON.parse(event.body);
      const objKeys = Object.keys(body);
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall({ userId: event.pathParameters.userId }),
         UpdateExpression: `SET ${objKeys
            .map((_, index) => `#key${index} = :value${index}`)
            .join(", ")}`,
         ExpressionAttributeNames: objKeys.reduce(
            (acc, key, index) => ({
               ...acc,
               [`#key${index}`]: key,
            }),
            {}
         ),
         ExpressionAttributeValues: marshall(
            objKeys.reduce(
               (acc, key, index) => ({
                  ...acc,
                  [`:value${index}`]: body[key],
               }),
               {}
            )
         ),
      };
      const updateResult = await db.send(new UpdateItemCommand(params));

      response.body = JSON.stringify({
         message: "Success UPDATE user",
         updateResult,
      });
   } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
         message: "Failed UPDATE user",
         errorMsg: e.message,
         errorStack: e.stack,
      });
   }

   return response;
};

const deleteUser = async (event) => {
   const response = {
      statusCode: 200,
      headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
         "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
      },
   };

   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall({ userId: event.pathParameters.userId }),
      };
      const deleteResult = await db.send(new DeleteItemCommand(params));

      response.body = JSON.stringify({
         message: "Success DELETE user",
         deleteResult,
      });
   } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
         message: "Failed DELTE user",
         errorMsg: e.message,
         errorStack: e.stack,
      });
   }

   return response;
};

const getAllUsers = async () => {
   const response = {
      statusCode: 200,
      headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
         "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
      },
   };

   try {
      const { Items } = await db.send(
         new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
      );

      response.body = JSON.stringify({
         message: "Success GET all users",
         data: Items.map((item) => unmarshall(item)),
      });
   } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
         message: "Failed GET all users",
         errorMsg: e.message,
         errorStack: e.stack,
      });
   }

   return response;
};

const filterUsers = async (event) => {
   const response = {
      statusCode: 200,
      headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
         "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
      },
   };
   try {
      const command = {
         TableName: "user-table-dev",
         FilterExpression: "contains(#name, :searchName)",
         ExpressionAttributeNames: {
            "#name": "name",
         },
         ExpressionAttributeValues: {
            ":searchName": { S: event.pathParameters.query },
         },
      };

      const { Items } = await db.send(new ScanCommand(command));

      response.body = JSON.stringify({
         message: "Success GET serched users",
         data: Items.map((item) => unmarshall(item)),
      });
   } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
         message: "Failed GET serched users",
         errorMsg: e.message,
         errorStack: e.stack,
      });
   }
};

filterUsers();

module.exports = {
   getUser,
   createUser,
   updateUser,
   deleteUser,
   getAllUsers,
   filterUsers,
};
