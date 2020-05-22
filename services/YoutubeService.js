const _ = require('lodash');
const { google } = require('googleapis');
const debugError = require('debug')('app:YoutubeService:error');

class YoutubeService {
    constructor({ oAuthOptions, credentials }) {
        if (!oAuthOptions || !credentials) {
            return debugError('Please set youtube oAuth options and credentials!');
        }

        const oAuthClient = new google.auth.OAuth2(oAuthOptions.clientId, oAuthOptions.clientSecret, oAuthOptions.redirectUri);
        oAuthClient.setCredentials(credentials);
        this._oAuthClient = oAuthClient;

        this._api = google.youtube({ version: 'v3', auth: oAuthClient });
    }

    async generateAuthUrl() {
        const options = {
            prompt: 'consent',
            access_type: 'offline',
            include_granted_scopes: true,
            scope: [ process.env.YOUTUBE_SCOPE ],
        };
        const authUrl = this._oAuthClient.generateAuthUrl(options);

        return { authUrl };
    }

    async getToken(code) {
        const { tokens } = await this._oAuthClient.getToken(code);

        return tokens;
    }

    async createBroadcast({ title, scheduledStartTime, privacyStatus = 'unlisted', part = 'id, snippet, contentDetails, status' }) {
        const { data } = await this._api.liveBroadcasts.insert({
            part,
            resource: {
                snippet: { title, scheduledStartTime },
                contentDetails: {
                    enableAutoStart: true,
                    enableLowLatency: true,
                    latencyPreference: 'ultraLow'
                },
                status: { privacyStatus }
            }
        });

        return data;
    }

    async transitionBroadcast({ broadcastId, broadcastStatus, part = 'id, snippet, contentDetails, status' }) {
        const { data } = await this._api.liveBroadcasts.transition({ part, id: broadcastId, broadcastStatus });

        return data;
    }

    async createLiveStream({ title, format = '720p', ingestionType = 'rtmp', part = 'id, snippet, cdn' }) {
        const body = {
            part,
            resource: {
                snippet: { title },
                cdn: { format, ingestionType },
            },
        };
        const { data } = await this._api.liveStreams.insert(body);

        return data;
    }

    async bindLiveStreamToBroadcast({ broadcastId, liveStreamId, part = 'id, snippet, contentDetails, status' }) {
        const { data } = await this._api.liveBroadcasts.bind({ part, id: broadcastId, streamId: liveStreamId });

        return data;
    }

    async startBroadcast({ title, scheduledStartTime, privacyStatus = 'unlisted', format = '720p', ingestionType = 'rtmp' }) {
        const broadcastData = await this.createBroadcast({ title, scheduledStartTime, privacyStatus });
        const liveStreamData = await this.createLiveStream({ title, format, ingestionType });
        await this.bindLiveStreamToBroadcast({ broadcastId: broadcastData.id, liveStreamId: liveStreamData.id });

        return {
            title: broadcastData.snippet.title,
            rtmpUrl: `${liveStreamData.cdn.ingestionInfo.ingestionAddress}/${liveStreamData.cdn.ingestionInfo.streamName}`,
            watchUrl: `https://youtu.be/${broadcastData.id}`,
            broadcast: broadcastData,
            liveStream: liveStreamData,
        };
    }

    async endBroadcast({ broadcastId }) {
        return await this.transitionBroadcast({ broadcastId, broadcastStatus: 'complete' });
    }
}

module.exports = YoutubeService;
