const execa = require('execa');
const objc = require('nodobjc');
const path = require('path');
// const { spawn } = require('child_process');

objc.framework('Cocoa');

module.exports = function (x, y, width, height) {
    return new Promise(function (resolve, reject) {
        // TODO: Figure out how we can get windowNumber from the application itself
        const pool = objc.NSAutoreleasePool('alloc')('init');
        const windowId = objc.NSApplication('sharedApplication')('keyWindow')('windowNumber');
        pool('drain');

        const cmd = execa(
            path.join(__dirname, 'negative-screenshot'),
            [ x, y, width, height, windowId ]
        );
        const dataArray = [];

        cmd.catch(function (err) {
            reject(err);
        });

        cmd.stdout.setEncoding('utf8');
        cmd.stdout.on('data', function (data) {
            dataArray.push(data.toString());
        });
        cmd.stdout.on('close', function () {
            const data = dataArray.join('').trim();
            resolve(data);
        })
    });
}
