const Note = require("../models/note.model.js");

exports.updateOrCreate = (req, res) => {
    // Validate Request
    if (!req.body.NoiDung) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const userId = req.session.user.IDNguoiDung;
    const courseId = req.params.courseId;
    const noteContent = req.body.NoiDung;

    Note.findByUserIdAndCourseId(userId, courseId, (err, note) => {
        if (err && err.kind === "not_found") {
            // Note not found, create new note
            const newNote = {
                IDKhoaHoc: courseId,
                IDNguoiDung: userId,
                NoiDung: noteContent
            };

            Note.create(newNote, (err, data) => {
                if (err) {
                    return res.status(500).send({
                        message: err.message || "Some error occurred while creating the Note."
                    });
                }
                res.send({ success: true, data });
            });
        } else if (err) {
            return res.status(500).send({
                message: "Error retrieving Note with user ID " + userId + " and course ID " + courseId
            });
        } else {
            // Note found, update it
            Note.updateByUserIdAndCourseId(userId, courseId, noteContent, (err, data) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error updating Note with user ID " + userId + " and course ID " + courseId
                    });
                }
                res.send({ success: true, data });
            });
        }
    });
};

// Retrieve a user's note for a specific course
exports.findUserNote = (req, res) => {
    Note.findByUserIdAndCourseId(req.session.user.IDNguoiDung, req.params.courseId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(200).send({ yourNote: null });
            } else {
                res.status(500).send({
                    message: "Error retrieving Note with user ID " + req.session.user.IDNguoiDung + " and course ID " + req.params.courseId
                });
            }
        } else res.send({ yourNote: data });
    });
};
