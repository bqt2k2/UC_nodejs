const Tag = require("../models/tag.model.js");

// Tạo tag mới
exports.createTag = (req, res) => {
    const newTag = {
        TenTag: req.body.name,
        MoTa: req.body.description
    };
    Tag.create(newTag, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the tag."
            });
            return;
        }
        res.send(data);
    });
};
// Cập nhật tag
exports.updateTag = (req, res) => {
    const updatedTag = {
        TenTag: req.body.name,
        MoTa: req.body.description
    };

    Tag.update(req.params.id, updatedTag, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while updating the tag."
            });
            return;
        }
        res.send(data);
    });
};

// Xóa tag
exports.deleteTag = (req, res) => {
    Tag.delete(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while deleting the tag."
            });
            return;
        }
        res.send({ message: "Tag was deleted successfully!" });
    });
};

