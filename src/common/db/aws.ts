import { ACCESS_ID_TOKEN, SECRET_TOKEN } from '../env'
import * as AWS from 'aws-sdk'
const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region: 'us-west-1',
    credentials: {
        accessKeyId: ACCESS_ID_TOKEN,
        secretAccessKey: SECRET_TOKEN
    },

});
//{
//     region: "us-west-1",
//     credentials: ACCESS_ID_TOKEN,
//     endpoint: 'http://localhost:4566/'
// }


const ses = new AWS.SES({
    apiVersion: '2010-12-01',
    region: 'us-west-1',
    credentials: {
        accessKeyId: ACCESS_ID_TOKEN,
        secretAccessKey: SECRET_TOKEN
    },
    endpoint: 'http://localhost:4566/'
});

const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    credentials: {
        accessKeyId: ACCESS_ID_TOKEN,
        secretAccessKey: SECRET_TOKEN
    },
    endpoint: 'http://localhost:8000/'
})

const Dynamo = {
    async scan(TableName) {
        const params = {
            TableName
        };

        const data = await documentClient.scan(params).promise();

        if (!data || !data.Items) {
            throw Error(`There was an error scanning the table ${TableName}`);
        }

        return data.Items;
    },

    async query(key, value, TableName) {
        const params = {
            TableName,
            KeyConditionExpression: '#k = :v',
            ExpressionAttributeNames: {
                '#k': key
            },
            ExpressionAttributeValues: {
                ':v': value
            }
        };

        const data = await documentClient.query(params).promise();

        if (!data || !data.Items) {
            throw Error(`There was an error querying the table ${TableName}`);
        }

        return data.Items;
    },

    async update(key, value, updateKey, updateValue, TableName) {
        const params = {
            TableName,
            Key: {
                [key]: value
            },
            ExpressionAttributeNames: {
                '#k': updateKey
            },
            ExpressionAttributeValues: {
                ':v': updateValue
            },
            UpdateExpression: 'SET #k = :v',
            ReturnValues: 'ALL_NEW'
        };

        const data = await documentClient.update(params).promise();

        if (!data) {
            throw Error(`There was an error updating the item in table ${TableName}`);
        }

        return data.Attributes;
    },
    async get (searchParam, value, TableName) {
        const params = {
            TableName,
            Key: {
                [searchParam]: value,
            },
        }
        const data = await documentClient.get(params).promise()
        console.log(data,"data")
        if (data.Item) {
            return data.Item
        }
        return {
            "result": "No item found"
        }
    },
    async delete (searchParam, value, TableName) {
        const params = {
            TableName,
            Key: {
                [searchParam]: value,
            },
        }
        const data = await documentClient.delete(params).promise()
        if (!data) {
            throw Error(`There was an error deleting ${value} from ${TableName}`)
        }
        return {
            "result": "Successfully deleted"
        }
    },
    async write(data, TableName) {
        const params = {
            TableName,
            Item: data,
        };
        console.log({data},"params")
        await documentClient.put(params).promise();
        return data;
    }
}

export {
    Dynamo,
    documentClient,
    sqs,
    ses
}
