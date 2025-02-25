const express = require("express");
const createError = require("http-errors");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const AuthRoute = require("./Routes/Auth.route");
const WebSocket = require("ws");
const { createServer } = require("http");

const { connectToDB, messages } = require("./pg_connect.js");

async function initialize() {
    try {
        await connectToDB();
    } catch (err) {
        console.log("err while connection to DB: ", err);
    }

    const app = express();
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    const corsOptions = {
        origin: "http://localhost:8080",
        optionsSuccessStatus: 200,
    };
    app.use(cors(corsOptions));

    app.use("/", AuthRoute);

    app.use(async (req, res, next) => {
        next(createError.NotFound("Route does not exist"));
    });

    app.use((error, req, res, next) => {
        res.status(error.status || 500);
        res.send({
            error: {
                status: error.status || 500,
                message: error.message,
            },
        });
    });

    const PORT = process.env.PORT || 3000;
    const server = createServer(app);

    let data1 = [];
    const wss = new WebSocket.Server({ server });

    wss.on("connection", async function connection(ws) {

        let mess_resp;
        try {
            mess_resp = await messages.findAll({ raw: true, order: ["creation"] });
            console.log("MESS_RESP: ", mess_resp);
            if (mess_resp == null) throw new Error("error requesting db");
        } catch (err) {
            console.log("error while getting all messages from chat", err);
        }
        mess_resp.forEach((el) => {
            el.user_name = el.user_email;
            delete el.user_email;
        });

        const data = {
            message: {
                type: "connection",
                data: mess_resp,
            },
        };

        ws.send(JSON.stringify(data));

        data1 = [];
    });

    server.listen(PORT, () => {
        console.log(`The server is running on port ${PORT}`);
    });

    exports.wss = wss;
}

initialize();
