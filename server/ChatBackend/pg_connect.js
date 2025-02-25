const { Sequelize } = require("sequelize");
// import initModels from "./models/init-models.js";
const { initModels } = require("./models/init-models.js");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
});

async function connectToDB() {
    try {
        await sequelize.authenticate();
    } catch (e) {
        console.log("DB/ROM error: ", e);
        process.exit(1);
    }
}

const { messages, refresh_sessions, users } = initModels(sequelize);
exports.messages = messages;
exports.users = users;
exports.refresh_sessions = refresh_sessions;
exports.sequelize = sequelize;
exports.connectToDB = connectToDB;
