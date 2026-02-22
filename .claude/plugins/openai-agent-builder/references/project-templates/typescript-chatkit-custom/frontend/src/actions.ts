import type { ActionHandler } from '@openai/chatkit-react';

export const handleAction: ActionHandler = async (action, context) => {
  switch (action.type) {
    case 'example_action':
      // Handle custom action from widget
      console.log('Custom action received:', action.data);
      // Optionally send a message back to the agent
      context.sendCustomAction({
        type: 'action_result',
        data: { status: 'completed', result: action.data },
      });
      break;

    default:
      console.warn('Unknown action type:', action.type);
  }
};
