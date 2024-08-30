const User = require('../models/auth.model');
const Course = require('../models/course.model');
const bcrypt = require('bcrypt');
const mailer = require('../utils/mailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Hiển thị trang profile
exports.createProfile = async (req, res) => {
    try {
        const userId = req.session.user.IDNguoiDung;
        User.findById(userId, (err, user) => {
            if (err || !user) {
                console.error('Error finding user by ID:', err);
                return res.status(500).send("Internal Server Error");
            }

            Course.findByStudentId(userId, (err, registeredCourses) => {
                if (err) {
                    console.error('Error finding registered courses:', err);
                    return res.status(500).send("Internal Server Error");
                }

                Course.findByInstructorId(userId, (err, createdCourses) => {
                    if (err) {
                        console.error('Error finding created courses:', err);
                        return res.status(500).send("Internal Server Error");
                    }

                    res.render('auth/profile', {
                        user: user,
                        registeredCourses: registeredCourses,
                        createdCourses: createdCourses
                    });
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// cập nhật thông tin
exports.updateProfile = (req, res) => {
    const { name, birthdate } = req.body;
    const userId = req.session.user.IDNguoiDung;

    // Update user data
    const updatedUser = {
        HoTenNguoiDung: name || req.session.user.HoTenNguoiDung,
        NgaySinh: birthdate || req.session.user.NgaySinh,
    };

    // Handle file upload
    if (req.file) {
        updatedUser.AnhDaiDien = `/avatar/${req.file.filename}`;
        // Delete the old avatar file if it exists
        if (req.session.user.AnhDaiDien) {
            const oldAvatarPath = path.join(__dirname, '..', 'public', req.session.user.AnhDaiDien);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlink(oldAvatarPath, (err) => {
                    if (err) console.error('Failed to delete old avatar:', err);
                });
            }
        }
    } else {
        // Preserve existing avatar if no new file is uploaded
        updatedUser.AnhDaiDien = req.session.user.AnhDaiDien;
    }

    // Update the profile in the database
    User.updateProfile(userId, updatedUser, (err, data) => {
        if (err) {
            return res.status(500).send({ message: "Error updating User with id " + userId });
        }

        // Retrieve updated user data to store it in the session
        User.findById(userId, (err, user) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({ message: `Not found User with id ${userId}.` });
                } else {
                    return res.status(500).send({ message: "Error retrieving User with id " + userId });
                }
            }

            // Update session data
            req.session.user = user;
            
            // Send the updated user data and reload the profile page
            return res.send({ message: "Profile updated successfully.", data: req.session.user });
        });
    });
};

// Hiển thị trang đăng nhập
exports.createLogin = (req, res) => {
    res.render('auth/login');
};

// Xử lý đăng nhập người dùng
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
        User.findByEmail(email, (err, user) => {
            if (err) {
                console.error('Error finding user by email:', err);
                return res.render('auth/login', { email, password, loginError: 'An error occurred while searching for the user.' });
            }
            if (!user) {
                return res.render('auth/login', { email, password, loginError: 'User not found.' });
            }

            bcrypt.compare(password, user.MatKhau, (err, result) => {
                if (err) {
                    console.error('Error comparing password:', err);
                    return res.render('auth/login', { email, password, loginError: 'An error occurred while comparing the password.' });
                }

                if (result) {
                    if (!user.XacNhanEmail) {
                        return res.render('auth/login', { email, password, loginError: 'Please verify your email before logging in.' });
                    }

                    req.session.user = user;
                    return res.redirect('/home');
                } else {
                    return res.render('auth/login', { email, password, loginError: 'Incorrect password.' });
                }
            });
        });
    } else {
        return res.render('auth/login', { email, password, loginError: 'All fields are required.' });
    }
};


// Xử lý đăng xuất
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/500'); // Redirect to an error page if needed
        }
        res.redirect('/login');
    });
};


// Xử lí xác nhận email
exports.verify = (req, res) => {
    const { email, token } = req.query;

    if (email && token) {
        bcrypt.compare(email, token, (err, result) => {
            if (err) {
                console.error('Error comparing tokens:', err);
                return res.redirect('/500');
            }

            if (result) {
                User.verify(email, (err) => {
                    if (err) {
                        console.error('Error updating user verification status:', err);
                        return res.redirect('/500');
                    }

                    return res.redirect('/login?message=Email verified successfully.');
                });
            } else {
                return res.redirect('/404');
            }
        });
    } else {
        return res.redirect('/404');
    }
};

// Hiển thị trang đăng ký
exports.createRegister = (req, res) => {
    res.render('auth/register');
};

// Xử lý đăng ký người dùng
exports.register = (req, res) => {
    const { email, password, name } = req.body;

    if (email && password && name) {
        User.findByEmail(email, (err, user) => {
            if (err || user) {
                const conflictError = 'User credentials already exist.';
                return res.render('auth/register', { email, password, name, conflictError });
            }

            bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND)).then((hashedPassword) => {
                const newUser = new User({
                    HoTenNguoiDung: name,
                    Email: email,
                    MatKhau: hashedPassword,
                    XacNhanEmail: null
                });

                User.create(newUser, (err, createdUser) => {
                    if (err) {
                        const conflictError = 'An error occurred while creating the user.';
                        return res.render('auth/register', { email, password, name, conflictError });
                    }

                    if (!createdUser || !createdUser.Email) {
                        const conflictError = 'An error occurred while creating the user.';
                        return res.render('auth/register', { email, password, name, conflictError });
                    }

                    bcrypt.hash(createdUser.Email, parseInt(process.env.BCRYPT_SALT_ROUND)).then((hashedEmail) => {
                        const verificationUrl = `${process.env.APP_URL}/verify?email=${createdUser.Email}&token=${hashedEmail}`;

                        mailer.sendMail(createdUser.Email, "Verify Email", verificationUrl, 'verify')
                            .then(() => {
                                res.render('auth/login');
                            })
                            .catch(err => {
                                console.error('Error sending email:', err);
                                res.render('auth/register', { email, password, name, conflictError: 'An error occurred while sending the verification email.' });
                            });
                    }).catch(err => {
                        console.error('Error hashing email:', err);
                        res.render('auth/register', { email, password, name, conflictError: 'An error occurred while hashing the email.' });
                    });
                });
            }).catch(err => {
                console.error('Error hashing password:', err);
                const conflictError = 'An error occurred while hashing the password.';
                return res.render('auth/register', { email, password, name, conflictError });
            });
        });
    } else {
        const conflictError = 'All fields are required.';
        return res.render('auth/register', { email, password, name, conflictError });
    }
};

//Hiển thị trang quên mật khẩu 
exports.showForgotPasswordForm = (req, res) => {
    res.render('auth/passwords/forgot'); // Adjust the path as per your views structure
};

// Gửi email chứa liên kết để đặt lại mật khẩu
exports.sendResetLinkEmail = (req, res) => {
    const { email } = req.body;

    if (!email) {
        console.error('Email is required.');
        return res.render('auth/passwords/forgot', { conflictError: 'Email is required.' });
    }

    User.findByEmail(email, (err, user) => {
        if (err) {
            console.error('Error finding user by email:', err);
            return res.render('auth/passwords/forgot', { conflictError: 'An error occurred while finding user.' });
        }
        if (!user) {
            console.error('User not found.');
            return res.render('auth/passwords/forgot', { conflictError: 'User not found.' });
        }

        // Generate a unique reset token
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Hash the reset token before storing
        bcrypt.hash(resetToken, parseInt(process.env.BCRYPT_SALT_ROUND, 10))
            .then((hashedToken) => {
                // Construct the reset link URL
                const resetLink = `${process.env.APP_URL}/password/reset?email=${encodeURIComponent(user.Email)}&token=${encodeURIComponent(resetToken)}`;

                // Store the hashed token and expiration in the database
                const expiryTime = Date.now() + 3600000; // 1 hour

                User.updateResetToken(email, hashedToken, expiryTime, (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Error updating user:', updateErr);
                        return res.render('auth/passwords/forgot', { conflictError: 'An error occurred while saving the reset token.' });
                    }

                    // Compose the email content
                    const subject = 'Reset your password';

                    // Send the email using the mailer module
                    mailer.sendMail(user.Email, subject, resetLink, 'reset')
                        .then(() => {
                            console.log('Password reset email sent successfully.');
                            return res.render('auth/passwords/forgot', { email: user.Email, successMessage: 'Password reset email has been sent. Check your email for further instructions.' });
                        })
                        .catch(mailErr => {
                            console.error('Error sending email:', mailErr);
                            return res.render('auth/passwords/forgot', { conflictError: 'An error occurred while sending the reset password email.' });
                        });
                });
            })
            .catch(hashErr => {
                console.error('Error hashing token:', hashErr);
                return res.render('auth/passwords/forgot', { conflictError: 'An error occurred while hashing the reset token.' });
            });
    });
};


// Hiển thị trang cho người dùng đặt lại mật khẩu
exports.showResetPasswordForm = (req, res) => {
    const { token, email } = req.query;
    if (!token || !email) {
        return res.redirect('/404');
    }
    res.render('auth/passwords/reset', { token, email });
};

// Xác minh thông tin đặt lại mật khẩu và thực hiện đặt lại mật khẩu cho người dùng
exports.resetPassword = (req, res) => {
    const { token, email, password, password_confirmation } = req.body;

    if (!token || !email || !password || !password_confirmation) {
        return res.render('auth/passwords/reset', { email, token, conflictError: 'All fields are required.' });
    }

    if (password !== password_confirmation) {
        return res.render('auth/passwords/reset', { email, token, conflictError: 'Passwords do not match.' });
    }

    User.findByEmail(email, (err, user) => {
        if (err || !user) {
            return res.render('auth/passwords/reset', { email, token, conflictError: 'Invalid user.' });
        }

        bcrypt.compare(token, user.ResetToken, (err, result) => {
            if (err || !result || user.ResetTokenExpiry < Date.now()) {
                return res.render('auth/passwords/reset', { email, token, conflictError: 'Invalid or expired token.' });
            }

            bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND)).then((hashedPassword) => {
                User.resetPassword(email, hashedPassword, (resetErr) => {
                    if (resetErr) {
                        return res.render('auth/passwords/reset', { email, token, conflictError: 'An error occurred while resetting the password.' });
                    }

                    return res.redirect('/login?message=Password reset successfully.');
                });
            }).catch(err => {
                return res.render('auth/passwords/reset', { email, token, conflictError: 'An error occurred while hashing the new password.' });
            });
        });
    });
};

