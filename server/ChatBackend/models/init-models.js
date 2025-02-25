var DataTypes = require("sequelize").DataTypes;
var _messages = require("./messages");
var _refresh_sessions = require("./refresh_sessions");
var _users = require("./users");

function initModels(sequelize) {
  var messages = _messages(sequelize, DataTypes);
  var refresh_sessions = _refresh_sessions(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  messages.belongsTo(users, { as: "user_email_user", foreignKey: "user_email"});
  users.hasMany(messages, { as: "messages", foreignKey: "user_email"});
  messages.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(messages, { as: "user_messages", foreignKey: "user_id"});

  return {
    messages,
    refresh_sessions,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
