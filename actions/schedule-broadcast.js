const scheduleBroadcast = async (app, connection, socket, { title, scheduledStartTime }, respond) => {
    try {
        const youtube = app.getService('youtube');
        const response = await youtube.startBroadcast({ title, scheduledStartTime });
        return respond({ success: true, result: response });
    } catch (err) {
        return respond({ success: false, error: err });
    }
};

module.exports = scheduleBroadcast;
