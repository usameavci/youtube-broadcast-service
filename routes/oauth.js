module.exports = (router, app) => {
    const youtube = app.getService('youtube');

    router.get('/auth', async (req, res) => {
        try {
            const response = await youtube.generateAuthUrl();

            return res.redirect(302, response.authUrl);
        } catch (err) {
            return res.json({ success: false, error: err.response.data });
        }
    });

    router.get('/oauth2callback', async (req, res) => {
        try {
            const tokens = await youtube.getToken(req.query.code);

            return res.json(tokens);
        } catch (err) {
            return res.json({ success: false, error: err.response.data });
        }

    });

    return router;
};
