const { DynamoDbClient } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDbClient({});

module.exports = client;
