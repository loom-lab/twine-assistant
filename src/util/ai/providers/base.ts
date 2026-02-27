import {
    Message,
    ProviderConfig,
    CompletionOptions,
    CompletionResponse,
} from "../types";

export abstract class Provider {
    protected config: ProviderConfig;

    constructor(config: ProviderConfig) {
        this.config = config;
    }

    protected abstract getDefaultModel(): string;
    protected getModel(): string {
        return this.config.model ?? this.getDefaultModel();
    }

    /**
     * Send messages to the LLM and get a completion.
     * If tools are provided in options, the LLM may return tool calls
     */
    abstract complete(
        messages: Message[],
        options?: CompletionOptions
    ): Promise<CompletionResponse>;
}