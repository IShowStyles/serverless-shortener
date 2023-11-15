// import { SQSClient } from "@aws-sdk/client-sqs";
// import { SESClient } from '@aws-sdk/client-ses';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import { ACCESS_ID_TOKEN } from '../env'

const region = "us-west-2";
const client = new DynamoDBClient({ region, credentials: ACCESS_ID_TOKEN});
export const dynamoDbClient = DynamoDBDocumentClient.from(client);
// const sqs = new SQSClient({ region: "REGION" });
// const ses = new SESClient({ region: "REGION" });
// export { dynamoDbClient, sqs, ses };
