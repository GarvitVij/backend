const bcrypt = require("bcrypt");

const hashPwd = async (pwd) => {
	console.log(pwd);
    return await bcrypt.hash(pwd, process.env.SALT_ROUNDS || 10);
};

const verifyPwd = async (pwd, hashedPwd) => {
    return await bcrypt.compare(pwd, hashedPwd);
};

module.exports = {
    hasher: hashPwd,
    verifier: verifyPwd,
};
