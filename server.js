const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const dotenv = require('dotenv'); // Import dotenv
const path = require('path');
dotenv.config();

app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.use(express.static('app/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Ensure SESSION_SECRET is defined or provide a default
    resave: true,
    saveUninitialized: true,
}));

const users = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', ({ userId, courseId, username }) => {
        if (!users[courseId]) {
            users[courseId] = [];
        }
        users[courseId].push({ userId, socketId: socket.id, username });

        socket.join(courseId);
        io.to(courseId).emit('user connected', `${username} has joined the chat`);

        console.log(`User ${username} connected to course ${courseId}`);
    });

    socket.on('chat message', ({ userId, courseId, msg }) => {
        const user = users[courseId].find(user => user.userId === userId);
        if (user) {
            io.to(courseId).emit('chat message', { username: user.username, msg });
        }
    });

    socket.on('disconnect', () => {
        let userCourseId = null;
        let username = null;

        for (const courseId in users) {
            const userIndex = users[courseId].findIndex(user => user.socketId === socket.id);
            if (userIndex !== -1) {
                userCourseId = courseId;
                username = users[courseId][userIndex].username;
                users[courseId].splice(userIndex, 1);
                break;
            }
        }

        if (userCourseId && username) {
            io.to(userCourseId).emit('user disconnected', `${username} has left the chat`);
        }

        console.log('A user disconnected');
    });
});

require('./app/routes/route')(app);

http.listen(3000, function() {
    console.log('Server running: http://localhost:3000');
});
