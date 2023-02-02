const { sign, verify } = require("jsonwebtoken");

const signJwt = async (username) => {
    return sign(
        {
            data: username,
        },
        process.env.JWT_PWD || "gtbit@2024",
        { expiresIn: "30d" }
    );
};

const decodeJwt = async (jwt) => {
    return verify(jwt, process.env.JWT_PWD || "gtbit@2024");
};

exports.decodeJwt = decodeJwt;

exports.signJwt = signJwt;
