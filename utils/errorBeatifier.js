const errorPrettier = (err) => {
    console.log(Object.keys(err));

    if (Object.keys(err).includes("url")) {
        const key = Object.keys(err.data.data)[0];
        if (key) {
            return `${key} ${err.data.data[key].message}`;
        } else {
            return err.data.message;
        }
    }
    if (Object.keys(err).includes("code")) {
        return null;
    }
};

module.exports = errorPrettier;
