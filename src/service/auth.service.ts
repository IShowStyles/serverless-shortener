import { Dynamo } from "../common/db/aws"
import { Responses } from "../common/responses"
import { EXPIRES_IN, JWT_SECRET } from "../common/env"
import * as jwt from "jsonwebtoken"
import { v4 as uuidv4 } from 'uuid'

class AuthService {
    private async generateToken (payload: object, secret: string, expiresIn?: string | number): Promise<string> {
        return jwt.sign(payload, secret, expiresIn ? {expiresIn} : "")
    }

    private async comparePasswords (inputPassword: string, storedPasswordHash: string): Promise<boolean> {
        const decoded = jwt.verify(storedPasswordHash, JWT_SECRET)
        return inputPassword === decoded.password
    }

    async register (event, context, callback) {
        const body = JSON.parse(event.body)
        const {email: userEmail, password} = body

        if (!userEmail || !password) {
            callback(null, Responses._400({message: 'Invalid data | email, password are required'}))
        }
        const userData = await Dynamo.get("email", userEmail, 'users-table')
        if (userData.result !== "No item found") {
            callback(null, Responses._400({message: 'User already exists'}))
        }
        const ids = uuidv4()
        const accessToken = await this.generateToken({email: userEmail, password: password, id: ids}, JWT_SECRET, '24h')
        const refreshToken = await this.generateToken({email: userEmail, password: password, id: ids}, JWT_SECRET)
        const updated = await Dynamo.write({
            id: ids,
            email: userEmail,
            access_token: accessToken,
            refresh_token: refreshToken,
        }, 'users-table')
        callback(null, Responses._200({message: 'User registered successfully', data: updated}))
    }

    async login (event, context, callback) {
        const body = JSON.parse(event.body)
        const {email, password} = body
        if (!email || !password) {
            return {
                "error": "Invalid data | email, password are required"
            }
        }
        const userExists = await Dynamo.get("email", email, "users-table")
        console.log(userExists)
        if (!userExists || !userExists.refresh_token || !await this.comparePasswords(password, userExists.refresh_token)) {
            callback(null, Responses._400({message: 'Invalid credentials'}))
        }
        const accessToken = await this.generateToken({
            email: userExists.email,
            password: password,
            id: userExists.id,
        }, JWT_SECRET, EXPIRES_IN)

        const data = await Dynamo.write({
            id: userExists.id,
            email: userExists.email,
            access_token: accessToken,
            refresh_token: userExists.refresh_token,
        }, "users-table")
        callback(null, Responses._200({message: 'User logged in successfully', data: data}))
    }

    async refreshToken (email: string) {
        const userExists = await Dynamo.get("email", email, "users-table")
        if (!userExists) {
            return {
                "error": "Invalid credentials"
            }
        }
        return {
            refresh_token: userExists.refresh_token,
            access_token: userExists.access_token,
        }
    }
}

export default new AuthService()
