const objc = require('nodobjc');
const path = require('path');
const { spawn } = require('child_process');

objc.framework('Cocoa');

module.exports = function (x, y, width, height) {
    return new Promise(function (resolve, reject) {
        // TODO: Figure out how we can get windowNumber from the application itself
        const pool = objc.NSAutoreleasePool('alloc')('init');
        const windowId = objc.NSApplication('sharedApplication')('keyWindow')('windowNumber');
        pool('drain');

        const cmd = spawn(
            path.join(__dirname, 'negative-screenshot'),
            [ x, y, width, height, windowId ]
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
