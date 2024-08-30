const sql = require('../models/db');

const Category = function(category) {
    this.TenDanhMuc = category.TenDanhMuc;
    this.MoTaDanhMuc = category.MoTaDanhMuc;
    this.TrangThaiDanhMuc = category.TrangThaiDanhMuc;
};


// Tìm danh mục theo ID
Category.findById = (categoryId, result) => {
    sql.query(`SELECT * FROM danhmuc WHERE IDDanhMuc = ${categoryId}`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        result({ kind: "not_found" }, null);
    });
};

// Lấy tất cả danh mục
Category.getAll = (callback) => {
    sql.query('SELECT * FROM danhmuc', (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            callback(err, null);
            return;
        }
        callback(null, results);
    });
};

// Cập nhật danh mục theo ID
Category.updateById = (id, category, result) => {
    sql.query(
        "UPDATE danhmuc SET TenDanhMuc = ?, MoTaDanhMuc = ?, TrangThaiDanhMuc = ? WHERE IDDanhMuc = ?",
        [category.TenDanhMuc, category.MoTaDanhMuc, category.TrangThaiDanhMuc, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...category });
        }
    );
};

// Xóa danh mục theo ID
Category.remove = (id, result) => {
    sql.query("DELETE FROM danhmuc WHERE IDDanhMuc = ?", [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

// Xóa tất cả danh mục
Category.removeAll = result => {
    sql.query("DELETE FROM danhmuc", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};
// quản lí 
// Tạo danh mục mới
Category.create = (newCategory, callback) => {
    sql.query('INSERT INTO danhmuc SET ?', newCategory, (err, results) => {
        if (err) {
            console.error('Error creating category:', err);
            callback(err, null);
            return;
        }
        callback(null, { id: results.insertId, ...newCategory });
    });
};
// cập nhật danh mục của khóa học
Category.update = (id, updatedCategory, callback) => {
    sql.query('UPDATE danhmuc SET ? WHERE IDDanhMuc = ?', [updatedCategory, id], (err, results) => {
        if (err) {
            console.error('Error updating category:', err);
            callback(err, null);
            return;
        }
        callback(null, { id, ...updatedCategory });
    });
};
Category.delete = (id, callback) => {
    sql.query('DELETE FROM danhmuc WHERE IDDanhMuc = ?', [id], (err, results) => {
        if (err) {
            console.error('Error deleting category:', err);
            callback(err, null);
            return;
        }
        callback(null, results);
    });
};
// show danh muc 
Category.getPaginated = (limit, offset, callback) => {
    sql.query('SELECT * FROM danhmuc LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            callback(err, null);
            return;
        }
        callback(null, results);
    });
};
// đếm để phân trang
Category.getTotalCount = (callback) => {
    sql.query('SELECT COUNT(*) AS count FROM danhmuc', (err, results) => {
        if (err) {
            console.error('Error fetching total count of categories:', err);
            callback(err, null);
            return;
        }
        callback(null, results[0].count);
    });
};
module.exports = Category;
