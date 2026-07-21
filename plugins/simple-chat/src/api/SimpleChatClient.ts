import {
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import {
  GetMessagesOptions,
  GetMessagesResult,
  GetUsersResult,
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

  private async getBaseUrl() {
    return this.discoveryApi.getBaseUrl(this.pluginId);
  }

  async postMessage(options: PostMessageOptions): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    const nickname =
      (await this.identityApi.getProfileInfo()).displayName || 'guest';
    const body = JSON.stringify({ ...options, nickname });
    const headers = await getAuthorizationHeader(this.identityApi);
    const response = await this.fetchApi.fetch(baseUrl, {
      headers,
      method: 'POST',
      body,
    });
    if (!response.ok) {
      throw new Error(`Failed to post message: ${response.statusText}`);
    }
  }

  async getMessages(_options: GetMessagesOptions): Promise<GetMessagesResult> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(baseUrl, {
      headers: await getAuthorizationHeader(this.identityApi),
      method: 'GET',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`${data.message}`);
    }
    return data;
  }

  async getUsers(): Promise<GetUsersResult> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/users`, {
      headers: await getAuthorizationHeader(this.identityApi),
      method: 'GET',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ?? response.statusText);
    }
    return data;
  }

  async heartbeat(): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/users/heartbeat`, {
      headers: await getAuthorizationHeader(this.identityApi),
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to send heartbeat: ${response.statusText}`);
    }
  }
}
