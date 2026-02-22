import { ChatKit, useChatKit } from '@openai/chatkit-react';

function App() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: {
      colorScheme: '{{THEME_COLOR_SCHEME}}',
      color: '{{THEME_COLOR}}',
      radius: '{{THEME_RADIUS}}',
    },
  });

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ChatKit control={control} style={{ height: '600px', width: '400px' }} />
    </div>
  );
}

export default App;
