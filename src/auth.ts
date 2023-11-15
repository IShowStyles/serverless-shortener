import * as jwt from 'jsonwebtoken'
import authService from './service/auth.service'
import { Dynamo } from './common/db/aws'

export const signUp = async (event, context, callback) => {
    await authService.register(event, context, callback);
}

export const signIn = async (event, context, callback) => {
    await authService.login(event, context, callback);
}

export const customAuthorizer = async (event, context, callback) => {
    try {
        const token = event.headers.authorization.replace('Bearer ', '')
        if (!token) {
            context.fail('Unauthorized')
            return callback('Unauthorized no token')
        }
        const decoded = await jwt.decode(token)
        const users = await Dynamo.get('email', decoded.email, 'users-table')
        if (!users) {
            context.fail('Unauthorized')
            callback({
                principalId: decoded.id,
                policyDocument: generatePolicy(decoded.id, 'Unauthorized', event.methodArn)
            })
        }
        if (users.access_token !== token) {
            context.fail('Unauthorized')
            callback({
                principalId: decoded.id,
                policyDocument: generatePolicy(decoded.id, 'Unauthorized', event.methodArn)
            })
        }
        callback({
            principalId: decoded.id,
            policyDocument: generatePolicy(decoded.id, 'Allow', event.methodArn)
        })
    } catch (error) {
        callback('Unauthorized ' + error.message)
    }
}

const generatePolicy = (principalId: string, effect: string, resource: string) => {
    const authResponse: { principalId?: string, policyDocument?: any } = {}
    authResponse.principalId = principalId
    if (effect && resource) {
        const policyDocument: { Version: string, Statement: any[] } = {Version: '2012-10-17', Statement: []}
        const statementOne: { Action: string, Effect: string, Resource: string } = {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource
        }
        policyDocument.Statement[0] = statementOne
        authResponse.policyDocument = policyDocument
    }
    return authResponse
}
