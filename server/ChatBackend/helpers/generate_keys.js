const crypto = require("crypto")

const secretAccessTokenKey = crypto.randomBytes(32).toString("hex")
const secretRefreshTokenKey = crypto.randomBytes(32).toString("hex")

console.table({secretAccessTokenKey, secretRefreshTokenKey})