const FormData = require("form-data");
const { hasher, verifier } = require("../utils/hasher");
const { signJwt } = require("../utils/jwt");
const { default: axios } = require("axios");
const pb = require("../database");
const findNote = require("../utils/findNote");

const createPost = async (id, title, folderName, data) => {
    console.log(id, title, folderName, data);
    const alreadyNote = await findNote(id, title);
    if (alreadyNote) {
        try {
            const datas = await pb.collection("notes").update(alreadyNote.id, {
                title,
                note: data,
            });
            console.log("data", datas);
            return 1;
        } catch (err) {
            console.log(err);
            return 0;
        }
    } else {
        try {
            await pb.collection("notes").create({
                userId: id,
                title,
                folderId: folderName,
                note: data,
            });
            return 1;
        } catch (err) {
            console.log(err);
            return 0;
        }
    }
};

const getNotes = async (id, folderID) => {
    console.log(id, folderID);
    try {
        const notes = await pb.collection("notes").getList(0, 100, {
            filter: `userId="${id}" && folderId="${folderID}"`,
        });
        return { success: 1, notes: notes.items };
    } catch (err) {
        console.log(err);
        return { success: 0, notes: [] };
    }
};

const getNote = async (user, id) => {
    try {
        console.log(user.userId, id);
        const note = await pb
            .collection("notes")
            .getFirstListItem(`userId="${user.userId}" && id="${id}"`);
        return { success: 1, note: { title: note.title, data: note.note } };
    } catch (err) {
        console.log(err);
        return { success: 0, note: {} };
    }
};

const createUser = async (name, username, password) => {
    let hashedPassword = await hasher(password);
    const access_token = await signJwt(username);
    await pb.collection("users").create({
        name,
        userId: username,
        password: hashedPassword,
        access_token,
    });
    return access_token;
};

const uploadFile = async (dataBuffer, ext, user) => {
    const form = new FormData();

    form.append("profile_pic", dataBuffer, `${user.id}.${ext}`);
    try {
        const recordUpdated = await axios.patch(
            `http://127.0.0.1:8090/api/collections/${user.collectionId}/records/${user.id}`,
            form,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return true;
    } catch (err) {
        return false;
    }
};

const generateLoginToken = async (user) => {
    const access_token = await signJwt(user.userId);
    await pb.collection("users").update(user.id, {
        access_token,
    });
    return access_token;
};

const logoutUser = async (user) => {
    try {
        await pb.collection("users").update(user.id, {
            access_token: null,
        });
        return true;
    } catch (err) {
        return false;
    }
};

const createFolder = async (name, uid, user) => {
    try {
        const folders = user.folders || { file: [] };
        folders.file = [...folders.file, { name, uuid: uid }];
        const record = await pb.collection("users").update(user.id, {
            folders: JSON.stringify(folders),
        });
        return { success: true, folders: record.folders };
    } catch (err) {
        return false;
    }
};

const deleteFolder = async (name, user) => {
    try {
        const folders = user.folders.file.filter(
            (folderDetails) => folderDetails.name !== name
        );
        const record = await pb.collection("users").update(user.id, {
            folders: JSON.stringify({ file: folders }),
        });
        return { success: true, folders: record.folders };
    } catch (err) {
        return false;
    }
};

module.exports = {
    createUser,
    uploadFile,
    generateLoginToken,
    logoutUser,
    createFolder,
    deleteFolder,
    createPost,
    getNotes,
    getNote,
};
