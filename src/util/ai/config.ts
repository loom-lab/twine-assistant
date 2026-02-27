/**
 * AI configuration utilities for API key management and provider creation.
 */

import {GeminiProvider} from './providers/gemini';
import type {Provider} from './providers/base';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export interface APIKeyValidation {
	valid: boolean;
	error?: string;
}

export function getAPIKey(): string | null {
	return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function validateAPIKey(): APIKeyValidation {
	const apiKey = getAPIKey();
	if (!apiKey) {
		return {
			valid: false,
			error: 'No API key configured. Set gemini_api_key in localStorage.'
		};
	}
	return {valid: true};
}

export function createProvider(): Provider {
	const apiKey = getAPIKey();
	if (!apiKey) {
		throw new Error('No API key configured. Set gemini_api_key in localStorage.');
	}
	return new GeminiProvider({
		type: 'gemini',
		apiKey
	});
}
