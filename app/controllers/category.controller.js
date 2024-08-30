const Category = require('../../app/models/category.model');

// Tạo danh mục mới
exports.createCategory = (req, res) => {
    const newCategory = {
        TenDanhMuc: req.body.name,
        MoTaDanhMuc: req.body.description
    };

    Category.create(newCategory, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the category."
            });
            return;
        }
        res.send(data);
    });
};
// cập nhật danh mục
exports.updateCategory = (req, res) => {
    const updatedCategory = {
        TenDanhMuc: req.body.name,
        MoTaDanhMuc: req.body.description
    };

    Category.update(req.params.id, updatedCategory, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while updating the category."
            });
            return;
        }
        res.send(data);
    });
};
// xóa danh mục
exports.deleteCategory = (req, res) => {
    Category.delete(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while deleting the category."
            });
            return;
        }
        res.send({ message: "Category was deleted successfully!" });
    });
};
// Tìm danh mục theo ID
exports.findOne = (req, res) => {
    Category.findById(req.params.categoryId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Category with id ${req.params.categoryId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Category with id " + req.params.categoryId
                });
            }
        } else res.send(data);
    });
};

// Lấy tất cả danh mục
exports.findAll = (req, res) => {
    Category.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving categories."
            });
        else res.send(data);
    });
};


// Xóa tất cả danh mục
exports.deleteAll = (req, res) => {
    Category.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while removing all categories."
            });
        else res.send({ message: `All Categories were deleted successfully!` });
    });
};
