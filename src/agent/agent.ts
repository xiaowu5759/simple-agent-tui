import { Message, Tool, AgentConfig, LLMResponse, Logger, AgentConfigWithDefaults } from '../core/types';
import { LLM } from '../llm/base';

export class Agent {
  private llm: LLM;
  private tools: Map<string, Tool>;
  private messages: Message[];
  private config: AgentConfigWithDefaults;
  private logger: Logger;

  constructor(llm: LLM, config: AgentConfig = {}) {
    this.llm = llm;
    this.tools = new Map();
    this.messages = [];
    this.logger = config.logger || console;

    this.config = {
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      maxIterations: config.maxIterations || 10,
      model: config.model || 'gpt-4',
      temperature: config.temperature ?? 0.7,
      enableLogging: true,
      logger: this.logger,
    };

    if (this.config.systemPrompt) {
      this.messages.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }
  }

  addTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    this.logger.debug(`Tool registered: ${tool.name}`);
  }

  async run(userInput: string): Promise<string> {
    this.logger.info(`\n${'='.repeat(50)}`);
    this.logger.info('🚀 Agent starting');
    this.logger.info(`📝 User input: ${userInput}`);
    this.logger.info('='.repeat(50));

    this.messages.push({ role: 'user', content: userInput });

    for (let i = 0; i < this.config.maxIterations; i++) {
      this.logger.info(`\n${'='.repeat(50)}`);
      this.logger.info(`🔄 Iteration ${i + 1}/${this.config.maxIterations}`);
      this.logger.info('='.repeat(50));

      const response = await this.callLLM(i + 1);

      this.messages.push({ role: 'assistant', content: response.content });
      this.logger.info(`💬 Assistant response (${response.content.length} chars)`, {
        toolCallsCount: response.toolCalls?.length || 0,
      });

      if (!response.toolCalls || response.toolCalls.length === 0) {
        this.logger.info('✅ Agent finished successfully\n');
        return response.content;
      }

      for (const toolCall of response.toolCalls) {
        this.logger.info(`========== 🔧 Executing Tool: ${toolCall.name} ==========`);
        this.logger.info(`📥 Tool arguments:`, toolCall.arguments);
        
        const result = await this.executeTool(toolCall.name, toolCall.arguments);
        
        this.logger.info(`========== ✅ Tool ${toolCall.name} Result ==========`);
        this.logger.info(`📤 Result: ${result}`);

        this.messages.push({
          role: 'tool',
          content: result,
          toolCallId: toolCall.id,
        });
      }
    }

    this.logger.warn('⚠️  Max iterations reached without final response');
    return 'Max iterations reached without final response.';
  }

  private async callLLM(iteration: number): Promise<LLMResponse> {
    const toolsArray = this.tools.size > 0 ? Array.from(this.tools.values()) : undefined;
    this.logger.debug(`Sending ${this.messages.length} messages to LLM, iteration ${iteration}`);
    return this.llm.chat(this.messages, toolsArray);
  }

  private async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      const errorMsg = `Error: Tool ${name} not found.`;
      this.logger.error(errorMsg);
      return errorMsg;
    }

    try {
      return await tool.execute(args);
    } catch (error) {
      const errorMsg = `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error(errorMsg);
      return errorMsg;
    }
  }

  clearHistory(): void {
    const systemMessages = this.messages.filter(m => m.role === 'system');
    this.messages = systemMessages;
    this.logger.debug('Conversation history cleared');
  }

  getHistory(): Message[] {
    return [...this.messages];
  }
}
