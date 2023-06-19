const db = require("./dynamodb");
const {
   GetItemCommand,
   PutItemCommand,
   UpdateItemCommand,
   DeleteItemCommand,
   ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getUser = async (event) => {
   const responce = { statusCode: 200 };

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
   const response = { statusCode: 200 };

   try {
      const body = JSON.parse(event.body);
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Item: marshall(body || {}),
      };
      const createResult = await db.send(new PutItemCommand(params));

      response.body = JSON.stringify({
         message: "Successfully PUT user",
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

const getAllUsers = async () => {
   const response = { statusCode: 200 };

   try {
      const { Items } = await db.send(
         new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
      );

      response.body = JSON.stringify({
         message: "Successfully GET all users",
         data: Items.map((item) => unmarshall(item)),
         Items,
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

module.exports = {
   getUser,
   createUser,
   getAllUsers,
};
