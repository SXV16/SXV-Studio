const http = require('http');

const data = JSON.stringify({
    title: 'Test Title',
    file_url: 'http://test.url/audio.webm',
    user_id: 1
});

const req = http.request('http://localhost:3000/api/tracks', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('RESPONSE:', res.statusCode, body));
});

req.on('error', e => console.error('ERROR:', e.message));
req.write(data);
req.end();
