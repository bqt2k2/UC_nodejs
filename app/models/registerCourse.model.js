const sql = require('./db');

const Registration = function(registration) {
    this.IDNguoiDung = registration.IDNguoiDung;
    this.IDKhoaHoc = registration.IDKhoaHoc;
    this.ThoiGianDangKy = registration.ThoiGianDangKy;
    this.TrangThai = registration.TrangThai;
};

// tạo đăng kí mới
Registration.create = (newRegistration, result) => {
    sql.query("INSERT INTO dangkykhoahoc SET ?", newRegistration, (err, res) => {
        if (err) {
            console.error("Error creating registration:", err);
            result(err, null);
            return;
        }
        result(null, { IDDangKyKhoaHoc: res.insertId, ...newRegistration });
    });
};
// xóa đăng ký
Registration.unregister = (userId, courseId, result) => {
    sql.query(
        'DELETE FROM dangkykhoahoc WHERE IDNguoiDung = ? AND IDKhoaHoc = ?',
        [userId, courseId],
        (err, res) => {
            if (err) {
                console.error('Error unregistering from course:', err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, res);
        }
    );
};

// tìm đăng kí
Registration.findById = (registrationId, result) => {
    sql.query(`SELECT * FROM dangkykhoahoc WHERE IDDangKyKhoaHoc = ${registrationId}`, (err, res) => {
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

// show toàn bộ đăng ký
Registration.getAll = result => {
    sql.query("SELECT * FROM dangkykhoahoc", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// show đăng ký người dùng theo người dùng
Registration.findByUserId = (userId, result) => {
    sql.query("SELECT * FROM dangkykhoahoc WHERE IDNguoiDung = ?", [userId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// show đăng ký người dùng theo khóa học
Registration.findByCourseId = (courseId, result) => {
    sql.query("SELECT * FROM dangkykhoahoc WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};
// kiem tra đăng kí của người dùng
Registration.findByCourseAndUser = (courseId, userId, result) => {
    sql.query("SELECT * FROM dangkykhoahoc WHERE IDKhoaHoc = ? AND IDNguoiDung = ?", [courseId, userId], (err, res) => {
        if (err) {
            console.log("Database error: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
        } else {
            result(null, null); // No registration found, return null
        }
    });
};

// tạo đăng ký
Registration.create = (newRegistration, result) => {
    sql.query("INSERT INTO dangkykhoahoc SET ?", newRegistration, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { IDDangKyKhoaHoc: res.insertId, ...newRegistration });
    });
};
//cập nhạt đăng ký
Registration.updateById = (id, registration, result) => {
    sql.query(
        "UPDATE dangkykhoahoc SET IDNguoiDung = ?, IDKhoaHoc = ?, ThoiGianDangKy = ?, TrangThai = ? WHERE IDDangKyKhoaHoc = ?",
        [registration.IDNguoiDung, registration.IDKhoaHoc, registration.ThoiGianDangKy, registration.TrangThai, id],
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

            result(null, { id: id, ...registration });
        }
    );
};

// xóa đăng ký theo ID khóa học
Registration.remove = (courseId, result) => {
    sql.query("DELETE FROM dangkykhoahoc WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.affectedRows === 0) {
            console.log(`No registrations found for course id ${courseId}.`);
            result({ kind: "not_found" }, null);
            return;
        }
        console.log(`${res.affectedRows} registrations deleted for course id ${courseId}.`);
        result(null, res);
    });
};


// Xóa toàn bộ đăng ký
Registration.removeAll = result => {
    sql.query("DELETE FROM dangkykhoahoc", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

module.exports = Registration;
