/**
 * Draft full passage from blanks
 */

import {runAssistant} from '../../../util/ai/assistant';
import {PROMPTS} from '../../../util/ai/prompts';
import {getIncomingLinks} from '../../../util/mcp-server/tools/story-tools';
import type {Message} from '../../../util/ai/types';
import type {ControlContext, ControlResult} from './types';
import {getPassage, createMCPContext, updatePassageText} from './helpers';

export async function executeDraft(context: ControlContext): Promise<ControlResult> {
	if (!context.passageId) {
		return {success: false, error: 'No passage active'};
	}

	const passage = getPassage(context);
	if (!passage) {
		return {success: false, error: 'Passage not found'};
	}

	// Get backlinks
	const mcpContext = createMCPContext(context);
	const incomingResult = await getIncomingLinks(mcpContext, passage.name);
	const precedingPassages = incomingResult.success
		? incomingResult.data?.passages ?? []
		: [];

	let userPrompt = `Draft a complete passage for a blank passage named "${passage.name}".`;

	if (precedingPassages.length > 0) {
		userPrompt += `\n\n--- PRECEDING PASSAGES (that link to this passage) ---\n`;
		for (const p of precedingPassages) {
			userPrompt += `\n[${p.name}]\n${p.text}\n`;
		}
		userPrompt += `\n--- END PRECEDING PASSAGES ---\n\nContinue the story from the preceding context. The reader has just clicked a link to reach "${passage.name}".`;
	} else {
		userPrompt += ` The passage name may hint at what the content should be about, or you can interpret it creatively. Generate engaging interactive fiction content with choices/links.`;
	}

	const messages: Message[] = [
		{role: 'system', content: PROMPTS.DRAFT},
		{role: 'user', content: userPrompt}
	];

	const result = await runAssistant(mcpContext, messages, {temperature: 1.0});
	if (!result.success) {
		return {success: false, error: result.error};
	}

	const draftText = result.content.trim();
	if (!draftText) {
		return {success: false, error: 'No draft text returned'};
	}

	return updatePassageText(context, draftText);
}
