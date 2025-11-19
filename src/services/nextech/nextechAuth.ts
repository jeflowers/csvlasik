import type { NextechConnection } from '../../types/Nextech';
import { supabase } from '../../lib/supabase';

const NEXTECH_API_BASE_URL = {
  sandbox: 'https://api-sandbox.nextech.com/api',
  production: 'https://api.nextech.com/api',
};

export class NextechAuth {
  private encryptApiKey(apiKey: string): string {
    return btoa(apiKey);
  }

  private decryptApiKey(encryptedKey: string): string {
    return atob(encryptedKey);
  }

  async saveConnection(
    practiceId: string,
    environment: 'sandbox' | 'production',
    apiKey: string,
    practiceApiId: string,
    locationId?: string,
    defaultProviderId?: string
  ): Promise<NextechConnection> {
    const encryptedApiKey = this.encryptApiKey(apiKey);

    const { data: existingConnection } = await supabase
      .from('nextech_connections')
      .select('*')
      .eq('practice_id', practiceId)
      .maybeSingle();

    if (existingConnection) {
      const { data, error } = await supabase
        .from('nextech_connections')
        .update({
          environment,
          api_key: encryptedApiKey,
          practice_api_id: practiceApiId,
          location_id: locationId,
          default_provider_id: defaultProviderId,
          connection_status: 'connected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConnection.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('nextech_connections')
        .insert({
          practice_id: practiceId,
          environment,
          api_key: encryptedApiKey,
          practice_api_id: practiceApiId,
          location_id: locationId,
          default_provider_id: defaultProviderId,
          connection_status: 'connected',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async getConnection(practiceId: string): Promise<NextechConnection | null> {
    const { data, error } = await supabase
      .from('nextech_connections')
      .select('*')
      .eq('practice_id', practiceId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async testConnection(connection: NextechConnection): Promise<boolean> {
    try {
      const apiKey = this.decryptApiKey(connection.api_key);
      const baseUrl = NEXTECH_API_BASE_URL[connection.environment];

      const response = await fetch(`${baseUrl}/v1/practice`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await this.updateConnectionStatus(connection.id, 'connected');
        return true;
      } else {
        const errorText = await response.text();
        await this.updateConnectionStatus(
          connection.id,
          'error',
          `API test failed: ${errorText}`
        );
        return false;
      }
    } catch (err) {
      await this.updateConnectionStatus(
        connection.id,
        'error',
        err instanceof Error ? err.message : 'Unknown error'
      );
      return false;
    }
  }

  async updateConnectionStatus(
    connectionId: string,
    status: 'connected' | 'disconnected' | 'error',
    errorMessage?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('nextech_connections')
      .update({
        connection_status: status,
        error_message: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (error) throw error;
  }

  async disconnect(practiceId: string): Promise<void> {
    const { error } = await supabase
      .from('nextech_connections')
      .update({
        connection_status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('practice_id', practiceId);

    if (error) throw error;
  }

  async updateDefaults(
    connectionId: string,
    defaults: {
      location_id?: string;
      default_provider_id?: string;
      settings?: Record<string, any>;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('nextech_connections')
      .update({
        ...defaults,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (error) throw error;
  }

  getApiKey(connection: NextechConnection): string {
    return this.decryptApiKey(connection.api_key);
  }

  getBaseUrl(connection: NextechConnection): string {
    return NEXTECH_API_BASE_URL[connection.environment];
  }
}

export const nextechAuth = new NextechAuth();
