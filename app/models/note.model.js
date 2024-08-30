const sql = require("./db.js");

//khai báo
const Note = function(note) {
    this.IDKhoaHoc = note.IDKhoaHoc;
    this.IDNguoiDung = note.IDNguoiDung;
    this.NoiDung = note.NoiDung;
};

// tạo ghi chú
Note.create = (newNote, result) => {
    sql.query("INSERT INTO ghichu SET ?", newNote, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created note: ", { id: res.insertId, ...newNote });
        result(null, { id: res.insertId, ...newNote });
    });
};

// tìm kiếm ghi chứ theo id người dùng và ID khóa học
Note.findByUserIdAndCourseId = (userId, courseId, result) => {
    sql.query(
        "SELECT * FROM ghichu WHERE IDNguoiDung = ? AND IDKhoaHoc = ?",
        [userId, courseId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.length) {
                console.log("found note: ", res[0]);
                result(null, res[0]);
                return;
            }

            // not found Note with the userId and courseId
            result({ kind: "not_found" }, null);
        }
    );
};

// cập nhật ghi chú mới theo ID người dùng và ID khóa học
Note.updateByUserIdAndCourseId = (userId, courseId, noteContent, result) => {
    sql.query(
        "UPDATE ghichu SET NoiDung = ? WHERE IDNguoiDung = ? AND IDKhoaHoc = ?",
        [noteContent, userId, courseId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Note with the userId and courseId
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated note: ", { IDNguoiDung: userId, IDKhoaHoc: courseId, NoiDung: noteContent });
            result(null, { IDNguoiDung: userId, IDKhoaHoc: courseId, NoiDung: noteContent });
        }
    );
};
// Xóa toàn bộ ghi chứ theo ID khoa học
Note.deleteByCourseId = (courseId, result) => {
    sql.query(
        "DELETE FROM ghichu WHERE IDKhoaHoc = ?",
        [courseId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            console.log("deleted notes for course ID: ", courseId);
            result(null, res);
        }
    );
};
module.exports = Note;
