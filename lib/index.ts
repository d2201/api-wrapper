import axios, { AxiosError, AxiosRequestConfig, AxiosBasicCredentials } from 'axios'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

export default class ApiBase {
  private isAuthorized = false

  protected defaultHeaders = {}

  protected authorizationHeaders = {}

  private apiConfig: WrapperConfig

  constructor(config: WrapperConfig) {
    this.apiConfig = config
  }

  private getAxiosConfig(config: Config): AxiosRequestConfig {
    let headers = this.defaultHeaders

    if (config.requireAuthorization) {
      headers = { ...this.authorizationHeaders }
    }

    headers = { ...headers, ...config.headers }

    return {
      headers,
      url: `${config.url}${config.path}` || `${this.apiConfig.baseUrl}${config.path}`,
      method: config.method,
      auth: config.auth,
      data: config.data,
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
      if (!this.isAuthorized && config.requireAuthorization !== false) {
        await this.authorize()
      }

      const response = await axios.request<Response>(this.getAxiosConfig(config))
      return response.data
    } catch (e) {
      const errorCount = config.errorCount || 0

      if (this.apiConfig.maxErrorCount >= errorCount) {
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
 * @param {string} path - Will be appended to the base url specified in `config.ini`
 * @param {string | undefined} url - If specified then it will override used path
 * @param {boolean} requireAuthorization - By default it is set to `true`.
 */
type Config = {
  path: string
  headers?: object
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  data?: any
  requireAuthorization?: boolean
  errorCount?: number
  auth?: AxiosBasicCredentials
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
