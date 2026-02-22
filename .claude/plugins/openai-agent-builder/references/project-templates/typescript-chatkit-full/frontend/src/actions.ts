import type { ActionHandler } from '@openai/chatkit-react';

/**
 * Handle custom actions dispatched from ChatKit widgets or tools.
 *
 * Actions can be processed client-side (below) or forwarded to the
 * self-hosted backend for server-side processing.
 */
export const handleAction: ActionHandler = async (action, _context) => {
  switch (action.type) {
    case 'copy': {
      await navigator.clipboard.writeText(action.text);
      return { success: true };
    }

    case 'server-action': {
      // Forward action to the self-hosted backend for server-side processing
      const res = await fetch('/api/chatkit/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, sessionId: _context.sessionId }),
      });
      return await res.json();
    }

    default:
      console.warn(`Unhandled action type: ${action.type}`);
      return { success: false, error: 'Unknown action' };
  }
};
