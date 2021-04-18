"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const util_1 = require("util");
const sleep = util_1.promisify(setTimeout);
const ONE_SECOND = 1000;
class ApiBase {
    constructor(config) {
        this.isAuthorized = false;
        this.defaultHeaders = {};
        this.authorizationHeaders = {};
        this.requestsCount = 0;
        this.nextRefreshAt = new Date();
        this.apiConfig = config;
    }
    getAxiosConfig(config) {
        let headers = this.defaultHeaders;
        if (config.requireAuthorization || config.requireAuthorization === undefined) {
            headers = { ...this.authorizationHeaders };
        }
        headers = { ...headers, ...config.headers };
        return {
            headers,
            url: config.url ? `${config.url}${config.path}` : `${this.apiConfig.baseUrl}${config.path}`,
            method: config.method,
            auth: config.auth,
            data: config.data,
            params: config.queryParams,
        };
    }
    async checkRateLimit() {
        const now = new Date();
        if (now > this.nextRefreshAt) {
            this.requestsCount = 0;
            this.nextRefreshAt = new Date(+now + 60 * ONE_SECOND); // refresh in next minute
        }
        if (++this.requestsCount >= this.apiConfig.requestsRateLimit) {
            await sleep(+this.nextRefreshAt - +now); // sleep until next block, next request will reset the counter.
        }
    }
    /**
     * It is recommended to implement your own authorize method.
     */
    async authorize() {
        this.isAuthorized = true;
    }
    async request(config) {
        try {
            await this.checkRateLimit();
            if (!this.isAuthorized && config.requireAuthorization !== false) {
                await this.authorize();
            }
            const response = await axios_1.default.request(this.getAxiosConfig(config));
            return response.data;
        }
        catch (e) {
            const errorCount = config.errorCount || 0;
            if (this.apiConfig.maxErrorCount >= errorCount) {
                throw e;
            }
            const newConfig = {
                ...config,
                errorCount: errorCount + 1,
            };
            const error = e;
            if (!error.isAxiosError || !error.response) {
                await sleep(this.apiConfig.sleepDurationOnError.network);
                return this.request(newConfig);
            }
            if (error.response.status === 429) {
                await sleep(this.apiConfig.sleepDurationOnError.rateLimit);
                return this.request(newConfig);
            }
            if (error.response.status === 503) {
                await sleep(this.apiConfig.sleepDurationOnError.serviceUnavailable);
                return this.request(newConfig);
            }
            if (this.apiConfig.repeatOnUnknownError) {
                return this.request(newConfig);
            }
            throw e;
        }
    }
}
exports.default = ApiBase;
//# sourceMappingURL=index.js.map