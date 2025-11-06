import type {
  RingCentralOAuthConfig,
  RingCentralTokenResponse,
  RingCentralConnection,
} from '../../types/RingCentral';
import { supabase } from '../../lib/supabase';

const RC_AUTH_BASE_URL = 'https://platform.ringcentral.com';

export class RingCentralAuthService {
  private config: RingCentralOAuthConfig;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_RC_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_RC_CLIENT_SECRET || '',
      redirectUri: import.meta.env.VITE_RC_REDIRECT_URI || `${window.location.origin}/admin/settings/ringcentral/callback`,
      server: RC_AUTH_BASE_URL,
    };
  }

  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: state || this.generateState(),
      prompt: 'login consent',
    });

    return `${this.config.server}/restapi/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<RingCentralTokenResponse> {
    const response = await fetch(`${this.config.server}/restapi/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json();
  }

  async refreshAccessToken(refreshToken: string): Promise<RingCentralTokenResponse> {
    const response = await fetch(`${this.config.server}/restapi/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  async revokeToken(token: string): Promise<void> {
    const response = await fetch(`${this.config.server}/restapi/oauth/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
      },
      body: new URLSearchParams({
        token,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to revoke token: ${error}`);
    }
  }

  async saveConnection(
    practiceId: string,
    tokenResponse: RingCentralTokenResponse
  ): Promise<RingCentralConnection> {
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    const { data, error } = await supabase
      .from('ringcentral_connections')
      .upsert({
        practice_id: practiceId,
        rc_account_id: tokenResponse.owner_id,
        rc_access_token: this.encryptToken(tokenResponse.access_token),
        rc_refresh_token: this.encryptToken(tokenResponse.refresh_token),
        rc_token_expires_at: expiresAt.toISOString(),
        status: 'connected',
        last_sync_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConnection(practiceId: string): Promise<RingCentralConnection | null> {
    const { data, error } = await supabase
      .from('ringcentral_connections')
      .select('*')
      .eq('practice_id', practiceId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateConnectionStatus(
    connectionId: string,
    status: RingCentralConnection['status'],
    errorMessage?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('ringcentral_connections')
      .update({
        status,
        error_message: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (error) throw error;
  }

  async disconnect(practiceId: string): Promise<void> {
    const connection = await this.getConnection(practiceId);
    if (!connection) return;

    try {
      const decryptedToken = this.decryptToken(connection.rc_access_token);
      await this.revokeToken(decryptedToken);
    } catch (err) {
      console.error('Failed to revoke token:', err);
    }

    const { error } = await supabase
      .from('ringcentral_connections')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('practice_id', practiceId);

    if (error) throw error;
  }

  async refreshConnectionToken(connection: RingCentralConnection): Promise<RingCentralConnection> {
    const decryptedRefreshToken = this.decryptToken(connection.rc_refresh_token);
    const tokenResponse = await this.refreshAccessToken(decryptedRefreshToken);

    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    const { data, error } = await supabase
      .from('ringcentral_connections')
      .update({
        rc_access_token: this.encryptToken(tokenResponse.access_token),
        rc_refresh_token: this.encryptToken(tokenResponse.refresh_token),
        rc_token_expires_at: expiresAt.toISOString(),
        status: 'connected',
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', connection.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  isTokenExpired(connection: RingCentralConnection): boolean {
    const expiresAt = new Date(connection.rc_token_expires_at);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return expiresAt <= fiveMinutesFromNow;
  }

  private encryptToken(token: string): string {
    return btoa(token);
  }

  private decryptToken(encryptedToken: string): string {
    return atob(encryptedToken);
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

export const ringCentralAuth = new RingCentralAuthService();
