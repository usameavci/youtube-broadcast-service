const start = async (app, connection, socket, { broadcastId, liveStreamId, rtmpUrl }, respond) => {
    const ffmpegManager = app.getService('ffmpegManager');
    ffmpegManager.create({ broadcastId, liveStreamId, rtmpUrl });

    return respond && respond({ success: true });
};

module.exports = start;
