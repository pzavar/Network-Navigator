const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    // Default to index.html for root path
    if (filePath === './') {
        filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found, serve 404
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 - Not Found</title></head>
                        <body>
                            <h1>404 - File Not Found</h1>
                            <p>The requested file was not found.</p>
                            <a href="/">← Back to Network Navigator</a>
                        </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('🌐 Network Navigator Server Started!');
    console.log('📁 Serving files from:', process.cwd());
    console.log('🔗 Open your browser and go to: http://localhost:' + PORT);
    console.log('⏹️  Press Ctrl+C to stop the server');
    console.log('');
    console.log('🚀 Your app is ready to use!');
});
