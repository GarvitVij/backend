// Node modules import
const express = require("express");
const { json } = require("body-parser");
const fileUpload = require("express-fileupload");
const router = require("./routes/index");
const cors = require("cors");
const fetch = require("node-fetch");
// Init Variables
const app = express();

globalThis.fetch = fetch;

app.use(json());
app.use(
    fileUpload({
        limits: { fileSize: 2 * 1024 * 1024 },
        abortOnLimit: true,
        responseOnLimit: "File size must be less than 2MB",
    })
);
var allowedOrigins = ["http://localhost:3000"];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin
            // (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                var msg =
                    "The CORS policy for this site does not " +
                    "allow access from the specified Origin.";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);

// Routes
app.get("/status", async (req, res) => {
    return res.send({ status: true, server: true, pocketBase: true });
});

app.use(router);

//Running and listening for request
app.listen(process.env.PORT || 4000, () => {
    console.log("Server is up and running");
});
