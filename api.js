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
         message: "Succses GET",
         body: Item ? unmarshall(Item) : {},
      });
   } catch (error) {
      console.error(error);
      responce.statusCode = 500;
      responce.body = JSON.stringify({
         message: "Failed GET",
         eMessage: error.message,
         errorStacl: error.stack,
      });
   }

   return responce;
};

module.exports = {
   getUser,
};
