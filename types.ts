// Data Models
export enum DocCategory {
  SETUP = 'SETUP',
  CORE = 'CORE',
  MULTIMODAL = 'MULTIMODAL',
  ADVANCED = 'ADVANCED',
  SCHEMAS = 'SCHEMAS'
}

export interface LaunchConfig {
  entry_point: string;
  required_params: string[];
  optional_params: string[];
  execution_pattern: 'SYNC' | 'ASYNC' | 'STREAM' | 'LONG_POLLING' | 'SETUP';
  output_type: string;
}

export interface ReferenceDoc {
  id: string;
  category: DocCategory;
  title: string;
  description: string; // Short summary
  modelTarget: string; // Relevant model or "ALL"
  explanation: string; // Detailed context
  codeSnippet: string; // The reference code
  launch: LaunchConfig; // Execution manifest
}

// Fusebox Traffic Logger Types
export enum LogStatus {
  ACCESS = 'ACCESS', // Replaces PENDING/SUCCESS flow
  COPY = 'COPY',
  INFO = 'INFO'
}

export interface TrafficLog {
  traceId: string;
  timestamp: number;
  layer: 'UI' | 'DATABASE';
  status: LogStatus;
  message: string;
  payload?: any;
}