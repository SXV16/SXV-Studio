const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
    try {
        const formData = new FormData();
        fs.writeFileSync('dummy.webm', 'dummy audio content');
        
        formData.append('audio', fs.createReadStream('dummy.webm'), 'dummy.webm');
        formData.append('title', 'Test Track');
        formData.append('user_id', '1');

        console.log('Sending request...');
        formData.submit('http://localhost:3000/api/tracks', function(err, res) {
            if (err) {
                console.error('Error:', err);
                return;
            }
            console.log('Status:', res.statusCode);
            res.resume();
            res.on('data', chunk => console.log('Response:', chunk.toString()));
            
            if (fs.existsSync('dummy.webm')) fs.unlinkSync('dummy.webm');
        });
    } catch (error) {
        console.error('Catch Error:', error.message);
    }
}

testUpload();
