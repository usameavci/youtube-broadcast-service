module.exports = (router) => {
    router.use(async (req, res, next) => {
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
            return res.status(401).end('<html><body><h1>Need some creds son!</h1></body></html>');
        }

        const base64Credentials =  req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        if (!(username === process.env.BASIC_AUTH_USERNAME && password === process.env.BASIC_AUTH_PASSWORD)) {
            return res.status(401).json({ message: 'Invalid Authentication Credentials' });
        }

        return next();
    });

    return router;
};
