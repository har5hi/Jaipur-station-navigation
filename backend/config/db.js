const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, conn) => {
    if(err) {
        console.error('Error connecting to MySQL:', err.message);
        console.log('Please make sure MySQL is running and credentials in .env are correct.');
    } else {
        console.log('Connected to MySQL successfully');
        conn.release();
    }
});

module.exports = pool.promise();
