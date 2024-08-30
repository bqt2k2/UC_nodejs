const db = require('./db');

const User = function(user) {
    this.HoTenNguoiDung = user.HoTenNguoiDung;
    this.Email = user.Email;
    this.MatKhau = user.MatKhau;
    this.XacNhanEmail = user.XacNhanEmail;
    this.AnhDaiDien = user.AnhDaiDien;
    this.NgaySinh = user.NgaySinh;

};

// Tạo người dùng mới
User.create = (newUser, callback) => {
    const sql = "INSERT INTO nguoidung (HoTenNguoiDung, Email, MatKhau, XacNhanEmail) VALUES (?, ?, ?, ?)";
    db.query(sql, [newUser.HoTenNguoiDung, newUser.Email, newUser.MatKhau, newUser.XacNhanEmail], (err, result) => {
        if (err) {
            console.error('Error creating user:', err);
            callback(err, null);
            return;
        }
        newUser.id = result.insertId;
        callback(null, newUser);
    });
};

// cập nhật thông tin người dùng
User.updateProfile = (id, updatedUser, callback) => {
    // Construct the SQL query dynamically
    const fields = [];
    const values = [];

    if (updatedUser.HoTenNguoiDung) {
        fields.push('HoTenNguoiDung = ?');
        values.push(updatedUser.HoTenNguoiDung);
    }

    if (updatedUser.NgaySinh) {
        fields.push('NgaySinh = ?');
        values.push(updatedUser.NgaySinh);
    }

    if (updatedUser.AnhDaiDien) {
        fields.push('AnhDaiDien = ?');
        values.push(updatedUser.AnhDaiDien);
    }

    values.push(id);

    const sql = `UPDATE nguoidung SET ${fields.join(', ')} WHERE IDNguoiDung = ?`;
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            callback(err, null);
            return;
        }
        if (result.affectedRows === 0) {
            callback({ kind: "not_found" }, null);
            return;
        }
        callback(null, { id: id, ...updatedUser });
    });
};

// Tìm người dùng theo email
User.findByEmail = (email, callback) => {
    const sql = "SELECT * FROM nguoidung WHERE Email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Error finding user by email:', err);
            callback(err, null);
            return;
        }
        if (result.length > 0) {
            callback(null, result[0]);
        } else {
            callback(null, null);
        }
    });
};

// Tìm người dùng theo ID
User.findById = (userId, callback) => {
    const sql = "SELECT * FROM nguoidung WHERE IDNguoiDung = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error finding user by ID:', err);
            callback(err, null);
            return;
        }
        if (result.length > 0) {
            callback(null, result[0]);
        } else {
            callback(null, null);
        }
    });
};

// Cập nhật email_verified_at cho người dùng
User.verify = (email, callback) => {
    const sql = "UPDATE nguoidung SET XacNhanEmail = CURRENT_TIMESTAMP WHERE Email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Error verifying user:', err);
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};

// Cập nhật reset token và thời gian hết hạn
User.updateResetToken = (email, token, expiryTime, callback) => {
    const sql = "UPDATE nguoidung SET ResetToken = ?, ResetTokenExpiry = ? WHERE Email = ?";
    db.query(sql, [token, expiryTime, email], (err, result) => {
        if (err) {
            console.error('Error updating reset token:', err);
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};

// Đặt lại mật khẩu người dùng
User.resetPassword = (email, newPassword, callback) => {
    const sql = "UPDATE nguoidung SET MatKhau = ? WHERE Email = ?";
    db.query(sql, [newPassword, email], (err, result) => {
        if (err) {
            console.error('Error resetting password:', err);
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};
// quản lí 
// thông tin của tất cả người dùng 
User.getUserInfo = (result) => {
    db.query(`
        SELECT 
            nd.IDNguoiDung,
            nd.MatKhau,
            nd.HoTenNguoiDung,
            nd.Email,
            nd.AnhDaiDien,
            nd.NgaySinh,
            nd.XacNhanEmail,
            nd.ResetToken,
            nd.ResetTokenExpiry,
            nd.ThoiGianDangKyTaiKhoan,
            COUNT(DISTINCT dk.IDKhoaHoc) AS SoKhoaHocDaDangKy,
            COUNT(DISTINCT kh.IDKhoaHoc) AS SoKhoaHocDaDangTai,
            COUNT(DISTINCT dg.IDDanhGiaKhoaHoc) AS SoLuotDanhGia
        FROM 
            nguoidung nd
        LEFT JOIN 
            dangkykhoahoc dk ON nd.IDNguoiDung = dk.IDNguoiDung
        LEFT JOIN 
            khoahoc kh ON nd.IDNguoiDung = kh.IDNguoiTao
        LEFT JOIN 
            danhgiakhoahoc dg ON nd.IDNguoiDung = dg.IDNguoiDung
        GROUP BY 
            nd.IDNguoiDung,
            nd.MatKhau,
            nd.HoTenNguoiDung,
            nd.Email,
            nd.AnhDaiDien,
            nd.NgaySinh,
            nd.XacNhanEmail,
            nd.ResetToken,
            nd.ResetTokenExpiry,
            nd.ThoiGianDangKyTaiKhoan;`,
    (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        result(null, res);
    });
};
// những người dùng mới trong tuần qua 
User.getUsersRegisteredThisWeek = (result) => {
    db.query(`SELECT 
                  nd.IDNguoiDung,
                  nd.MatKhau,
                  nd.HoTenNguoiDung,
                  nd.Email,
                  nd.AnhDaiDien,
                  nd.NgaySinh,
                  nd.XacNhanEmail,
                  nd.ResetToken,
                  nd.ResetTokenExpiry,
                  nd.ThoiGianDangKyTaiKhoan,
                  COUNT(DISTINCT dk.IDKhoaHoc) AS SoKhoaHocDaDangKy,
                  COUNT(DISTINCT kh.IDKhoaHoc) AS SoKhoaHocDaDangTai,
                  COUNT(DISTINCT dg.IDDanhGiaKhoaHoc) AS SoLuotDanhGia
               FROM 
                  nguoidung nd
               LEFT JOIN 
                  dangkykhoahoc dk ON nd.IDNguoiDung = dk.IDNguoiDung
               LEFT JOIN 
                  khoahoc kh ON nd.IDNguoiDung = kh.IDNguoiTao
               LEFT JOIN 
                  danhgiakhoahoc dg ON nd.IDNguoiDung = dg.IDNguoiDung
               WHERE 
                  YEARWEEK(nd.ThoiGianDangKyTaiKhoan, 1) = YEARWEEK(CURDATE(), 1)
               GROUP BY 
                  nd.IDNguoiDung,
                  nd.MatKhau,
                  nd.HoTenNguoiDung,
                  nd.Email,
                  nd.AnhDaiDien,
                  nd.NgaySinh,
                  nd.XacNhanEmail,
                  nd.ResetToken,
                  nd.ResetTokenExpiry,
                  nd.ThoiGianDangKyTaiKhoan`,
    (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};
module.exports = User;