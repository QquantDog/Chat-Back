const yup = require("yup");
async function validateRequest(req, res, next, schema) {
    try {
        if (schema) {
            console.log("req body in yup", req.body);
            await schema.validate(req, { abortEarly: false });
        }
        return next();
    } catch (err) {
        console.log("Error in yup: ", err);
        res.status(403).json({ err: err.inner.toString() });
    }
}

const signUpSchema = yup.object({
    body: yup.object({
        user: yup.object({
            username: yup
                .string()
                .email()
                .required("Email is required")
                .min(3, "Minimal chars: 3")
                .max(100, "Maximal chars: 100"),
            password: yup
                .string()
                .required("Password is required")
                .min(8, "Minimal chars: 8")
                .max(32, "Maximal chars: 32"),
            confirmation_password: yup
                .string()
                .required("Confirmation password is required")
                .min(8, "Minimal chars: 8")
                .max(32, "Maximal chars: 32"),
        }),
    }),
});

const signInSchema = yup.object({
    body: yup.object({
        user: yup.object({
            username: yup
                .string()
                .email()
                .required("Email is required")
                .min(3, "Minimal chars: 3")
                .max(100, "Maximal chars: 100"),
            password: yup
                .string()
                .required("Password is required")
                .min(8, "Minimal chars: 8")
                .max(32, "Maximal chars: 32"),
        }),
    }),
});

const messageSchema = yup.object({
    body: yup.object({
        user_name: yup
            .string()
            .email()
            .required("Name is required")
            .min(3, "Minimal chars: 3")
            .max(100, "Maximal chars: 100"),
        user_id: yup.string("Error type of message id").required(),
        content: yup.string().required(),
    }),
});

const deleteMessageSchema = yup.object({
    body: yup.object({
        user_id: yup.string("Error type of message id").required(),
    }),
});

const updateMessageSchema = yup.object({
    body: yup.object({
        user_id: yup.string("Error type of message id").required(),
        content: yup.string().required(),
    }),
});


class YupValidator {
    static async signIn(req, res, next) {
        return validateRequest(req, res, next, signInSchema);
    }
    static async signUp(req, res, next) {
        return validateRequest(req, res, next, signUpSchema);
    }
    static async messagePost(req, res, next) {
        return validateRequest(req, res, next, messageSchema);
    }
    static async messageDel(req, res, next) {
        return validateRequest(req, res, next, deleteMessageSchema);
    }
    static async messageUpd(req, res, next) {
        return validateRequest(req, res, next, updateMessageSchema);
    }
}

exports.YupValidator = YupValidator;
exports.signInSchema = signInSchema;
exports.signUpSchema = signUpSchema;
exports.messageSchema = messageSchema;
exports.updateMessageSchema = updateMessageSchema;
exports.deleteMessageSchema = deleteMessageSchema;