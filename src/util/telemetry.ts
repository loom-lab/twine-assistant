/**
 * Telemetry module
 */

import {v4 as uuid} from '@lukeed/uuid';

export type TelemetryAction =
	| 'rephrase'
	| 'replace'
	| 'continue'
	| 'draft'
	| 'undo';

interface TelemetryEvent {
	userId: string;
	sessionSeq: number;
	timestamp: string;
	action: TelemetryAction;
	outcome: 'success' | 'error';
	undoneAction?: TelemetryAction;
}

const USER_ID_KEY = 'telemetry_user_id';
const ENDPOINT_KEY = 'telemetry_endpoint';
const DEFAULT_ENDPOINT = 'http://localhost:3100/events';

function getUserId(): string {
	let id = localStorage.getItem(USER_ID_KEY);
	if (!id) {
		id = uuid();
		localStorage.setItem(USER_ID_KEY, id);
	}
	return id;
}

let sessionSeq = 0;

export function logTelemetry(
	action: TelemetryAction,
	outcome: 'success' | 'error',
	undoneAction?: TelemetryAction
): void {
	const endpoint = localStorage.getItem(ENDPOINT_KEY) ?? DEFAULT_ENDPOINT;
	if (endpoint === '') return;

	const event: TelemetryEvent = {
		userId: getUserId(),
		sessionSeq: sessionSeq++,
		timestamp: new Date().toISOString(),
		action,
		outcome,
		...(undoneAction !== undefined && {undoneAction})
	};

	fetch(endpoint, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(event)
	}).catch(() => {
		// TODO: error handling
	});
}
