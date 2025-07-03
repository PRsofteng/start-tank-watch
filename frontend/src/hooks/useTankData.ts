import { useState, useEffect, useCallback } from 'react';
import { TankResponse } from '../types/tank';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const WS_URL = 'ws://localhost:8000/api/v1/tanks/stream';

export const useTankData = () => {
  const [data, setData] = useState<Record<number, number>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Função para gerar valores aleatórios para simulação
  const generateRandomData = useCallback(() => {
    const randomData: Record<number, number> = {};
    [7, 8, 9, 10, 11, 12, 13, 14].forEach(tankId => {
      // Gera valores entre 10% e 95% com variação mais realista
      const baseValue = data[tankId] || Math.random() * 85 + 10;
      const variation = (Math.random() - 0.5) * 10; // Variação de ±5%
      const newValue = Math.max(5, Math.min(95, baseValue + variation));
      randomData[tankId] = Math.round(newValue * 10) / 10; // Arredonda para 1 casa decimal
    });
    return randomData;
  }, [data]);

  const fetchTankData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tanks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tankData: TankResponse = await response.json();
      
      // Mapear T7 → 7, T8 → 8, etc.
      const mappedData: Record<number, number> = {};
      Object.entries(tankData).forEach(([key, value]) => {
        const tankNumber = parseInt(key.replace('T', ''));
        if (tankNumber >= 7 && tankNumber <= 14) {
          mappedData[tankNumber] = value.pct;
        }
      });
      
      setData(mappedData);
      setError(null);
      setIsConnected(true);
      setIsSimulating(false);
    } catch (err) {
      console.error('Error fetching tank data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
      
      // Iniciar simulação se não conseguir conectar
      if (!isSimulating) {
        setIsSimulating(true);
        setData(generateRandomData());
      }
    }
  }, [generateRandomData, isSimulating]);

  useEffect(() => {
    // Carregar dados iniciais
    fetchTankData();

    // Tentar conectar WebSocket
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let simulationInterval: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
          setIsSimulating(false);
          
          // Parar simulação se WebSocket conectar
          if (simulationInterval) {
            clearInterval(simulationInterval);
          }
        };

        ws.onmessage = (event) => {
          try {
            const tankData: TankResponse = JSON.parse(event.data);
            const mappedData: Record<number, number> = {};
            
            Object.entries(tankData).forEach(([key, value]) => {
              const tankNumber = parseInt(key.replace('T', ''));
              if (tankNumber >= 7 && tankNumber <= 14) {
                mappedData[tankNumber] = value.pct;
              }
            });
            
            setData(mappedData);
            setIsSimulating(false);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Iniciar simulação quando desconectar
          if (!isSimulating) {
            setIsSimulating(true);
            simulationInterval = setInterval(() => {
              setData(prevData => {
                const newData: Record<number, number> = {};
                [7, 8, 9, 10, 11, 12, 13, 14].forEach(tankId => {
                  const currentValue = prevData[tankId] || Math.random() * 85 + 10;
                  const variation = (Math.random() - 0.5) * 8; // Variação de ±4%
                  const newValue = Math.max(5, Math.min(95, currentValue + variation));
                  newData[tankId] = Math.round(newValue * 10) / 10;
                });
                return newData;
              });
            }, 3000); // Atualiza a cada 3 segundos
          }
          
          // Tentar reconectar após 5 segundos
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (err) {
        console.error('Error creating WebSocket:', err);
        setIsConnected(false);
        
        // Iniciar simulação se WebSocket falhar completamente
        if (!isSimulating) {
          setIsSimulating(true);
          simulationInterval = setInterval(() => {
            setData(prevData => {
              const newData: Record<number, number> = {};
              [7, 8, 9, 10, 11, 12, 13, 14].forEach(tankId => {
                const currentValue = prevData[tankId] || Math.random() * 85 + 10;
                const variation = (Math.random() - 0.5) * 8;
                const newValue = Math.max(5, Math.min(95, currentValue + variation));
                newData[tankId] = Math.round(newValue * 10) / 10;
              });
              return newData;
            });
          }, 3000);
        }
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [fetchTankData]);

  return { data, isConnected, error, refetch: fetchTankData, isSimulating };
};