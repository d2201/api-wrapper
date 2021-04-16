import axios, { AxiosRequestConfig } from 'axios'

export default class ApiBase {
  private url: string

  constructor(url: string) {
    this.url = url
    // todo...
  }

  getAxiosConfig(config: Config): AxiosRequestConfig {
    return {
      headers: config.headers,
      url: config.url || `${this.url}${config.path}`,
      method: config.method,
    }
  }

  protected async request<Response>(config: Config): Promise<Response> {
    const response = await axios.request<Response>(this.getAxiosConfig(config))

    return response.data
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
  requireAuthorization?: boolean
}
