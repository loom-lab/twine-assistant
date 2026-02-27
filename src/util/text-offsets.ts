/**
 * Converts between line/ch positions and character offsets.
 */

export interface LineChPosition {
	line: number;
	ch: number;
}

export interface TextRange {
	from: LineChPosition;
	to: LineChPosition;
}

/**
 * Convert a line/ch position to a character offset in the text.
 */
export function lineChToOffset(text: string, position: LineChPosition): number {
	const lines = text.split('\n');
	let offset = 0;
	for (let i = 0; i < position.line && i < lines.length; i++) {
		offset += lines[i].length + 1; // +1 for newline
	}
	offset += position.ch;
	return offset;
}

/**
 * Convert a text range to start/end character offsets.
 */
export function rangeToOffsets(
	text: string,
	range: TextRange
): {start: number; end: number} {
	return {
		start: lineChToOffset(text, range.from),
		end: lineChToOffset(text, range.to)
	};
}

/**
 * Replace text within a range with new content.
 */
export function spliceText(
	text: string,
	range: TextRange,
	replacement: string
): string {
	const {start, end} = rangeToOffsets(text, range);
	return text.slice(0, start) + replacement + text.slice(end);
}

/**
 * Insert text at a position.
 */
export function insertAtPosition(
	text: string,
	position: LineChPosition,
	insertion: string
): string {
	const offset = lineChToOffset(text, position);
	return text.slice(0, offset) + insertion + text.slice(offset);
}

/**
 * Calculate offset for a cursor position, with fallback to end of text.
 */
export function cursorToOffset(
	text: string,
	cursorPosition: LineChPosition | null
): number {
	if (cursorPosition) {
		return lineChToOffset(text, cursorPosition);
	}
	return text.length;
}
