const sql = require('../models/db');

const Tag = function(tag) {
    this.IDTag = tag.IDTag;
    this.TenTag = tag.TenTag;
};
// them tag mới
Tag.addTag = (courseId, tagId, result) => {
    const query = `
        INSERT INTO tags (IDKhoaHoc, IDTag) VALUES (?, ?)
    `;
    sql.query(query, [courseId, tagId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        result(null, { id: res.insertId, courseId: courseId, tagId: tagId });
    });
};
// tìm kiếm tag theo tên
Tag.findAll = (searchTerm, result) => {
    sql.query("SELECT * FROM tag WHERE TenTag LIKE ?", [`%${searchTerm}%`], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// show toàn bộ
Tag.getAlll = (result) => {
    sql.query("SELECT * FROM tag", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// thêm bảng tag vào khóa học 
Tag.addCourseTags = (values, result) => {
    sql.query("INSERT INTO khoahoc_tag (IDKhoaHoc, IDTag) VALUES ?", [values], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// xóa tag theo khóa học
Tag.deleteCourseTagsByCourseId = (courseId, result) => {
    const query = "DELETE FROM khoahoc_tag WHERE IDKhoaHoc = ?";
    sql.query(query, [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};

// show tag theo khóa học
Tag.getByCourseId = (courseId, result) => {
    const query = `
        SELECT t.IDTag, t.TenTag
        FROM khoahoc_tag kt
        JOIN tag t ON kt.IDTag = t.IDTag
        WHERE kt.IDKhoaHoc = ?
    `;
    sql.query(query, [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};
// cập nhật
Tag.updateCourseTags = (courseId, values, result) => {
    sql.query("DELETE FROM khoahoc_tag WHERE IDKhoaHoc = ?", courseId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        
        if (values.length > 0) {
            const insertQuery = "INSERT INTO khoahoc_tag (IDKhoaHoc, IDTag) VALUES ?";
            sql.query(insertQuery, [values], (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }
                result(null, res);
            });
        } else {
            result(null, res);
        }
    });
};
// xóa tag
Tag.deleteCourseTag = (courseId, tagId, result) => {
    const query = "DELETE FROM khoahoc_tag WHERE IDKhoaHoc = ? AND IDTag = ?";
    sql.query(query, [courseId, tagId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows === 0) {
            // Not found tag with the courseId and tagId
            result({ kind: "not_found" }, null);
            return;
        }
        result(null, res);
    });
};

// quản lí 
// cập nhật tag của khóa học
Tag.updateTags = (courseId, tags, result) => {
    // First, delete existing tags for the course
    const deleteQuery = `
        DELETE FROM tags
        WHERE IDKhoaHoc = ?
    `;
    sql.query(deleteQuery, [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        // Insert new tags
        const insertQuery = `
            INSERT INTO tags (IDKhoaHoc, IDTag) VALUES ?
        `;
        const values = tags.map(tag => [courseId, tag]);
        sql.query(insertQuery, [values], (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            result(null, { id: courseId, tags: tags });
        });
    });
};

// Lấy tất cả tags với phân trang
Tag.getAll = ({ limit, offset }, callback) => {
    sql.query('SELECT * FROM tag LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            console.error('Error retrieving tags:', err);
            callback(err, null);
            return;
        }
        callback(null, results);
    });
};

// Đếm tổng số tags
Tag.countAll = (callback) => {
    sql.query('SELECT COUNT(*) AS total FROM tag', (err, results) => {
        if (err) {
            console.error('Error counting tags:', err);
            callback(err, null);
            return;
        }
        callback(null, results[0].total);
    });
};

// Tạo tag mới
Tag.create = (newTag, callback) => {
    const query = 'INSERT INTO tag (TenTag, MoTa) VALUES (?, ?)';
    sql.query(query, [newTag.TenTag, newTag.MoTa], (err, results) => {
        if (err) {
            console.error('Error creating tag:', err);
            callback(err, null);
            return;
        }
        callback(null, { id: results.insertId, ...newTag });
    });
};

// Cập nhật tag
Tag.update = (id, updatedTag, callback) => {
    sql.query('UPDATE tag SET ? WHERE IDTag = ?', [updatedTag, id], (err, results) => {
        if (err) {
            console.error('Error updating tag:', err);
            callback(err, null);
            return; 
        }
        callback(null, { id, ...updatedTag });
    });
};

// Xóa tag
Tag.delete = (id, callback) => {
    sql.query('DELETE FROM tag WHERE IDTag = ?', [id], (err, results) => {
        if (err) {
            console.error('Error deleting tag:', err);
            callback(err, null);
            return;
        }
        callback(null, results);
    });
};
// cập nhật tag của khóa học
Tag.updateTags = (courseId, tags, result) => {
    // First, delete existing tags for the course
    const deleteQuery = `
        DELETE FROM tags
        WHERE IDKhoaHoc = ?
    `;
    sql.query(deleteQuery, [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        // Insert new tags
        const insertQuery = `
            INSERT INTO tags (IDKhoaHoc, IDTag) VALUES ?
        `;
        const values = tags.map(tag => [courseId, tag]);
        sql.query(insertQuery, [values], (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            result(null, { id: courseId, tags: tags });
        });
    });
};
module.exports = Tag;
