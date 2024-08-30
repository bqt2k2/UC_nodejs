// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Cấu hình thiết lập lưu trữ cho multer
const storage = multer.diskStorage({
    // Thiết lập thư mục đích để lưu trữ các tệp đã tải lên
    destination: (req, file, cb) => {
        cb(null, 'app/public/avatar'); // Thư mục 'public/avatar' là nơi sẽ lưu các tệp tải lên
    },
    // Định nghĩa quy tắc đặt tên cho các tệp đã tải lên
    filename: (req, file, cb) => {
        const userId = req.session.user.IDNguoiDung; // Lấy id của người dùng từ req.session.user (giả sử đã được đăng nhập và có thông tin người dùng)
        const timestamp = Date.now(); // Lấy thời gian hiện tại
        const extension = path.extname(file.originalname); // Lấy phần mở rộng của tên file gốc

        // Tạo tên file mới có dạng: iduser_avatar_timestamp.extension
        const newFilename = `${userId}_avatar_${timestamp}${extension}`;

        cb(null, newFilename); // Trả về tên file mới cho multer
    },
});

// Hàm lọc tệp để đảm bảo chỉ có các tệp hình ảnh được tải lên
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { // Kiểm tra loại MIME của tệp
        cb(null, true); // Chấp nhận tệp nếu nó là tệp hình ảnh
    } else {
        cb(new Error('Only image files are allowed'), false); // Từ chối tệp nếu nó không phải là tệp hình ảnh
    }
};

// Cấu hình multer
const upload = multer({
    storage, // Thiết lập lưu trữ
    fileFilter, // Thiết lập bộ lọc tệp
    limits: {
        fileSize: 1024 * 1024 * 5, // Giới hạn kích thước tệp là 5MB
    },
});

module.exports = upload; // Xuất cấu hình multer để sử dụng trong các tệp khác
