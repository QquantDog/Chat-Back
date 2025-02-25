const wss = require("../app");
const WebSocket = require("ws");

const {  messages } = require("../pg_connect.js");


class MessController {
    static async createMessage(req, res, next) {
        try {
            const { user_name, user_id, content } = req.body;
            console.log("/messages req.body: ", req.body);
            const messageToDb = {
                user_id,
                user_email: user_name,
                content,
                creation: (new Date()).toISOString()
            };

            const PostMessageRequest = await messages.create(messageToDb);
            if (PostMessageRequest == null) throw new Error("error while saving message to DB");
            const _mess = await PostMessageRequest.toJSON();

            const data = {
                message: {
                    type: "create",
                    data: {
                        ..._mess,
                        user_name: _mess["user_email"],
                    },
                },
            };

            if (wss) {
                wss.wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
            // return  sta
            return res.status(200).json(data);
        } catch (err) {
            console.log("err: ", err);
            next(err);
        }
    }

    static async DelMessById(req, res, next) {
        try {
            const messageId = req.params.messageId;
            const user_id = req.body["user_id"];

            const deleteMessByID = await messages.destroy({
                where: {
                    id: messageId,
                    user_id,
                },
            });
            if (deleteMessByID == null) throw new Error("Error deleting messages from array");

            if (wss) {
                let mess_resp;
                try {
                    mess_resp = await messages.findAll({ raw: true, order: ["creation"] });
                    if (mess_resp == null) throw new Error("error requesting db");
                } catch (err) {
                    console.log("error resend while deleting message from chat", err);
                }
                mess_resp.forEach((el) => {
                    el.user_name = el.user_email;
                    delete el.user_email;
                });

                const data = {
                    message: {
                        type: "destroy",
                        data: mess_resp,
                    },
                };

                wss.wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
            return res.sendStatus(200);
        } catch (err) {
            console.log("err: ", err);
            next(err);
        }
    }
    static async UpdMessById(req, res, next) {
        try {
            const content = req.body.content;
            const messageId = req.params.messageId;
            const user_id = req.body["user_id"];

            const updMessByID = await messages.update(
                {
                    content,
                },
                {
                    where: {
                        id: messageId,
                        // updated
                        user_id
                    },
                }
            );
            if (updMessByID == null) throw new Error("Error deleting messages from array");

            if (wss) {
                let mess_resp;
                try {
                    mess_resp = await messages.findAll({ raw: true, order: ["creation"] });
                    if (mess_resp == null) throw new Error("error requesting db");
                } catch (err) {
                    console.log("error resend while deleting message from chat", err);
                }
                mess_resp.forEach((el) => {
                    el.user_name = el.user_email;
                    delete el.user_email;
                });

                const data = {
                    message: {
                        type: "update",
                        data: mess_resp,
                    },
                };

                wss.wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
            return res.sendStatus(200);
        } catch (err) {
            console.log("err: ", err);
            next(err);
        }
    }
}

exports.MessController = MessController;