const path = require('path');
const { spawn } = require('child_process');

module.exports = function (x, y, width, height) {
    return new Promise(function (resolve, reject) {
        const cmd = spawn(
            path.join(__dirname, 'negative-screenshot'),
            [ x, y, width, height ]
        );

        cmd.stderr.on('data', function (err) {
            reject(err);
        });

        const dataArray = [];
        cmd.stdout.on('data', (data) => {
            dataArray.push(data.toString());
        });
        cmd.on('close', () => {
            const data = dataArray.join('').trim();
            resolve(data);
        });
    });
}
