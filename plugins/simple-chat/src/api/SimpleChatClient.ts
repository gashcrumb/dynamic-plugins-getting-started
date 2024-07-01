import {
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import {
  GetMessagesOptions,
  GetMessagesResult,
  PostMessageOptions,
  SimpleChatApi,
} from './types';

export interface SimpleChatClientOptions {
  pluginId: string;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  identityApi: IdentityApi;
}

async function getAuthorizationHeader(identityApi: IdentityApi) {
  const { token } = await identityApi.getCredentials();
  const baseHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  return token
    ? { Authorization: `Bearer ${token}`, ...baseHeaders }
    : baseHeaders;
}

export class SimpleChatClient implements SimpleChatApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly identityApi: IdentityApi;
  private readonly pluginId: string;

  constructor(options: SimpleChatClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.identityApi = options.identityApi;
    this.pluginId = options.pluginId;
  }

  async postMessage(options: PostMessageOptions): Promise<void> {
    const { discoveryApi, fetchApi, identityApi, pluginId } = this;
    const baseUrl = await discoveryApi.getBaseUrl(pluginId);
    const nickname =
      (await identityApi.getProfileInfo()).displayName || 'guest';
    const body = JSON.stringify({ ...options, nickname });
    const headers = await getAuthorizationHeader(identityApi);
    const response = await fetchApi.fetch(baseUrl, {
      headers,
      method: 'POST',
      body,
    });
    const data = await response.body;
    if (!response.ok) {
      throw new Error(`${data}`);
    }
    return;
  }
  
  async getMessages(_options: GetMessagesOptions): Promise<GetMessagesResult> {
    const { discoveryApi, fetchApi, identityApi, pluginId } = this;
    const baseUrl = await discoveryApi.getBaseUrl(pluginId);
    const response = await fetchApi.fetch(baseUrl, {
      headers: await getAuthorizationHeader(identityApi),
      method: 'GET',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`${data.message}`);
    }
    return data;
  }
}
