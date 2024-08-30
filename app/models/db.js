const mysql = require("mysql");
const dbConfig = require("../config/db.config");

const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

connection.connect(error => {
    if (error) {
        console.error('Database connection failed: ' + error.stack);
        return;
    }
    console.log("Successfully connected to the database");
});

module.exports = connection;
