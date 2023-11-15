import { documentClient, Dynamo, sqs } from '../common/db/aws'
import { Responses } from '../common/responses'
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET, SQS_URL } from '../common/env'
import { generateId } from '../common/utils/shortlink'

export const linksService = {
    createLink: async (link: any) => {
        try {
            await documentClient.put({
                TableName: "links-table",
                Item: link,
            }).promise()
        } catch (error) {
            console.error("Ошибка при создании ссылки:", error)
            throw error
        }
    },
    // getLinksById: async (id: string) => {
    //     const params = {
    //         TableName: "links-table",
    //     }
    //     const links = await documentClient.scan(params).promise()
    //     const link = links.Items.find(link => link.id === id)
    //     return link
    // },
    getLinksById: async (id: string) => {
        const params = {
            TableName: "links-table",
        }
        const data = await documentClient.scan(params).promise()
        console.log(data)
        console.log(data.Items)
        const link = data.Items.find(link => link.id === id)
        console.log(link)
        return link
    },
    updateLink: async (id: string, userId: string, updateKey: string, updateValue: any) => {
        const params = {
            TableName: "links-table",
            Key: {
                "userId": userId,
                "id": id
            },
            UpdateExpression: "set #attr = :value",
            ExpressionAttributeNames: {
                "#attr": updateKey
            },
            ExpressionAttributeValues: {
                ":value": updateValue
            },
            ReturnValues: "UPDATED_NEW"
        }
        const data = await documentClient.update(params).promise()
        return data
    },
    updateMany: async (link) => {
        console.log({link})
        const keys = Object.keys(link).filter(key => key !== 'userId' && key !== 'id')
        const updateExpressions = keys.map(key => `#${key} = :${key}`)
        const expressionAttributeNames = keys.reduce((result, key) => {
            result[`#${key}`] = key
            return result
        }, {})
        const expressionAttributeValues = keys.reduce((result, key) => {
            result[`:${key}`] = link[key]
            return result
        }, {})
        const params = {
            TableName: "links-table",
            Key: {
                "id": link.id,
                "userId": link.userId
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "UPDATED_NEW"
        }

        await documentClient.update(params).promise()
    },
    deactivateLink: async (id: string, userId: string) => {
        const paramsD = {
            TableName: "links-table",
            Key: {
                "userId": userId,
                "id": id
            },
            UpdateExpression: "set #attr = :value",
            ExpressionAttributeNames: {
                "#attr": "active"
            },
            ExpressionAttributeValues: {
                ":value": false
            },
            ReturnValues: "UPDATED_NEW"
        }
        await documentClient.update(paramsD).promise()
    },
    getAllByUserId: async (userId: string) => {
        const params = {
            TableName: "links-table",
            FilterExpression: "#userId = :userIdValue",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userIdValue": userId
            }
        }
        const links = await documentClient.scan(params).promise()
        console.log(links)
        return links.Items
    },
    async delete (userId, id, TableName) {
        const params = {
            TableName,
            Key: {
                "userId": userId,
                "id": id
            },
        }
        await documentClient.delete(params).promise()
        return {status: true}
    }
}

const REDIRECT_URL = 'http://localhost:3000/links/'

class LinksService {
    async deleteLink (event, context, callback) {
        const id = event.pathParameters.id as string
        console.log(id)
        const at = event.headers.authorization.replace('Bearer ', '')
        const userDecoded = await jwt.decode(at)
        if (!userDecoded) {
            callback(null, Responses._401({message: 'Unauthorized'}))
        }
        const datas = await Dynamo.get('email', userDecoded.email, 'users-table')
        const usersIDs = datas.id
        const link = await linksService.getLinksById(id)
        if (!link) {
            return callback(null, Responses._404({message: 'Link not found'}))
        }
        if (link.userId !== usersIDs) {
            return callback(null, Responses._401({message: 'Unauthorized'}))
        }
        await linksService.delete(link.userId, id, 'links-table')
        callback(null, Responses._204({message: 'Link deleted successfully'}));
    }

    async create (event, context, callback) {
        context.callbackWaitsForEmptyEventLoop = false
        const at = event.headers.authorization.replace('Bearer ', '')
        if (!at) {
            callback(null, Responses._401({message: 'Unauthorized empty token'}))
        }
        const data = JSON.parse(event.body)
        if (!data.originalLink || !data.lifetime) {
            return callback(null, Responses._400({message: 'Invalid data | originalLink, lifetime are required'}))
        }
        const userDecoded = await jwt.verify(at, JWT_SECRET)
        const ids = generateId(6)
        let lifetime
        switch (data.lifetime) {
            case '1h':
                lifetime = 60 * 4 * 1000
                break
            case 'one-time':
                lifetime = 0
                break
            case '1d':
                lifetime = 60 * 24 * 60 * 60 * 1000
                break
            case '3d':
                lifetime = 3 * 24 * 60 * 60 * 1000
                break
            case '7d':
                lifetime = 7 * 24 * 60 * 60 * 1000
                break
            default:
                lifetime = 7 * 24 * 60 * 60 * 1000
        }
        console.log(userDecoded)
        const datas = await Dynamo.get('email', userDecoded.email, 'users-table')
        console.log(datas)
        if (datas.result) {
            return callback(null, Responses._400({message: 'User not found'}))
        }
        const usersIDs = datas.id
        const link = {
            id: `${ids}`,
            fullLink: `${REDIRECT_URL}${ids}`,
            originalLink: data.originalLink,
            userId: usersIDs,
            expirationTime: Date.now() + lifetime,
            active: true,
            oneTime: data.lifetime === 'one-time',
            visits: 0,
        }
        await linksService.createLink(link)
        callback(null, Responses._200({message: 'Link created successfully', data: link}))
    }

    async deactivate (id: string, userId: string) {
        const deactivated = await linksService.deactivateLink(id, userId)
        console.log(deactivated)
    }

    async redirectLink (event, context, callback) {
        context.callbackWaitsForEmptyEventLoop = false
        const id = event.pathParameters.id as string
        const link = await linksService.getLinksById(id)
        console.log({link})
        if (!link || !link.active || link.expirationTime < Date.now() && !link.oneTime) {
            await this.deactivate(id, link.userId)
            callback(null, Responses._404({message: 'Link deactivated or not found'}))
        }
        if (link.oneTime) {
            await this.deactivate(id, link.userId)
        }
        const data = await linksService.updateLink(id, link.userId, "visits", link.visits + 1)
        callback(null, Responses._Redirect(301, link.originalLink))
    }

    async deactivateExpired (event, context, callback) {
        try {
            const links = await Dynamo.scan('links-table')
            const expiredLinks = links.filter(link => link.expirationTime < Date.now())
            for (const link of expiredLinks) {
                await Dynamo.update('id', link.id, "active", {active: false}, 'links-table')
                const params = {
                    QueueUrl: SQS_URL,
                    MessageBody: `Your link is expired now link id:${link.id} , original link ${link.originalLink}`
                }
                await sqs.sendMessage(params).promise()
            }
        } catch (error) {
            callback(null, Responses._400({message: 'Error'}))
        }
    }

    async list (event, context, callback) {
        context.callbackWaitsForEmptyEventLoop = false
        const at = event.headers.authorization.replace('Bearer ', '')
        if (!at.length) {
            callback(null, Responses._401({message: 'Unauthorized empty token'}))
        }
        const userDecoded = jwt.verify(at, JWT_SECRET)
        const links = await linksService.getAllByUserId(userDecoded.id)
        const linksWithVisits = links.map(link => ({...link, visits: link.visits || 0}))
        callback(null, Responses._200({links: linksWithVisits}))
    }

    async update (event, context, callback) {
        context.callbackWaitsForEmptyEventLoop = false
        const id = event.pathParameters.id as string
        const at = event.headers.authorization.replace('Bearer ', '')
        if (!at.length) {
            callback(null, Responses._401({message: 'Unauthorized empty token'}))
        }
        const userDecoded = jwt.verify(at, JWT_SECRET)
        const data = JSON.parse(event.body)
        if (!data.originalLink || !data.lifetime) {
            return callback(null, Responses._400({message: 'Invalid data | originalLink, lifetime are required'}))
        }
        const ids = generateId(6)
        let lifetime
        switch (data.lifetime) {
            case '30m':
                lifetime = 60 * 4 * 1000
                break
            case 'one-time':
                lifetime = 0
                break
            case '1d':
                lifetime = 60 * 24 * 60 * 60 * 1000
                break
            case '3d':
                lifetime = 3 * 24 * 60 * 60 * 1000
                break
            case '7d':
                lifetime = 7 * 24 * 60 * 60 * 1000
                break
            default:
                lifetime = 7 * 24 * 60 * 60 * 1000
        }
        const datas = await Dynamo.get('email', userDecoded.email, 'users-table')
        if (datas.result) {
            return callback(null, Responses._400({message: 'User not found'}))
        }
        const usersIDs = datas.id
        const link = {
            id: `${ids}`,
            fullLink: `${REDIRECT_URL}${ids}`,
            originalLink: data.originalLink,
            userId: usersIDs,
            expirationTime: Date.now() + lifetime,
            active: true,
            oneTime: data.lifetime === 'one-time',
            visits: 0,
        }
        await linksService.delete(link.userId, id, 'links-table')
        await linksService.updateMany(link)
        callback(null, Responses._200({message: 'Link updated successfully', data: link}))
    }
}

export default new LinksService()

