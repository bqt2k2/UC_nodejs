const sql = require('./db');

const Course = function (course) {
    this.TenKhoaHoc = course.TenKhoaHoc;
    this.MoTaKhoaHoc = course.MoTaKhoaHoc;
    this.AnhKhoaHoc = course.AnhKhoaHoc;
    this.TrangThaiKhoaHoc = course.TrangThaiKhoaHoc;
    this.IDDanhMuc = course.IDDanhMuc;
    this.IDNguoiTao = course.IDNguoiTao;
};

// Tạo khóa học mới
Course.create = (newCourse, result) => {
    sql.query("INSERT INTO khoahoc SET ?", newCourse, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { IDKhoaHoc: res.insertId, ...newCourse });
    });
};

// Tìm khóa học theo ID khóa học
Course.findById = (courseId, result) => {
    sql.query(`SELECT khoahoc.*, 
                COALESCE(AVG(danhgiakhoahoc.DiemDanhGia), 0) AS DiemTrungBinh,
                COUNT(danhgiakhoahoc.IDDanhGiaKhoaHoc) AS SoLuongDanhGia
                FROM khoahoc
                LEFT JOIN danhgiakhoahoc ON khoahoc.IDKhoaHoc = danhgiakhoahoc.IDKhoaHoc
                WHERE khoahoc.IDKhoaHoc = ?
                GROUP BY khoahoc.IDKhoaHoc`, [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
        } else {
            result({ kind: "not_found" }, null);
        }
    });
};


// Tìm các khóa học đã đăng ký bởi người dùng
Course.findByStudentId = (userId, callback) => {
    const sql1 = "SELECT * FROM khoahoc WHERE IDKhoaHoc IN (SELECT IDKhoaHoc FROM dangkykhoahoc WHERE IDNguoiDung = ?)";
    sql.query(sql1, [userId], (err, result) => {
        if (err) {
            console.error('Error finding courses by student ID:', err);
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};

// Tìm các khóa học đã tạo bởi người dùng
Course.findByInstructorId = (userId, callback) => {
    const sql1 = "SELECT * FROM khoahoc WHERE IDNguoiTao = ?";
    sql.query(sql1, [userId], (err, result) => {
        if (err) {
            console.error('Error finding courses by instructor ID:', err);
            callback(err, null);
            return;
        }
        callback(null, result);
    });
};

// Lấy tất cả khóa học và đánh giá
Course.getAllApproved = (result) => {
    sql.query(
        `SELECT 
    khoahoc.*, 
    COALESCE(AVG(danhgiakhoahoc.DiemDanhGia), 0) AS DiemTrungBinh,
    COUNT(danhgiakhoahoc.IDDanhGiaKhoaHoc) AS SoLuongDanhGia
FROM 
    khoahoc
LEFT JOIN 
    danhgiakhoahoc ON khoahoc.IDKhoaHoc = danhgiakhoahoc.IDKhoaHoc
WHERE 
    khoahoc.TrangThaiKhoaHoc = 'Đã duyệt'
GROUP BY 
    khoahoc.IDKhoaHoc
ORDER BY 
    khoahoc.ThoiGianDangTaiKhoaHoc DESC;
`,
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            result(null, res);
        }
    );
};

// Lấy gợi ý khóa học dựa trên ID khóa học đã hoàn thành
Course.getSuggestions = (completedCourseId, result) => {
    sql.query(
                    `SELECT 
    k.IDKhoaHoc, 
    k.TenKhoaHoc, 
    k.MoTaKhoaHoc, 
    k.AnhKhoaHoc, 
    k.TrangThaiKhoaHoc, 
    k.ThoiGianDangTaiKhoaHoc, 
    COUNT(kt.IDTag) AS TagMatchCount
FROM 
    khoahoc AS k
JOIN 
    khoahoc_tag AS kt ON k.IDKhoaHoc = kt.IDKhoaHoc
WHERE 
    kt.IDTag IN (SELECT IDTag FROM khoahoc_tag WHERE IDKhoaHoc = ?) 
    AND k.IDKhoaHoc != ?
GROUP BY 
    k.IDKhoaHoc
ORDER BY 
    TagMatchCount DESC, 
    CASE 
        WHEN k.TenKhoaHoc LIKE CONCAT('%', (SELECT TenKhoaHoc FROM khoahoc WHERE IDKhoaHoc = ?), '%') THEN 1
        ELSE 2
    END ASC, 
    LENGTH(k.TenKhoaHoc) ASC,  
    k.TenKhoaHoc ASC      
LIMIT 0, 25;

            `,
        [completedCourseId, completedCourseId, completedCourseId],
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

// Cập nhật khóa học theo ID
Course.updateById = (id, course, result) => {
    let query = "UPDATE khoahoc SET TenKhoaHoc = ?, MoTaKhoaHoc = ?, TrangThaiKhoaHoc = ?";
    let params = [course.TenKhoaHoc, course.MoTaKhoaHoc, course.TrangThaiKhoaHoc];

    if (course.AnhKhoaHoc) {
        query += ", AnhKhoaHoc = ?";
        params.push(course.AnhKhoaHoc);
    }

    query += ", IDDanhMuc = ?, IDNguoiTao = ? WHERE IDKhoaHoc = ?";
    params.push(course.IDDanhMuc, course.IDNguoiTao, id);

    sql.query(query, params, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, { id: id, ...course });
    });
};
// Cập nhật trạng thái khóa học theo ID
Course.updateStatusById = (id, status, result) => {
    const query = "UPDATE khoahoc SET TrangThaiKhoaHoc = ? WHERE IDKhoaHoc = ?";
    const params = [status, id];

    sql.query(query, params, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, { id: id, status: status });
    });
};



// Xóa khóa học theo ID
Course.remove = (id, result) => {
    sql.query("DELETE FROM khoahoc WHERE IDKhoaHoc = ?", id, (err, res) => {
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

// Xóa tất cả khóa học
Course.removeAll = result => {
    sql.query("DELETE FROM khoahoc", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// Thêm danh mục cho khóa học
Course.addCategory = (courseCategory, result) => {
    sql.query("INSERT INTO danhmuc SET ?", courseCategory, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, { ...courseCategory });
    });
};

// Tìm danh mục theo ID khóa học
Course.getCategoryByCourseId = (courseId, result) => {
    sql.query("SELECT IDDanhMuc FROM danhmuc WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
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
// Get courses by category ID and filter by approved status
Course.getByCategoryId = (categoryId, result) => {
    sql.query(
        "SELECT * FROM khoahoc WHERE IDDanhMuc = ? AND TrangThaiKhoaHoc = 'Đã duyệt'",
        [categoryId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            result(null, res);
        }
    );
};

// Search approved courses by query
Course.searchApproved = (query, result) => {
    sql.query(
        "SELECT * FROM khoahoc WHERE TenKhoaHoc LIKE ? AND TrangThaiKhoaHoc = 'Đã duyệt'",
        [`%${query}%`],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            result(null, res);
        }
    );
};
// quản lí
// thông tin tất cả khóa học 
Course.getCourses = (limit, offset, result) => {
    sql.query(
        `SELECT k.IDKhoaHoc, k.TenKhoaHoc, k.MoTaKhoaHoc, k.AnhKhoaHoc, k.TrangThaiKhoaHoc, 
                (SELECT COUNT(DISTINCT dk1.IDNguoiDung) 
                 FROM dangkykhoahoc dk1 
                 WHERE dk1.IDKhoaHoc = k.IDKhoaHoc) AS TongLuotDangKy,
                ROUND(AVG(dg.DiemDanhGia), 1) AS TrungBinhDiemDanhGia,
                COUNT(DISTINCT dg.IDDanhGiaKhoaHoc) AS SoLuotDanhGia
         FROM khoahoc k
         LEFT JOIN danhgiakhoahoc dg ON k.IDKhoaHoc = dg.IDKhoaHoc
         GROUP BY k.IDKhoaHoc, k.TenKhoaHoc, k.MoTaKhoaHoc, k.AnhKhoaHoc, k.TrangThaiKhoaHoc
         ORDER BY k.IDKhoaHoc DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
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

// truy lượt đăng kí của khóa học trong 1 tuần
Course.getMostRegisteredThisWeek = async (result) => {
    const query = `
-- Subquery to calculate the total number of registrations for each course in the current week
WITH RegistrationCounts AS (
    SELECT 
        dk.IDKhoaHoc,
        COUNT(dk.IDNguoiDung) AS TongLuotDangKy
    FROM 
        dangkykhoahoc dk
    WHERE 
        YEARWEEK(dk.ThoiGianDangKy, 1) = YEARWEEK(CURDATE(), 1)
    GROUP BY 
        dk.IDKhoaHoc
),
-- Subquery to calculate the average rating and count of ratings for each course
RatingStats AS (
    SELECT 
        k.IDKhoaHoc,
        ROUND(AVG(dg.DiemDanhGia), 1) AS TrungBinhDiemDanhGia,
        COUNT(DISTINCT dg.IDDanhGiaKhoaHoc) AS SoLuotDanhGia
    FROM 
        khoahoc k
    LEFT JOIN 
        danhgiakhoahoc dg ON k.IDKhoaHoc = dg.IDKhoaHoc
    GROUP BY 
        k.IDKhoaHoc
)
SELECT 
    k.IDKhoaHoc, 
    k.TenKhoaHoc, 
    k.MoTaKhoaHoc, 
    k.AnhKhoaHoc, 
    k.TrangThaiKhoaHoc, 
    COALESCE(rc.TongLuotDangKy, 0) AS TongLuotDangKy,
    COALESCE(rs.TrungBinhDiemDanhGia, 0) AS TrungBinhDiemDanhGia,
    COALESCE(rs.SoLuotDanhGia, 0) AS SoLuotDanhGia
FROM 
    khoahoc k
JOIN 
    RegistrationCounts rc ON k.IDKhoaHoc = rc.IDKhoaHoc
LEFT JOIN 
    RatingStats rs ON k.IDKhoaHoc = rs.IDKhoaHoc
ORDER BY 
    rc.TongLuotDangKy DESC
LIMIT 10;
    `;
    sql.query(query, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        result(null, res);
    });
};
//đếm số hàng để phân trang
Course.getTotalCourses = (result) => {
    sql.query(`SELECT COUNT(*) AS total FROM khoahoc`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        result(null, res[0].total);
    });
};

// khóa học dc đăng kí nhiều nhất
Course.getMostRegistered = async (result) => {
    const query = `
-- Step 1: Subquery to count registrations per course
WITH RegistrationCounts AS (
    SELECT 
        dk.IDKhoaHoc,
        COUNT(dk.IDNguoiDung) AS TongLuotDangKy
    FROM 
        dangkykhoahoc dk
    GROUP BY 
        dk.IDKhoaHoc
)

-- Step 2: Main query to join with course and rating tables
SELECT 
    k.IDKhoaHoc, 
    k.TenKhoaHoc, 
    k.MoTaKhoaHoc, 
    k.AnhKhoaHoc, 
    k.TrangThaiKhoaHoc, 
    rc.TongLuotDangKy,
    ROUND(AVG(dg.DiemDanhGia), 1) AS TrungBinhDiemDanhGia,
    COUNT(DISTINCT dg.IDDanhGiaKhoaHoc) AS SoLuotDanhGia
FROM 
    khoahoc k
JOIN 
    RegistrationCounts rc ON k.IDKhoaHoc = rc.IDKhoaHoc
LEFT JOIN 
    danhgiakhoahoc dg ON k.IDKhoaHoc = dg.IDKhoaHoc
GROUP BY 
    k.IDKhoaHoc, 
    k.TenKhoaHoc, 
    k.MoTaKhoaHoc, 
    k.AnhKhoaHoc, 
    k.TrangThaiKhoaHoc, 
    rc.TongLuotDangKy
ORDER BY 
    rc.TongLuotDangKy DESC
LIMIT 10;

    `;
    sql.query(query, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        result(null, res);
    });
};
// thông tin khóa học của người dùng 
// lay thong tin khoa hoc của tác giả 
Course.getByAuthorId = (authorId, result) => {
    const query = `
        SELECT k.IDKhoaHoc, k.TenKhoaHoc, k.MoTaKhoaHoc, k.AnhKhoaHoc, k.TrangThaiKhoaHoc, 
            COUNT(DISTINCT dk.IDNguoiDung) AS TongLuotDangKy,
            ROUND(AVG(dg.DiemDanhGia), 1) AS TrungBinhDiemDanhGia,
            COUNT(DISTINCT dg.IDDanhGiaKhoaHoc) AS SoLuotDanhGia
        FROM khoahoc k
        LEFT JOIN dangkykhoahoc dk ON k.IDKhoaHoc = dk.IDKhoaHoc
        LEFT JOIN danhgiakhoahoc dg ON k.IDKhoaHoc = dg.IDKhoaHoc
        WHERE k.IDNguoiTao = ?
        GROUP BY k.IDKhoaHoc, k.TenKhoaHoc, k.MoTaKhoaHoc, k.AnhKhoaHoc, k.TrangThaiKhoaHoc;
    `;
    sql.query(query, [authorId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        result(null, res);
    });
};
// thong tin khoa hoc nguoi dung da dang ki
Course.getByUserId = (userId, result) => {
    const query = `
            SELECT dk.IDDangKyKhoaHoc, dk.IDNguoiDung, dk.IDKhoaHoc, dk.ThoiGianDangKy, dk.TrangThai,
            k.TenKhoaHoc, k.MoTaKhoaHoc, k.AnhKhoaHoc, k.TrangThaiKhoaHoc,
            COUNT(DISTINCT dk.IDNguoiDung) AS TongLuotDangKy,
            ROUND(AVG(dg.DiemDanhGia), 1) AS TrungBinhDiemDanhGia,
            COUNT(DISTINCT dg.IDDanhGiaKhoaHoc) AS SoLuotDanhGia
            FROM dangkykhoahoc dk
            JOIN khoahoc k ON dk.IDKhoaHoc = k.IDKhoaHoc
            LEFT JOIN danhgiakhoahoc dg ON k.IDKhoaHoc = dg.IDKhoaHoc
            WHERE dk.IDNguoiDung = ?
            GROUP BY dk.IDDangKyKhoaHoc, dk.IDNguoiDung, dk.IDKhoaHoc, dk.ThoiGianDangKy, dk.TrangThai,
                    k.TenKhoaHoc, k.MoTaKhoaHoc, k.AnhKhoaHoc, k.TrangThaiKhoaHoc;

    `;
    sql.query(query, [userId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        result(null, res);
    });
};
// Cập nhật trạng thái khóa học theo ID khóa học
Course.updateStatus = (courseId, status, result) => {
    sql.query(
        "UPDATE khoahoc SET TrangThaiKhoaHoc = ? WHERE IDKhoaHoc = ?",
        [status, courseId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Course with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: courseId, status: status });
        }
    );
};
Course.updateByIdAdmin = (id, course, result) => {
    let query = "UPDATE khoahoc SET IDDanhMuc = ? WHERE IDKhoaHoc = ?";
    let params = [course.IDDanhMuc, id];

    sql.query(query, params, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        // Update tags
        let deleteTagsQuery = "DELETE FROM khoahoc_tag WHERE IDKhoaHoc = ?";
        sql.query(deleteTagsQuery, [id], (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (course.Tags && course.Tags.length > 0) {
                let insertTagsQuery = "INSERT INTO khoahoc_tag (IDKhoaHoc, IDTag) VALUES ?";
                let tagValues = course.Tags.map(tagId => [id, tagId]);

                sql.query(insertTagsQuery, [tagValues], (err, res) => {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                        return;
                    }

                    result(null, { id: id, ...course });
                });
            } else {
                result(null, { id: id, ...course });
            }
        });
    });
};


module.exports = Course;
