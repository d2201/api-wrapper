import axios, { AxiosError, AxiosRequestConfig, AxiosBasicCredentials } from 'axios'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

const ONE_SECOND = 1000

export default class ApiBase {
  protected isAuthorized = false

  protected defaultHeaders = {}

  protected authorizationHeaders = {}

  private requestsCount = 0

  private nextRefreshAt: Date = new Date()

  private apiConfig: WrapperConfig

  constructor(config: WrapperConfig) {
    this.apiConfig = config
  }

  private getAxiosConfig(config: Config): AxiosRequestConfig {
    let headers = this.defaultHeaders

    if (config.requireAuthorization || config.requireAuthorization === undefined) {
      headers = { ...headers, ...this.authorizationHeaders }
    }

    headers = { ...headers, ...config.headers }

    return {
      headers,
      url: config.url ? `${config.url}${config.path}` : `${this.apiConfig.baseUrl}${config.path}`,
      method: config.method,
      auth: config.auth,
      data: config.data,
      params: config.queryParams,
    }
  }

  private async checkRateLimit() {
    const now = new Date()

    if (now > this.nextRefreshAt) {
      this.requestsCount = 0
      this.nextRefreshAt = new Date(+now + 60 * ONE_SECOND) // refresh in next minute
    }

    if (++this.requestsCount >= this.apiConfig.requestsRateLimit) {
      await sleep(+this.nextRefreshAt - +now) // sleep until next block, next request will reset the counter.
    }
  }

  /**
   * It is recommended to implement your own authorize method.
   */
  protected async authorize() {
    this.isAuthorized = true
  }

  protected async request<Response>(config: Config): Promise<Response> {
    try {
      await this.checkRateLimit()

      if (!this.isAuthorized && config.requireAuthorization !== false) {
        await this.authorize()
      }

      const response = await axios.request<Response>(this.getAxiosConfig(config))
      return response.data
    } catch (e) {
      const errorCount = config.errorCount || 0

      if (errorCount >= this.apiConfig.maxErrorCount) {
        throw e
      }

      const newConfig = {
        ...config,
        errorCount: errorCount + 1,
      }

      const error: AxiosError = e

      if (!error.isAxiosError || !error.response) {
        await sleep(this.apiConfig.sleepDurationOnError.network)

        return this.request(newConfig)
      }

      if (error.response.status === 429) {
        await sleep(this.apiConfig.sleepDurationOnError.rateLimit)

        return this.request(newConfig)
      }

      if (error.response.status === 503) {
        await sleep(this.apiConfig.sleepDurationOnError.serviceUnavailable)

        return this.request(newConfig)
      }

      if (this.apiConfig.repeatOnUnknownError) {
        return this.request(newConfig)
      }
      throw e
    }
  }
}

/**
 * @param {number} requestsRateLimit - Rate limit per minute.
 * @param {string} path - Will be appended to the base url specified in `config.ini`
 * @param {string | undefined} url - If specified then it will override `baseUrl`
 * @param {boolean} requireAuthorization - By default it is set to `true`.
 */
type Config = {
  path: string
  headers?: object
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url?: string
  data?: any
  requireAuthorization?: boolean
  errorCount?: number
  auth?: AxiosBasicCredentials
  queryParams?: object
}

type WrapperConfig = {
  requestsRateLimit: number
  baseUrl: string

  // error settings
  maxErrorCount: number
  sleepDurationOnError: {
    network: number
    rateLimit: number
    serviceUnavailable: number
  }
  repeatOnUnknownError: boolean
}
