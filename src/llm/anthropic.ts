import Anthropic from '@anthropic-ai/sdk';
import { Message, Tool, LLMResponse, Logger } from '../core/types';
import { LLM, LLMConfig } from './base';

export class AnthropicLLM implements LLM {
  private config: Required<LLMConfig>;
  private client: Anthropic;
  private logger: Logger | undefined;

  constructor(config: LLMConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.anthapi.com',
      model: config.model,
      provider: config.provider || 'anthropic',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
      timeout: config.timeout ?? 60000,
      logger: config.logger,
    } as Required<LLMConfig>;

    this.logger = config.logger;

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    });
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
    const anthropicMessages = this.convertMessages(messages);
    const systemMessage = this.extractSystemMessage(messages);

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        messages: anthropicMessages,
        system: systemMessage,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        tools: this.convertTools(tools),
      });

      return this.parseResponse(response);
    } catch (error) {
      if (this.logger) {
        this.logger.error('Anthropic LLM API error', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  }

  private convertMessages(messages: Message[]): Anthropic.MessageParam[] {
    return messages
      .filter(m => m.role !== 'system')
      .map(msg => {
        if (msg.role === 'tool') {
          return {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: msg.toolCallId || '',
                content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
              },
            ],
          } as Anthropic.MessageParam;
        }

        if (msg.role === 'assistant') {
          return {
            role: 'assistant',
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
          } as Anthropic.MessageParam;
        }

        return {
          role: 'user',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        } as Anthropic.MessageParam;
      });
  }

  private extractSystemMessage(messages: Message[]): string | undefined {
    const systemMsg = messages.find(m => m.role === 'system');
    if (!systemMsg) {
      return undefined;
    }
    return typeof systemMsg.content === 'string' ? systemMsg.content : '';
  }

  private convertTools(tools?: Tool[]): any[] | undefined {
    if (!tools || tools.length === 0) {
      return undefined;
    }

    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters as Record<string, unknown>,
    }));
  }

  private parseResponse(response: Anthropic.Message): LLMResponse {
    if (this.logger) {
      this.logger.info('========== LLM Response ==========', {
        responseId: (response as any).id,
        model: (response as any).model,
        stopReason: (response as any).stop_reason,
        usage: (response as any).usage,
      });

      const content = (response as any).content?.[0];
      this.logger.info('Assistant message:', {
        role: (response as any).role,
        content: content?.text || '(empty)',
        contentLength: content?.text?.length || 0,
      });

      if (content?.type === 'tool_use') {
        this.logger.info('Tool calls detected:', {
          toolCalls: [{
            id: content.id,
            name: content.name,
            input: content.input,
          }],
        });
      }
    }

    const contentData = (response as any).content?.find((c: any) => c.type === 'text');
    const content = contentData?.text || '';

    const toolCallData = (response as any).content?.find((c: any) => c.type === 'tool_use');
    const toolCalls = toolCallData ? [{
      id: toolCallData.id,
      name: toolCallData.name,
      arguments: toolCallData.input as Record<string, unknown>,
    }] : [];

    return {
      content,
      toolCalls,
    };
  }
}
