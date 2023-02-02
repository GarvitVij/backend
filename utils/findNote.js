const pb = require("../database");

const findNote = async (username, title) => {
    try {
        const note = await pb
            .collection("notes")
            .getFirstListItem(`userId="${username}"&&title="${title}"`);
        return note;
    } catch (err) {
        console.log(err);
        return null;
    }
};

module.exports = findNote;
