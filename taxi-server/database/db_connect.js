const db = require('mysql2');

const conn = db.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'taxi',
    password: 'taxi',
    database: 'Taxi',
});

module.exports = conn;
