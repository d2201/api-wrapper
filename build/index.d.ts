import { AxiosBasicCredentials } from 'axios';
export default class ApiBase {
    protected isAuthorized: boolean;
    protected defaultHeaders: {};
    protected authorizationHeaders: {};
    private requestsCount;
    private nextRefreshAt;
    private apiConfig;
    constructor(config: WrapperConfig);
    private getAxiosConfig;
    private checkRateLimit;
    /**
     * It is recommended to implement your own authorize method.
     */
    protected authorize(): Promise<void>;
    protected request<Response>(config: Config): Promise<Response>;
}
/**
 * @param {number} requestsRateLimit - Rate limit per minute.
 * @param {string} path - Will be appended to the base url specified in `config.ini`
 * @param {string | undefined} url - If specified then it will override `baseUrl`
 * @param {boolean} requireAuthorization - By default it is set to `true`.
 */
declare type Config = {
    path: string;
    headers?: object;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url?: string;
    data?: any;
    requireAuthorization?: boolean;
    errorCount?: number;
    auth?: AxiosBasicCredentials;
    queryParams?: object;
};
declare type WrapperConfig = {
    requestsRateLimit: number;
    baseUrl: string;
    maxErrorCount: number;
    sleepDurationOnError: {
        network: number;
        rateLimit: number;
        serviceUnavailable: number;
    };
    repeatOnUnknownError: boolean;
};
export {};
