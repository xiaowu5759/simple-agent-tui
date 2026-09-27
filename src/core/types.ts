export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
  name?: string;
  toolCallId?: string;
}

export interface ToolCall {
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCall[];
}

export interface Logger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
}

export interface AgentConfig {
  systemPrompt?: string;
  maxIterations?: number;
  model?: string;
  temperature?: number;
  logger?: Logger;
}

export interface AgentConfigWithDefaults {
  systemPrompt: string;
  maxIterations: number;
  model: string;
  temperature: number;
  enableLogging: boolean;
  logger: Logger;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(params: Record<string, unknown>): Promise<string>;
}
