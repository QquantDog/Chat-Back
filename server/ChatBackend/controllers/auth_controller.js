
const bcrypt = require("bcrypt");
const {users} = require("../pg_connect.js");
const { signAccessToken } = require("../helpers/jwt_helper");


class AuthController {
    static async signUp(req, res, next) {
        try {
           
            const { username, password, confirmation_password } = req.body.user;
            console.log("/register req.body.user", req.body.user);
            const email = username;
            const UserFindByEmailResult = await users.findOne({
                where: {
                    email,
                },
            });
            if (UserFindByEmailResult != null) throw new Error("User already exists");
            if (confirmation_password !== password) throw new Error("Password isn't confirmed");

            const hashed = bcrypt.hashSync(password, 10);
            const UserRegisterRequest = await users.create({ email, password: hashed });
            if (UserRegisterRequest == null) throw new Error("Internal error");

            return res.status(200).send("Successful registration");
        } catch (error) {
            
            console.log("/register error: ", error);
            next(error);
        }
    }

    static async signIn(req, res, next) {
        try {
            const email = req.body.user["username"];
            const password = req.body.user["password"];
            console.log("/login req.body.user", req.body.user);

            const UserFindByEmailResult = await users.findOne({
                where: {
                    email,
                },
            });
            if (UserFindByEmailResult == null) throw new Error("User not exists exists");
           
            const passw_comparation = await bcrypt.compare(password, UserFindByEmailResult.dataValues.password);
            if (!passw_comparation) throw new Error("Password doesnt match");

            const accessToken = await signAccessToken(UserFindByEmailResult.dataValues.id);

            const user = {
                id: UserFindByEmailResult.dataValues.id,
                name: UserFindByEmailResult.dataValues.email,
            };

            res.status(200).send({ accessToken, user });
        } catch (error) {
            console.log("Err login: ", error);
            next(error);
        }
    }
}

exports.AuthController = AuthController;
