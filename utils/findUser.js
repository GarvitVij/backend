const pb = require("../database");

const findUser = async (username) => {
    try {
        const user = await pb
            .collection("users")
            .getFirstListItem(`userId="${username}"`);
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
};

module.exports = findUser;
