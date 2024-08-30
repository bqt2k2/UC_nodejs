const sql = require('./db');

const Admin = function(admin) {
    this.HoTenNguoiDung = user.HoTenNguoiDung;
    this.Email = user.Email;
    this.MatKhau = user.MatKhau;
    this.AnhDaiDien = user.AnhDaiDien;
    this.NgayTao = user.NgayTao;

};
// Hàm lấy thông tin admin từ cơ sở dữ liệu dựa trên email và mật khẩu
Admin.getAdmin = (email, password, result) => {
    sql.query("SELECT * FROM admin WHERE EmailAdmin = ?", [email], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            const admin = res[0];
            // Directly compare the passwords
            if (password === admin.MatKhauAdmin) {
                result(null, admin);
            } else {
                result({ kind: "not_found" }, null);
            }
        } else {
            // No admin found with that email
            result({ kind: "not_found" }, null);
        }
    });
};


module.exports = Admin;
