import { documentClient, ses, sqs } from './common/db/aws'

const TABLE_NAME = 'YourDynamoDBTableName'
const QUEUE_URL = 'YourSQSQueueURL'
const FROM_EMAIL = 'your-verified-email@example.com'

interface Link {
    userEmail: string;
    id: string;
}

interface Message {
    userEmail: string;
    linkId: string;
    message: string;
}

export const deactivateLinks = async (event: any): Promise<void> => {
    const currentTime = new Date()
    const timeFrames: { [key: string]: Date } = {
        '30 minutes': new Date(currentTime.getTime() - (60 * 60 * 1000 / 2)),
        '1 day': new Date(currentTime.getTime() - (24 * 60 * 60 * 1000)),
        '3 days': new Date(currentTime.getTime() - (3 * 24 * 60 * 60 * 1000)),
        '7 days': new Date(currentTime.getTime() - (7 * 24 * 60 * 60 * 1000)),
    }

    const entries: [string, Date][] = [];

    for (const key in timeFrames) {
        if (timeFrames.hasOwnProperty(key)) {
            entries.push([key, timeFrames[key]]);
        }
    }

    for (const [timeFrameKey, timeFrameValue] of entries) {
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'expiresAt = :timeFrameVal',
            ExpressionAttributeValues: { ':timeFrameVal': timeFrameValue.getTime() },
        }
        const expiredLinks = await documentClient.scan(params).promise()
        if (!expiredLinks.Items || expiredLinks.Items.length === 0) {
            console.log('No expired links found for the current time frame.');
            return;
        }
        for (const link of expiredLinks.Items as Link[]) {
            const sqsParams = {
                MessageBody: JSON.stringify({
                    userEmail: link.userEmail,
                    linkId: link.id,
                    message: `Your link has been deactivated after ${timeFrameKey}.`,
                }),
                QueueUrl: QUEUE_URL,
            }
            await sqs.sendMessage(sqsParams).promise()
        }
    }
}


export const processQueueMessages = async (event: any): Promise<void> => {
    for (const record of event.Records) {
        const message = JSON.parse(record.body) as Message
        const emailParams = {
            Source: FROM_EMAIL,
            Destination: {ToAddresses: [message.userEmail]},
            Message: {
                Body: {
                    Text: {
                        Charset: "UTF-8",
                        Data: message.message,
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Link Deactivation Notice'
                },
            },
        }

        await ses.sendEmail(emailParams).promise()
    }
}
