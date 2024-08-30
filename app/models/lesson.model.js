const sql = require('./db');

const Lesson = function(lesson) {
    this.TenBaiHoc = lesson.TenBaiHoc;
    this.MoTaBaiHoc = lesson.MoTaBaiHoc;
    this.FileBaiHoc = lesson.FileBaiHoc;
    this.LoaiBaiHoc = lesson.LoaiBaiHoc;
    this.ThuTuBaiHoc = lesson.ThuTuBaiHoc;
    this.IDKhoaHoc = lesson.IDKhoaHoc;
};

// tạo bài học mới
Lesson.create = (newLesson, result) => {
    sql.query("INSERT INTO baihoc SET ?", newLesson, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { IDBaiHoc: res.insertId, ...newLesson });
    });
};

//tìm bài học theo ID bài học
Lesson.findById = (lessonId, result) => {
    sql.query(`SELECT * FROM baihoc WHERE IDBaiHoc = ${lessonId}`, (err, res) => {
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

// lấy tất cả bài học
Lesson.getAll = result => {
    sql.query("SELECT * FROM baihoc", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// tìm bài học theo ID khóa học
Lesson.findByCourseId = (courseId, result) => {
    sql.query("SELECT * FROM baihoc WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res);
        } else {
            result({ kind: "not_found" }, null);
        }
    });
};


// cập nhật bài học theo ID bài học
Lesson.updateById = (id, lesson, result) => {
    sql.query(
        "UPDATE baihoc SET TenBaiHoc = ?, MoTaBaiHoc = ?, FileBaiHoc = ?, LoaiBaiHoc = ?, ThuTuBaiHoc = ?, IDKhoaHoc = ? WHERE IDBaiHoc = ?",
        [lesson.TenBaiHoc, lesson.MoTaBaiHoc, lesson.FileBaiHoc, lesson.LoaiBaiHoc, lesson.ThuTuBaiHoc, lesson.IDKhoaHoc, id],
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

            result(null, { id: id, ...lesson });
        }
    );
};

// xóa bài học theo ID bài học
Lesson.remove = (id, result) => {
    sql.query("DELETE FROM baihoc WHERE IDBaiHoc = ?", [id], (err, res) => {
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

// Xóa bài học theo id khóa học
Lesson.removeByCourseId = (courseId, result) => {
    sql.query("DELETE FROM baihoc WHERE IDKhoaHoc = ?", [courseId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        // Proceed even if no lessons were found
        console.log(res.affectedRows === 0 ? `No lessons found for course id ${courseId}.` : `${res.affectedRows} lessons deleted for course id ${courseId}.`);
        result(null, res);
    });
};

// tìm bài học theo ID khóa học theo thứ tự bài học
Lesson.findByCourse = (courseId, result) => {
    sql.query("SELECT * FROM baihoc WHERE IDKhoaHoc = ? ORDER BY ThuTuBaiHoc", [courseId], (err, res) => {
        if (err) {
            console.error('Error finding lessons:', err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};


module.exports = Lesson;
