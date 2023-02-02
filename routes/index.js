const express = require("express");
const authUser = require("../middlewares/authUser");
const findUser = require("../utils/findUser");
const { hasher, verifier } = require("../utils/hasher");
const errorPrettier = require("../utils/errorBeatifier");
const {
    createUser,
    uploadFile,
    generateLoginToken,
    logoutUser,
    createFolder,
    deleteFolder,
    createPost,
    getNotes,
    getNote,
} = require("../services");
const { v4 } = require("uuid");

const router = express.Router();

router.get("/checkAccess", authUser, async (req, res) => {
    console.log(req.body);
    if (req.body.user) {
        return res.send({
            success: 1,
            user: {
                name: req.body.user.name,
                profilePic: req.body.user.profile_pic,
                folders: req.body.user.folders,
            },
        });
    } else {
        res.clearCookie("access");
        return res.status(401).send({ message: "Please authneticate" });
    }
});

router.post("/createUser", async (req, res) => {
    try {
        const { name, username, password } = req.body;
        // Todo Add validation
        const userAlready = await findUser(username);
        if (userAlready) {
            return res
                .status(400)
                .send({ message: "Username is already taken" });
        }
        const access_token = await createUser(name, username, password);
        console.log(access_token);
        res.cookie("access", access_token, {
            httpOnly: true,
        });
        return res.send({ success: true });
    } catch (err) {
        console.log(err);
        const message = errorPrettier(err);
        return res.status(400).send({ message });
    }
});

router.post("/uploadProfilePicture", authUser, async (req, res) => {
    try {
        const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
        if (!allowedTypes.includes(req.files.profile.mimetype)) {
            return res
                .status(400)
                .send({ message: "Image file is only supported" });
        }
        const status = await uploadFile(
            req.files.profile.data,
            req.files.profile.mimetype.split("/")[1],
            req.body.user
        );
        if (!status) {
            return res
                .status(400)
                .send({ message: "Error while uploading image" });
        }

        return res.send({ success: 1 });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: "Error while uploading image" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await findUser(username);
        if (!user) {
            res.status(400);
            return res.send({ message: "Invalid Username" });
        }
        const isPasswordCorrect = await verifier(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400);
            return res.send({ message: "Invalid Password" });
        }
        const token = await generateLoginToken(user);
        res.cookie("access", token, {
            httpOnly: true,
        });
        return res.send({ success: true });
    } catch (err) {
        console.log(err);
        const message = errorPrettier(err);
        if (message) return res.status(400).send({ message });
    }
});

router.delete("/logout", authUser, async (req, res) => {
    try {
        isLoggedOut = await logoutUser(req.body.user);
        if (!isLoggedOut) {
            res.clearCookie("access");
            throw new Error("Something went wrong");
        }
        res.clearCookie("access");
        return res.send({ success: 1 });
    } catch (err) {
        console.log(err);
        res.clearCookie("access");
        const message = errorPrettier(err);
        return res.status(400).send({ message });
    }
});

router.post("/addFolder", authUser, async (req, res) => {
    try {
        const { folderName } = req.body;
        let flag = 0;
        req.body.user.folders
            ? req.body.user.folders.file.map((folderDetails) => {
                  if (folderDetails.name === folderName) {
                      flag = 1;
                  }
              })
            : null;
        if (flag) {
            return res
                .status(400)
                .send({ message: "Folder with name already exsist" });
        }
        const uuid = v4();
        const isCreated = await createFolder(folderName, uuid, req.body.user);
        if (!isCreated.success) {
            return res.status(400).send({ message: "Something went wrong" });
        }
        return res.send({ success: 1, folders: isCreated.folders });
    } catch (err) {
        console.log(err);
        const message = errorPrettier(err);
        return res.status(400).send({ message });
    }
});

router.delete("/deleteFolder", authUser, async (req, res) => {
    try {
        const { folderName } = req.body;
        let flag = 0;
        req.body.user.folders
            ? req.body.user.folders.file.map((folderDetails) => {
                  if (folderDetails.name === folderName) {
                      flag = 1;
                  }
              })
            : null;
        if (!flag) {
            return res.status(400).send({ message: "Folder doesnt exsist" });
        }

        const isDeleted = await deleteFolder(folderName, req.body.user);
        if (!isDeleted.success) {
            return res.status(400).send({ message: "Something went wrong" });
        }
        return res.send({ success: 1, folders: isDeleted.folders });
    } catch (err) {
        console.log(err);
        const message = errorPrettier(err);
        return res.status(400).send({ message });
    }
});

router.get("/getFolders", authUser, async (req, res) => {
    return res.send({ success: 1, folders: req.body.user.folders });
});

router.post("/createPost", authUser, async (req, res) => {
    try {
        const { title, folderid, noteData } = req.body;
        const post = await createPost(
            req.body.user.userId,
            title,
            folderid,
            noteData,
            req.body.user
        );
        if (post) {
            return res.send({ success: 1 });
        } else {
            return res.status(400).send({ success: 0 });
        }
    } catch (err) {
        console.log(err);
        const message = errorPrettier(err);
        return res.status(400).send({ message });
    }
});

router.get("/getNotes", authUser, async (req, res) => {
    try {
        const result = await getNotes(req.body.user.userId, req.query.id);
        console.log(result);
        if (result.success) {
            return res.send({
                notes: result.notes.map((note) => {
                    return { id: note.id, title: note.title };
                }),
            });
        } else {
        }
    } catch (err) {
        console.log(err);
        const message = errorPrettier(err);
        return res.status(400).send({ message });
    }
});

router.get("/getNote/:id", authUser, async (req, res) => {
    try {
        const noteVals = await getNote(req.body.user, req.params.id);
        console.log(noteVals);
        if (noteVals.success) {
            return res.send({ success: 1, note: noteVals.note });
        } else {
            return res.status(400).send({ success: 0 });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).send({ success: 0 });
    }
});

module.exports = router;
