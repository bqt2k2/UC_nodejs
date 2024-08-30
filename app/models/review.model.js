const sql = require('../models/db');

const Review = function(review) {
    this.IDNguoiDung = review.IDNguoiDung;
    this.IDKhoaHoc = review.IDKhoaHoc;
    this.DiemDanhGia = review.DiemDanhGia;
    this.BinhLuan = review.BinhLuan;
};

// Tạo đánh giá mới
Review.create = (newReview, result) => {
    sql.query("INSERT INTO danhgiakhoahoc SET ?", newReview, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { IDDanhGiaKhoaHoc: res.insertId, ...newReview });
    });
};
// Cập nhật đánh giá theo ID người dùng và ID khóa học
Review.updateByUserIdAndCourseId = (userId, courseId, review, result) => {
    sql.query(
        "UPDATE danhgiakhoahoc SET DiemDanhGia = ?, BinhLuan = ?, ThoiGianDanhGia = ? WHERE IDNguoiDung = ? AND IDKhoaHoc = ?",
        [review.DiemDanhGia, review.BinhLuan, new Date(), userId, courseId],  // Add update timestamp
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

            result(null, { userId: userId, courseId: courseId, ...review });
        }
    );
};

// Tìm đánh giá của người dùng cho một khóa học
Review.findUserReview = (courseId, userId, result) => {
    sql.query(
        "SELECT * FROM danhgiakhoahoc WHERE IDKhoaHoc = ? AND IDNguoiDung = ?",
        [courseId, userId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            if (res.length) {
                result(null, res[0]);
                return;
            }
            // Không có đánh giá nào được tìm thấy
            result({ kind: "not_found" }, null);
        }
    );
};

// Lấy tất cả đánh giá (mới nhất đến cũ nhất)
Review.getAll = result => {
    sql.query("SELECT * FROM danhgiakhoahoc ORDER BY ThoiGianDanhGia DESC", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// Tìm đánh giá theo ID
Review.findById = (reviewId, result) => {
    sql.query(`SELECT * FROM danhgiakhoahoc WHERE IDDanhGiaKhoaHoc = ${reviewId}`, (err, res) => {
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

// Lấy tất cả đánh giá
Review.getAll = result => {
    sql.query("SELECT * FROM danhgiakhoahoc", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// Lấy đánh giá theo ID người dùng
Review.findByUserId = (userId, result) => {
    sql.query(
        `SELECT dg.IDDanhGiaKhoaHoc, dg.IDNguoiDung, dg.IDKhoaHoc, dg.DiemDanhGia, dg.BinhLuan, dg.ThoiGianDanhGia,
                kh.TenKhoaHoc
         FROM danhgiakhoahoc dg
         JOIN khoahoc kh ON dg.IDKhoaHoc = kh.IDKhoaHoc
         WHERE dg.IDNguoiDung = ?`,
        [userId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            result(null, res);
        }
    );
};

// Lấy đánh giá theo ID khóa học
Review.findByCourseId = (courseId, result) => {
    sql.query(` SELECT danhgiakhoahoc.*, nguoidung.HoTenNguoiDung , nguoidung.AnhDaiDien
        FROM danhgiakhoahoc
        JOIN nguoidung ON danhgiakhoahoc.IDNguoiDung = nguoidung.IDNguoiDung
        WHERE danhgiakhoahoc.IDKhoaHoc = ?  ORDER BY ThoiGianDanhGia DESC`, [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};
// xóa đánh giá theo IDNguoiDung va IDKhoaHoc
Review.removeByUserIdAndCourseId = (userId, courseId, result) => {
    sql.query("DELETE FROM danhgiakhoahoc WHERE IDNguoiDung = ? AND IDKhoaHoc = ?", [userId, courseId], (err, res) => {
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

// Xóa tất cả đánh giá theo ID khóa học
Review.removeAllByCourseId = (courseId, result) => {
    sql.query("DELETE FROM danhgiakhoahoc WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

module.exports = Review;
