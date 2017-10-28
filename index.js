const execa = require('execa');
const path = require('path');
const uuid = require('uuid/v4');
const childProcess = require('child_process');
const BIN = path.join(__dirname, 'negative-screenshot');

const { Rect } = require('./models');

function createSerializableOptions(options, uniqueWindowTitle) {
    const serializableOptions = {};

    if (options.belowWindowWithId) {
        serializableOptions.belowWindowWithId = options.belowWindowWithId
    } else if (uniqueWindowTitle) {
        serializableOptions.uniqueWindowTitle = uniqueWindowTitle;
    }

    serializableOptions.bounds = new Rect(options.bounds).toSerializable();

    return serializableOptions;
}

/**
 * Take a screenshot
 * @param  {Object}         options
 * @param  {Rect}           options.bounds
 * @param  {BrowserWindow}  options.belowWindow
 * @param  {Number}         options.belowWindowWithId
 * @return {Promise}        [description]
 */
module.exports = function (options = {}) {
    return new Promise(function (resolve, reject) {
        const belowWindow = options.belowWindow;
        const originalWindowTitle = belowWindow && belowWindow.getTitle();
        const isUniqueWindowTitleNeeded = !!originalWindowTitle;
        const uniqueWindowTitle = isUniqueWindowTitleNeeded && uuid();

        if (isUniqueWindowTitleNeeded) {
            belowWindow.setTitle(uniqueWindowTitle);
        }

        const cmd = childProcess.spawn(
            BIN,
            [ JSON.stringify(createSerializableOptions(options, uniqueWindowTitle)) ]
        );
        const dataArray = [];

        // cmd.stdout.setEncoding('utf8');

        // Handle errors
        cmd.stderr.on('data', err => {
            if (isUniqueWindowTitleNeeded) {
                belowWindow.setTitle(originalWindowTitle);
            }

            reject(err);
        });

        // Load all the image data into an array
        cmd.stdout.on('data', data => dataArray.push(data.toString()));

        // Resolve with all image data
        cmd.on('close', () => {
            if (isUniqueWindowTitleNeeded) {
                belowWindow.setTitle(originalWindowTitle);
            }

            resolve(dataArray.join('').trim());
        });
    });
}
