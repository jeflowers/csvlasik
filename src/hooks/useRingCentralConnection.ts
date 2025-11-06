import { useState, useEffect } from 'react';
import type { RingCentralConnection } from '../types/RingCentral';
import { ringCentralAuth } from '../services/ringcentral/ringCentralAuth';

export function useRingCentralConnection(practiceId: string) {
  const [connection, setConnection] = useState<RingCentralConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadConnection();
  }, [practiceId]);

  const loadConnection = async () => {
    try {
      setLoading(true);
      const data = await ringCentralAuth.getConnection(practiceId);
      setConnection(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load connection'));
    } finally {
      setLoading(false);
    }
  };

  const connect = () => {
    const authUrl = ringCentralAuth.getAuthorizationUrl(practiceId);
    window.location.href = authUrl;
  };

  const disconnect = async () => {
    try {
      await ringCentralAuth.disconnect(practiceId);
      setConnection(null);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to disconnect');
    }
  };

  const isConnected = connection?.status === 'connected';
  const isExpired = connection && ringCentralAuth.isTokenExpired(connection);

  return {
    connection,
    loading,
    error,
    isConnected,
    isExpired,
    connect,
    disconnect,
    reload: loadConnection,
  };
}
