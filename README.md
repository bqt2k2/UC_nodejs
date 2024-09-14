# 📚 UC Node.js Course Sharing Platform

A web-based platform designed for course sharing, allowing users to register, continue learning, view personalized suggestions, and manage courses. The platform includes both user and admin features, along with real-time chat functionality.

---

## 🚀 Features

### 🔹 User Features:
- **Course Access:** Users can visit the platform to search for and participate in courses they are interested in. They can also upload the courses they own.
- **Guest Access:** Users can access the platform as guests without logging in, allowing them to search for and view detailed course information. To register for courses, upload, rate, or edit course information, they must log in.
- **Course Registration:** Users can post, add, edit, and delete courses, as well as register for other courses.
- **Continue Learning:** Users can continue courses from where they last left off.
- **View Suggested Courses:** Personalized course recommendations based on users' preferences and learning activities.
- **Gmail Authentication:** Secure login via Gmail to access advanced platform features.

### 🔹 Admin Features:
- **Course Management:** Admins can browse and manage all courses.
- **User Management:** Admins can view and manage user information, including their learning history and courses they’ve participated in.
- **Statistics and Reports:** Admins can view platform activity statistics, such as the number of courses posted, courses completed, user numbers, and generate detailed reports.
- **Real-time Communication:** A chat functionality for users to discuss courses or receive technical support.


---

## 💻 Technologies Used

### Front End
- HTML
- CSS
- JavaScript
- EJS (Embedded JavaScript)

### Back End
- Node.js
- Express.js
- MySQL
- XAMPP

### Other Tools
- Socket.IO (Real-time communication)
- Body-parser (Request parsing)
- Method-override (Support for PUT/DELETE in forms)
- Bcrypt (Password hashing)
- Express-session (Session management)
- Multer (File uploads)
- fs-extra (File system operations)

---
## 🖼️ Screenshots

### Login Page
![Login](app/public/img/login.png)

### Homepage
![Homepage Screenshot](app/public/img/home.png)

### Courses Management
![Courses Screenshot](app/public/img/postCoures.png)

### Lesson Management
![Lesson Screenshot](app/public/img/postLesson.png)

### Learning Page
![Learning Screenshot](app/public/img/lerning.png)

---
## 🛠 Installation and Setup

### Prerequisites

1. **Install XAMPP:**
   - Download and install XAMPP from [Apache Friends](https://www.apachefriends.org/index.html).
   - Start Apache and MySQL.
   - Create a MySQL database named `uc`.
   - Import the database schema from the `ĐATN` file.
   - **Default credentials:**
     - **Username:** `root`
     - **Password:** *(empty)*

2. **Install Node.js:**
   - Download and install Node.js from [Node.js Official Site](https://nodejs.org/en/).

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/bqt2k2/UC_nodejs.git
2. **Navigate to the Project Directory:**
   cd UC_nodejs.
3. **Install Dependencies: Run the following commands to install the necessary libraries:**
npm install.
npm install express ejs body-parser method-override bcrypt express-session multer fs-extra.
###Running the Project
1. **Start the Application:**
  npm run start
2. **Access the Application:**
  Open your browser and go to http://localhost:3000/home.
## 🌐 Usage
- Course Registration: Users can post, edit, and delete courses and register for courses.
- Continue Learning: Users resume courses from where they last left off.
- Manage Courses: Admins can browse the catalog.
- Real-time Chat: Chat with other users through real-time chat functionality.
## 🤝 Contributing
Feel free to fork the project, submit pull requests, or report issues. All contributions are welcome!
## 📜 License
This project is licensed under the MIT License. See the LICENSE file for details.
