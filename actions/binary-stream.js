const debug = require('debug')('app:actions:stop');

const binaryStream = (app, connection, socket, { broadcastId, liveStreamId, rtmpUrl, data }) => {
    const ffmpegManager = app.getService('ffmpegManager');
    const ffmpegProcess = ffmpegManager.create({ broadcastId, liveStreamId, rtmpUrl });

    try {
        ffmpegProcess.send(data);
    } catch (err) {
        debug('Error occurred when stream stopping!', err);
    }
};

module.exports = binaryStream;
