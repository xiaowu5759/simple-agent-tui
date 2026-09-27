import { Message, Tool, LLMResponse, Logger } from '../core/types';
import { OpenAILLM } from './openai';
import { AnthropicLLM } from './anthropic';

export type Provider = 'openai' | 'anthropic';

export interface LLMConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  provider?: Provider;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  logger?: Logger;
}

export interface LLM {
  chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;
}

export function createLLM(config: LLMConfig): LLM {
  const provider = config.provider || 'openai';
  
  switch (provider) {
    case 'openai':
      return new OpenAILLM({ ...config, provider: 'openai' });
    case 'anthropic':
      return new AnthropicLLM({ ...config, provider: 'anthropic' });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
