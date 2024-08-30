const sql = require('./db');

// Constructor
const Progress = function(progress) {
    this.IDNguoiDung = progress.IDNguoiDung;
    this.IDKhoaHoc = progress.IDKhoaHoc;
    this.IDBaiHoc = progress.IDBaiHoc;
    this.ThoiGianHoanThanh = progress.ThoiGianHoanThanh;
};
// khỏi tạo tiến trình học
Progress.create = (newProgress, result) => {
    sql.query("INSERT INTO progress SET ?", newProgress, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { IDTienTrinh: res.insertId, ...newProgress });
    });
};
// xem tiến trình người học theo ID người dùng và ID khóa học
Progress.getProgressByUserAndCourse = (userId, courseId, result) => {
    sql.query(
        `SELECT * FROM tiendohoctap 
         WHERE IDNguoiDung = ? AND IDKhoaHoc = ? 
         ORDER BY 
         CASE WHEN TrangThaiHoanThanh = 'đang học' THEN 0 ELSE 1 END, 
         NgayHoanThanh DESC LIMIT 1`,
        [userId, courseId],
        (err, res) => {
            if (err) {
                console.error('Error fetching progress:', err);
                result(err, null);
                return;
            }
            result(null, res[0]);
        }
    );
};

// đánh dấu hoàn thành bài học theo id người dùng và ID Bài học , Id khóa học
Progress.completeLesson = (userId, courseId, lessonId, result) => {
    sql.query(
        'SELECT TrangThaiHoanThanh FROM tiendohoctap WHERE IDNguoiDung = ? AND IDKhoaHoc = ? AND IDBaiHoc = ?',
        [userId, courseId, lessonId],
        (selectErr, res) => {
            if (selectErr) {
                console.error('Error checking completion status:', selectErr);
                result(selectErr, null);
                return;
            }

            if (res.length > 0 && res[0].TrangThaiHoanThanh === 'hoàn thành') {
                result(null, { status: 'hoàn thành' });
                return;
            }

            sql.query(
                'UPDATE tiendohoctap SET TrangThaiHoanThanh = ?, NgayHoanThanh = NOW() WHERE IDNguoiDung = ? AND IDKhoaHoc = ? AND IDBaiHoc = ?',
                ['hoàn thành', userId, courseId, lessonId],
                (updateErr, updateRes) => {
                    if (updateErr) {
                        console.error('Error updating lesson status:', updateErr);
                        result(updateErr, null);
                        return;
                    }

                    if (updateRes.affectedRows === 0) {
                        sql.query(
                            'INSERT INTO tiendohoctap (IDNguoiDung, IDKhoaHoc, IDBaiHoc, TrangThaiHoanThanh, NgayHoanThanh) VALUES (?, ?, ?, ?, NOW())',
                            [userId, courseId, lessonId, 'hoàn thành'],
                            (insertErr, insertRes) => {
                                if (insertErr) {
                                    console.error('Error inserting completion record:', insertErr);
                                    result(insertErr, null);
                                    return;
                                }
                                result(null, { status: 'hoàn thành' });
                            }
                        );
                    } else {
                        result(null, { status: 'hoàn thành' });
                    }
                }
            );
        }
    );
};


// cập nhật lại tiến trình học
Progress.updateProgress = (userId, courseId, lessonId, result) => {
    sql.query(
        'SELECT TrangThaiHoanThanh FROM tiendohoctap WHERE IDNguoiDung = ? AND IDKhoaHoc = ? AND IDBaiHoc = ?',
        [userId, courseId, lessonId],
        (selectErr, res) => {
            if (selectErr) {
                console.error('Error checking progress:', selectErr);
                result(selectErr, null);
                return;
            }

            if (res.length > 0 && res[0].TrangThaiHoanThanh === 'hoàn thành') {
                result(null, { status: 'hoàn thành' });
                return;
            }

            sql.query(
                'UPDATE tiendohoctap SET TrangThaiHoanThanh = ?, NgayHoanThanh = NOW() WHERE IDNguoiDung = ? AND IDKhoaHoc = ? AND IDBaiHoc = ?',
                ['đang học', userId, courseId, lessonId],
                (updateErr, updateRes) => {
                    if (updateErr) {
                        console.error('Error updating progress:', updateErr);
                        result(updateErr, null);
                        return;
                    }
                    
                    if (updateRes.affectedRows === 0) {
                        sql.query(
                            'INSERT INTO tiendohoctap (IDNguoiDung, IDKhoaHoc, IDBaiHoc, TrangThaiHoanThanh, NgayHoanThanh) VALUES (?, ?, ?, ?, NOW())',
                            [userId, courseId, lessonId, 'đang học'],
                            (insertErr, insertRes) => {
                                if (insertErr) {
                                    console.error('Error inserting progress record:', insertErr);
                                    result(insertErr, null);
                                    return;
                                }
                                result(null, { status: 'đang học' });
                            }
                        );
                    } else {
                        result(null, { status: 'đang học' });
                    }
                }
            );
        }
    );
};



// // lưu tiến trình
// Progress.saveProgress = (userId, courseId, lessonId, progress, result) => {
//     sql.query(
//         'INSERT INTO tiendohoctap (IDNguoiDung, IDKhoaHoc, IDBaiHoc, TrangThaiHoanThanh) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE TrangThaiHoanThanh = ?',
//         [userId, courseId, lessonId, progress, progress],
//         (err, res) => {
//             if (err) {
//                 console.error('Error saving progress:', err);
//                 result(err, null);
//                 return;
//             }
//             result(null, res);
//         }
//     );
// };

// tìm tiến trình học của người dùng
Progress.findById = (progressId, result) => {
    sql.query(`SELECT * FROM progress WHERE IDTienTrinh = ${progressId}`, (err, res) => {
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
// toàn bộ tiến trình học
Progress.getAll = result => {
    sql.query("SELECT * FROM progress", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};
// tiến trình học theo ID người dùng
Progress.findByUserId = (userId, result) => {
    sql.query("SELECT * FROM progress WHERE IDNguoiDung = ?", [userId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};
// tiến trình học của ID khóa học
Progress.findByCourseId = (courseId, result) => {
    sql.query("SELECT * FROM progress WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};
// cập nhật tiến trình 
Progress.updateById = (id, progress, result) => {
    sql.query(
        "UPDATE progress SET IDNguoiDung = ?, IDKhoaHoc = ?, IDBaiHoc = ?, ThoiGianHoanThanh = ? WHERE IDTienTrinh = ?",
        [progress.IDNguoiDung, progress.IDKhoaHoc, progress.IDBaiHoc, progress.ThoiGianHoanThanh, id],
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
            result(null, { IDTienTrinh: id, ...progress });
        }
    );
};
// xóa tiến trình theo ID tiến trình
Progress.remove = (id, result) => {
    sql.query("DELETE FROM progress WHERE IDTienTrinh = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        result(null, res);
    });
};
// xóa tiến trình theo id bài học
Progress.removeByLessonId = (lessonId, result) => {
    sql.query("DELETE FROM tiendohoctap WHERE IDBaiHoc = ?", [lessonId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};
// xóa tiến trình theo id khóa học
Progress.removeByCourseId = (courseId, result) => {
    sql.query("DELETE FROM tiendohoctap WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};
// xóa toàn bộ tiến trình
Progress.removeAll = result => {
    sql.query("DELETE FROM progress", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};

//tìm tiến trình
Progress.findByUserCourse = (userId, courseId, result) => {
    sql.query("SELECT * FROM tiendohoctap WHERE IDNguoiDung = ? AND IDKhoaHoc = ? ORDER BY NgayHoanThanh DESC LIMIT 1", [userId, courseId], (err, res) => {
        if (err) {
            console.error('Error finding progress:', err);
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

module.exports = Progress;
