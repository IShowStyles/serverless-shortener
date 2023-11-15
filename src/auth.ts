import * as jwt from 'jsonwebtoken'
import authService from './service/auth.service'
import {Dynamo} from './common/db/aws'

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
            callback(null, {
                "isAuthorized": false,
                "context": {
                    "decoded": decoded
                }
            })
        }
        if (users.access_token !== token) {
            console.log('UNAuthorized')
            context.fail('Unauthorized')
            callback(null, {
                "isAuthorized": false,
            })
        }
        console.log(event.methodArn)
        console.log(event)
        console.log('Authorized')
        callback({
            "isAuthorized": true,
        })
    } catch (error) {
        callback('Unauthorized ' + error.message)
    }
}
