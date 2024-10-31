// server.js
const express = require('express');
const mariadb = require('mariadb');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000; // Change if needed

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Allow Cross-Origin Resource Sharing (CORS) so frontend can communicate with the backend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Create a pool to connect to the MariaDB database
const pool = mariadb.createPool({
    host: '127.0.0.1', 
    user: 'pk_admin', 
    password: 'longasspassword', 
    database: 'parkeringskompagniet_db', 
    port: 3307, // Add this line to specify the port number
    connectionLimit: 20, // Increase the number of maximum connections allowed in the pool
    acquireTimeout: 60000, // Increase timeout duration
});


// Define endpoint for user registration
app.post('/register', async (req, res) => {
    const { name, password, phone } = req.body;

    // Validate that all fields are provided
    if (!name || !password || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let conn;
    try {
        // Connect to the database and insert user details
        conn = await pool.getConnection();
        const query = `INSERT INTO user (name, password, phone) VALUES (?, ?, ?)`;
        await conn.query(query, [name, password, phone]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error registering user' });
    } finally {
        if (conn) conn.release(); // Release connection back to the pool
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

console.log(`Pool connections: active=${pool.activeConnections()}, idle=${pool.idleConnections()}`);


app.use((req, res, next) => {
    console.log(`Pool connections: active=${pool.activeConnections()}, idle=${pool.idleConnections()}`);
    next();
});
