/**
 * Express Server for Dify Chat System
 * Usage: node server.js
 * Environment variables:
 *   PORT - Server port (default: 8000)
 *   HOST - Server host (default: 0.0.0.0)
 */

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();

    console.log('='.repeat(60));
    console.log('Dify Chat System - Express Server');
    console.log('='.repeat(60));
    console.log(`Server running on:    http://${HOST}:${PORT}`);
    console.log(`Local access:         http://localhost:${PORT}`);
    console.log(`Network access:       http://${localIP}:${PORT}`);
    console.log('='.repeat(60));
    console.log('\nPress Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nServer stopped by user');
    process.exit(0);
});
