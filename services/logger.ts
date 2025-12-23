import { TrafficLog, LogStatus } from '../types';

export const createLog = (
  layer: 'UI' | 'DATABASE',
  status: LogStatus,
  message: string,
  payload?: any
): TrafficLog => {
  return {
    traceId: crypto.randomUUID().slice(0, 8),
    timestamp: Date.now(),
    layer,
    status,
    message,
    payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined
  };
};
