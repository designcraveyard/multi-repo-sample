# Voice Agent Patterns

> Skills read this file before generating voice agent code.

## Python — VoicePipeline (STT → Agent → TTS)

The `VoicePipeline` chains speech-to-text, an agent, and text-to-speech into a single pipeline.

### Installation

```bash
pip install "openai-agents[voice]>=0.9.0" sounddevice numpy
```

### Complete Example

```python
import asyncio
import numpy as np
import sounddevice as sd
from agents import Agent
from agents.voice import VoicePipeline, AudioInput, SingleAgentVoiceWorkflow

SAMPLE_RATE = 24000
DURATION = 5  # seconds

agent = Agent(
    name="Voice assistant",
    instructions="You are a helpful voice assistant. Keep responses brief and natural.",
    model="gpt-4.1-mini",
)

pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))


async def main():
    print("Recording... speak now!")
    audio_data = sd.rec(
        int(SAMPLE_RATE * DURATION),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype=np.int16,
    )
    sd.wait()
    print("Processing...")

    audio_input = AudioInput(buffer=audio_data.tobytes())
    result = await pipeline.run(audio_input)

    # Stream and play response audio
    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            audio_array = np.frombuffer(event.data, dtype=np.int16)
            sd.play(audio_array, samplerate=SAMPLE_RATE)
            sd.wait()

    print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
```

### Continuous Conversation Loop

```python
async def voice_loop():
    while True:
        print("\nListening... (press Ctrl+C to stop)")
        audio_data = sd.rec(
            int(SAMPLE_RATE * DURATION),
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype=np.int16,
        )
        sd.wait()

        audio_input = AudioInput(buffer=audio_data.tobytes())
        result = await pipeline.run(audio_input)

        async for event in result.stream():
            if event.type == "voice_stream_event_audio":
                audio_array = np.frombuffer(event.data, dtype=np.int16)
                sd.play(audio_array, samplerate=SAMPLE_RATE)
                sd.wait()
```

### Pipeline with Error Handling

```python
pipeline = VoicePipeline(
    workflow=SingleAgentVoiceWorkflow(agent),
    config=VoicePipelineConfig(
        stt_model="whisper-1",
        tts_model="tts-1",
        tts_voice="alloy",
    ),
)

async def safe_voice_run(audio_input: AudioInput):
    try:
        result = await pipeline.run(audio_input)
        async for event in result.stream():
            if event.type == "voice_stream_event_audio":
                yield event.data
    except Exception as e:
        print(f"Voice pipeline error: {e}")
```

## TypeScript — RealtimeAgent

The `RealtimeAgent` connects directly to the OpenAI Realtime API via WebSocket for low-latency voice interaction.

### Installation

```bash
npm install @openai/agents zod@^4
```

### Complete Example

```typescript
import 'dotenv/config';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { tool } from '@openai/agents/realtime';
import { z } from 'zod';

const getWeather = tool({
  name: 'get_weather',
  description: 'Get weather for a city.',
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny and 72°F.`;
  },
});

const agent = new RealtimeAgent({
  name: 'Voice assistant',
  instructions: 'You are a helpful voice assistant. Keep responses brief.',
  tools: [getWeather],
});

async function main() {
  const session = new RealtimeSession(agent, {
    model: 'gpt-4o-realtime-preview',
  });

  session.on('audio', (audio: Buffer) => {
    // Play audio — implementation depends on your audio stack
    console.log(`Received ${audio.length} bytes of audio`);
  });

  session.on('text', (text: string) => {
    console.log('Transcript:', text);
  });

  session.on('error', (error: Error) => {
    console.error('Session error:', error);
  });

  await session.connect();
  console.log('Connected to Realtime API');

  // Send audio from microphone (implementation depends on platform)
  // session.sendAudio(audioBuffer);

  // Or send text for testing
  session.sendText('What is the weather in San Francisco?');

  // Keep alive
  await new Promise((resolve) => setTimeout(resolve, 30000));
  session.close();
}

main();
```

### Browser-Side RealtimeAgent

```typescript
// For browser environments — audio handled via Web Audio API
const session = new RealtimeSession(agent, {
  model: 'gpt-4o-realtime-preview',
});

// Get microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext({ sampleRate: 24000 });
const source = audioContext.createMediaStreamSource(stream);

// Process microphone audio → send to session
const processor = audioContext.createScriptProcessor(4096, 1, 1);
source.connect(processor);
processor.connect(audioContext.destination);

processor.onaudioprocess = (e) => {
  const inputData = e.inputBuffer.getChannelData(0);
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
  }
  session.sendAudio(Buffer.from(pcm16.buffer));
};

await session.connect();
```

## Voice Configuration

### Voice Presets

| Voice | Description |
|-------|-------------|
| `alloy` | Neutral, balanced |
| `echo` | Warm, conversational |
| `fable` | Expressive, storytelling |
| `onyx` | Deep, authoritative |
| `nova` | Energetic, friendly |
| `shimmer` | Soft, gentle |

### Python Voice Config

```python
from agents.voice import VoicePipelineConfig

config = VoicePipelineConfig(
    stt_model="whisper-1",
    tts_model="tts-1",        # or "tts-1-hd" for higher quality
    tts_voice="alloy",        # voice preset
)
pipeline = VoicePipeline(workflow=workflow, config=config)
```

### TypeScript Voice Config

```typescript
const session = new RealtimeSession(agent, {
  model: 'gpt-4o-realtime-preview',
  voice: 'alloy',
  turnDetection: {
    type: 'server_vad',        // server-side voice activity detection
    threshold: 0.5,
    silenceDurationMs: 500,
  },
});
```

## Audio I/O Patterns

### Recording (Python with sounddevice)

```python
import sounddevice as sd
import numpy as np

SAMPLE_RATE = 24000

def record_audio(duration: float) -> bytes:
    """Record audio from default microphone, return PCM16 bytes."""
    audio = sd.rec(
        int(SAMPLE_RATE * duration),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype=np.int16,
    )
    sd.wait()
    return audio.tobytes()
```

### Playback (Python with sounddevice)

```python
def play_audio(pcm_bytes: bytes):
    """Play PCM16 audio bytes through default speaker."""
    audio = np.frombuffer(pcm_bytes, dtype=np.int16)
    sd.play(audio, samplerate=SAMPLE_RATE)
    sd.wait()
```

## Common Pitfalls

1. **VoicePipeline requires `openai-agents[voice]`** — the `[voice]` extra installs audio deps
2. **Sample rate must be 24000** for OpenAI voice models
3. **Always handle pipeline errors** — network issues, model failures, audio device errors
4. **RealtimeAgent tools import from `@openai/agents/realtime`** — not the base path
5. **Browser audio requires user gesture** — can't auto-start microphone
6. **Voice agents should have short instructions** — long instructions increase latency
7. **Use `tts-1` for speed, `tts-1-hd` for quality** — latency tradeoff
