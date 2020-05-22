const debug = require('debug')('app:actions:stop');

const stop = async (app, connection, socket, { broadcastId }, respond) => {
    try {
        const youtube = app.getService('youtube');
        const ffmpegManager = app.getService('ffmpegManager');

        const response = await youtube.endBroadcast({ broadcastId });
        const ffmpegProcess = ffmpegManager.getByBroadcastId(broadcastId);

        if (ffmpegProcess) {
            ffmpegProcess.kill();
        }

        return respond({ success: true, result: response });
    } catch (err) {
        debug('Error occurred when stream stopping!', err.response.data.error);

        return respond({ success: false, error: err });
    }
};

module.exports = stop;
