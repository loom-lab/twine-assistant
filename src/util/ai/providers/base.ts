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

    // non-streaming completion
    abstract complete(
        messages: Message[],
        options?: CompletionOptions
    ): Promise<CompletionResponse>;

    /* TODO: implement streamed response
    // streaming completion
    abstract stream(
        messages: Message[],
        options?: CompletionOptions
    ): AsyncIterable<CompletionChunk>;
     */
}