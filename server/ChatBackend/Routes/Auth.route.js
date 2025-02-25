const express = require("express");
const router = express.Router();
const createError = require("http-errors");

const { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } = require("../helpers/jwt_helper");

const { YupValidator } = require("../validator/validate.js");
const { AuthController } = require("../controllers/auth_controller.js");
const { MessController } = require("../controllers/mess_controller.js");

const jwt = require("jsonwebtoken");

router.post("/register", YupValidator.signUp, AuthController.signUp);
router.post("/login", YupValidator.signIn, AuthController.signIn);
router.post("/messages", verifyAccessToken, YupValidator.messagePost, MessController.createMessage);
router.delete("/messages/:messageId", verifyAccessToken, YupValidator.messageDel, MessController.DelMessById);
router.patch("/messages/:messageId", verifyAccessToken, YupValidator.messageUpd, MessController.UpdMessById);

router.get("/check-access", verifyAccessToken, async function (req, res, next) {
    res.status(200).send("Successfully authorized");
});
router.get("/debug-access", checkJWTinCookies);

// FOR DEBUG ONLY!!!
async function checkJWTinCookies(req, res, next) {
    try {
        // const ajwt = req.cookies["AJWT"];
        const index = req.rawHeaders.indexOf("Authorization");
        const authHeader = req.rawHeaders[index + 1];
        const bearerToken = authHeader.split(" ");
        const ajwt = bearerToken[1];

        const rjwt = req.cookies["RJWT"];
        console.log("ajwt", ajwt);
        console.log("rjwt", rjwt);

        try {
            console.log("Access verification: ", jwt.verify(ajwt, process.env.ACCESS_TOKEN_SECRET));
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) console.log("Stale ACCESS");
            else console.log("Unknown access error");
        }
        try {
            console.log("Refresh verification: ", jwt.verify(rjwt, process.env.REFRESH_TOKEN_SECRET));
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) console.log("Stale REFRESH");
            else console.log("Unknown refresh error");
        }

        let ajwt_json = jwt.decode(ajwt, process.env.ACCESS_TOKEN_SECRET);
        let rjwt_json = jwt.decode(rjwt, process.env.REFRESH_TOKEN_SECRET);

        if (ajwt_json) console.log("seconds to access stale: ", ajwt_json.exp - ((new Date().getTime() / 1000) | 0));
        if (rjwt_json) console.log("seconds to refresh stale: ", rjwt_json.exp - ((new Date().getTime() / 1000) | 0));
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
}

module.exports = router;
