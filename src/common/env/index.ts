import * as dotenv from "dotenv"

dotenv.config()
const ACCESS_ID_TOKEN = process.env.ACCESS_ID_TOKEN!
const SECRET_TOKEN = process.env.SECRET_TOKEN!
const JWT_SECRET = process.env.JWT_SECRET!
const EXPIRES_IN = process.env.EXPIRES_IN!
const SQS_URL = process.env.SQS_URL!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!
export { JWT_SECRET, REFRESH_TOKEN_SECRET, SQS_URL, EXPIRES_IN, ACCESS_ID_TOKEN, SECRET_TOKEN }
