import LinkService from './service/links.service'

// export const create = async (event, context, callback) => {
//     context.callbackWaitsForEmptyEventLoop = false
//     const at = event.headers.authorization.replace('Bearer ', '')
//     if (!at) {
//         callback(null, Responses._401({message: 'Unauthorized empty token'}))
//     }
//     const data = JSON.parse(event.body)
//     if (!data.originalLink || !data.lifetime) {
//         return callback(null, Responses._400({message: 'Invalid data | originalLink, lifetime are required'}))
//     }
//     const userDecoded = await jwt.verify(at, JWT_SECRET)
//     const ids = generateId(6)
//     let lifetime
//     switch (data.lifetime) {
//         case '1h':
//             lifetime = 60 * 4 * 1000
//             break
//         case 'one-time':
//             lifetime = 0
//             break
//         case '1d':
//             lifetime = 60 * 24 * 60 * 60 * 1000
//             break
//         case '3d':
//             lifetime = 3 * 24 * 60 * 60 * 1000
//             break
//         case '7d':
//             lifetime = 7 * 24 * 60 * 60 * 1000
//             break
//         default:
//             lifetime = 7 * 24 * 60 * 60 * 1000
//     }
//     const datas = await Dynamo.get('email', userDecoded.email, 'users-table')
//     if (datas.result) {
//         return callback(null, Responses._400({message: 'User not found'}))
//     }
//     const usersIDs = datas.id
//     const link = {
//         id: `${ids}`,
//         fullLink: `${REDIRECT_URL}${ids}`,
//         originalLink: data.originalLink,
//         userId: usersIDs,
//         expirationTime: Date.now() + lifetime,
//         active: true,
//         oneTime: data.lifetime === 'one-time',
//         visits: 0,
//     }
//     const created = await linksService.createLink(link)
//     callback(null, Responses._200({message: 'Link created successfully', data: link}))
// }
// export const deactivateExpired = async () => {
//     const links = await Dynamo.scan('links-table')
//     const expiredLinks = links.filter(link => link.expirationTime < Date.now())
//     for (const link of expiredLinks) {
//         await Dynamo.update('id', link.id, "active", {active: false}, 'links-table')
//         const params = {
//             QueueUrl: SQS_URL,
//             MessageBody: `Your link is expired now link id:${link.id} , original link ${link.originalLink}`
//         }
//         await sqs.sendMessage(params).promise()
//     }
// }

// const deactivate = async (id: string, userId: string) => {
//     const deactivated = await linksService.deactivateLink(id, userId)
//     console.log(deactivated)
// }

// export const redirectLink = async (event, context, callback) => {
//     context.callbackWaitsForEmptyEventLoop = false
//     const id = event.pathParameters.id as string
//     const link = await linksService.getLinksById(id)
//     console.log({link})
//     if (!link || !link.active || link.expirationTime < Date.now() && !link.oneTime) {
//         await deactivate(id, link.userId)
//         callback(null, Responses._404({message: 'Link deactivated or not found'}))
//     }
//     if (link.oneTime) {
//         await deactivate(id, link.userId)
//     }
//     const data = await linksService.updateLink(id, link.userId, "visits", link.visits + 1)
//     callback(null, Responses._Redirect(301, link.originalLink))
// }

// export const deleteLink = async (event, context, callback) => {
//     try {
//         const id = event.pathParameters.id as string
//         const at = event.headers.authorization.replace('Bearer ', '');
//         const userDecoded = await jwt.decode(at)
//         console.log(userDecoded)
//         if (!userDecoded) {
//             callback(null, Responses._401())
//         }
//         const datas = await Dynamo.get('email', userDecoded.email, 'users-table')
//         const usersIDs = datas.id
//         const link = await linksService.getLinksById(id)
//         console.log(link)
//         if (!link) {
//             return callback(null, Responses._404({message: 'Link not found'}))
//         }
//         if (link.userId !== usersIDs) {
//             return callback(null, Responses._401({message: 'Unauthorized'}))
//         }
//         callback("deleted")
//     }catch (e) {
//         console.log(e)
//         callback(null, Responses._500({
//             message: 'Something went wrong',
//             err: e.message
//         }))
//     }
// }

export const deleted = async (event, context, callback) => {
    await LinkService.deleteLink(event, context, callback)
}

export const update = async (event, context, callback) => {
    await LinkService.update(event, context, callback)
}

export const create = async (event, context, callback) => {
    await LinkService.create(event, context, callback)
}

export const deactivateExpired = async (event, context, callback) => {
    await LinkService.deactivateExpired(event, context, callback)
}

export const redirect = async (event, context, callback) => {
    await LinkService.redirectLink(event, context, callback)
}

export const list = async (event, context, callback) => {
    await LinkService.list(event, context, callback)
}

// export const list = async (event, context, callback) => {
//     context.callbackWaitsForEmptyEventLoop = false
//     const at = event.headers.authorization.replace('Bearer ', '')
//     if (!at.length) {
//         callback(null, Responses._401({message: 'Unauthorized empty token'}))
//     }
//     const userDecoded = jwt.verify(at, JWT_SECRET)
//     const links = await linksService.getAllByUserId(userDecoded.id)
//     const linksWithVisits = links.map(link => ({...link, visits: link.visits || 0}))
//     callback(null, Responses._200({links: linksWithVisits}))
// }
