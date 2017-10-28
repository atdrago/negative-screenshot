const execa = require('execa');
const path = require('path');
const uuid = require('uuid/v4');

const { Rect } = require('./models');

const BIN_PATH = path.join(__dirname, 'negative-screenshot')

/**
 * Create JSON serializable options to pass to binary
 * @return {Object} An object that can be serialized with JSON.stringify()
 */
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
 * @return {Promise}
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

        const cmd = execa(
            BIN_PATH,
            [ JSON.stringify(createSerializableOptions(options, uniqueWindowTitle)) ]
        );
        const dataArray = [];

        cmd.stdout.setEncoding('utf8');

        // Handle errors
        cmd.catch(err => {
            if (isUniqueWindowTitleNeeded) {
                belowWindow.setTitle(originalWindowTitle);
            }

            reject(err);
        });

        // Load all the image data into an array
        cmd.stdout.on('data', data => dataArray.push(data.toString()));

        // Resolve with all image data
        cmd.stdout.on('close', () => {
            if (isUniqueWindowTitleNeeded) {
                belowWindow.setTitle(originalWindowTitle);
            }

            resolve(dataArray.join('').trim());
        });
    });
}
