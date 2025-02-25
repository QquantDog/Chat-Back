const JWT = require("jsonwebtoken")
const createError = require("http-errors")

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = { }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: "3h",
                audience: userId,
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if(err) {
                    console.log(err.message)
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },

    verifyAccessToken: (req, res, next) => {
        const index = req.rawHeaders.indexOf("Authorization")
        if(!req.rawHeaders[index + 1]) return next(createError.Unauthorized())
        const authHeader = req.rawHeaders[index + 1]
        const bearerToken = authHeader.split(" ")
        const token = bearerToken[1]

        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err) {
                const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    },

    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = { }
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: "96h",
                audience: userId
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if(err) {
                    console.log(err.message)
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },

    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, payload) => {
                if(error) return reject(createError.Unauthorized())
                const userId = payload.aud

                resolve(userId)
            })
        })
    }
}