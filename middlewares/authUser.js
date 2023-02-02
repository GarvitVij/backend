const findUser = require("../utils/findUser");
const { decodeJwt } = require("../utils/jwt");

const authUser = async (req, res, nextFn) => {
    try {
        let cookie = req.headers.cookie;
        if (!cookie) {
            console.log("No cookie");
            res.clearCookie("access");
            return res.status(401).send({ message: "Please authneticate" });
        }
        cookie = cookie.split("access=")[1].split(";")[0];
        var decoded = await decodeJwt(cookie);
        const userAlready = await findUser(decoded.data);
        console.log(userAlready);
        const ts = Math.floor(Date.now() / 1000);
        if (decoded.exp < ts) {
            console.log("Expired");
            res.clearCookie("access");
            return res.status(401).send({ message: "Please authneticate" });
        }

        try {
            if (userAlready && userAlready.access_token !== cookie) {
                console.log("Dont match");
                res.clearCookie("access");
                return res.status(401).send({ message: "Please authneticate" });
            }
        } catch (err) {
            console.log(err);
            console.log("Not found");
            res.clearCookie("access");
            return res.status(401).send({ message: "Please authneticate" });
        }

        console.log(decoded, ts, userAlready);
        req.body.user = userAlready;
        nextFn();
    } catch (err) {
        console.log(err);
    }
};

module.exports = authUser;
