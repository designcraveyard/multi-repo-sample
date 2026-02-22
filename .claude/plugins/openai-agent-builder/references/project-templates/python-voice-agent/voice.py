"""{{PROJECT_NAME}} — Voice pipeline setup."""
import numpy as np
import sounddevice as sd
from agents import Agent
from agents.voice import VoicePipeline, AudioInput, SingleAgentVoiceWorkflow

SAMPLE_RATE = 24000
RECORD_DURATION = 5  # seconds


def record_audio(duration: float = RECORD_DURATION) -> bytes:
    """Record audio from default microphone, return PCM16 bytes."""
    print("Listening... speak now!")
    audio = sd.rec(
        int(SAMPLE_RATE * duration),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype=np.int16,
    )
    sd.wait()
    return audio.tobytes()


def play_audio(pcm_bytes: bytes) -> None:
    """Play PCM16 audio bytes through default speaker."""
    audio = np.frombuffer(pcm_bytes, dtype=np.int16)
    sd.play(audio, samplerate=SAMPLE_RATE)
    sd.wait()


async def run_voice_loop(agent: Agent) -> None:
    """Continuous voice conversation loop."""
    pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))

    while True:
        try:
            audio_bytes = record_audio()
            audio_input = AudioInput(buffer=audio_bytes)

            print("Processing...")
            result = await pipeline.run(audio_input)

            async for event in result.stream():
                if event.type == "voice_stream_event_audio":
                    play_audio(event.data)

            print()  # Blank line between turns
        except KeyboardInterrupt:
            print("\nStopping voice agent.")
            break
        except Exception as e:
            print(f"Voice pipeline error: {e}")
