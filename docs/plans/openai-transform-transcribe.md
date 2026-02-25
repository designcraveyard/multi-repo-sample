# OpenAI Transform & Transcribe Services — Implementation Plan

## Context

The app needs two headless OpenAI utility services that can be wired to any UI element:
1. **OpenAI Transform** — unified service using the Responses API with streaming, config-driven tools, and image+text input
2. **OpenAI Transcribe** — Whisper API transcription with in-app mic recording

These are per-platform native SDK integrations (no shared backend). Each platform talks to OpenAI directly. Services are headless (no UI components).

## Architecture

```
Caller (any screen/button) ──► TransformService (streaming, config-driven)
                             └► TranscribeService (req/resp) ◄── AudioRecorder (native mic)
                                        │
                               OpenAI Client Provider (singleton)
                                        │
                                   OpenAI API
```

## Files to Create

### Web (Next.js)

| File | Purpose |
|------|---------|
| `lib/openai/client.ts` | Server-only OpenAI client singleton |
| `lib/openai/types.ts` | Config schema, stream events, error types |
| `lib/openai/transform-service.ts` | Streaming Responses API — `async function*` yielding events |
| `lib/openai/transcribe-service.ts` | Whisper wrapper — accepts audio Blob, returns text |
| `lib/openai/configs/index.ts` | Config registry lookup |
| `lib/openai/configs/food-logger.ts` | Example config with `food_search` tool |
| `app/api/ai/transform/route.ts` | POST endpoint streaming SSE to browser |
| `app/api/ai/transcribe/route.ts` | POST endpoint accepting FormData audio |
| `app/hooks/use-audio-recorder.ts` | Browser MediaStream mic recording hook |
| `app/hooks/use-transform-stream.ts` | Client hook consuming SSE from transform endpoint |

### iOS (SwiftUI)

| File | Purpose |
|------|---------|
| `OpenAI/OpenAIManager.swift` | `@MainActor` singleton — mirrors `SupabaseManager.swift` |
| `OpenAI/OpenAIConfig.swift` | API config constants |
| `OpenAI/OpenAISecrets.swift` | Compiled-in API key (gitignored) |
| `OpenAI/OpenAITypes.swift` | Config struct, stream event enum, error enum, tool types |
| `OpenAI/TransformService.swift` | Returns `AsyncThrowingStream<TransformStreamEvent, Error>` |
| `OpenAI/TranscribeService.swift` | Multipart POST to Whisper, returns `TranscribeResult` |
| `OpenAI/Configs/FoodLoggerConfig.swift` | Example config enum |
| `Audio/AppAudioRecorder.swift` | `@Observable` AVFoundation recorder |

### Android (Compose)

| File | Purpose |
|------|---------|
| `data/openai/OpenAIClientProvider.kt` | `object` singleton with Ktor client — mirrors `SupabaseClientProvider.kt` |
| `data/openai/OpenAITypes.kt` | Config data class, sealed event/error interfaces |
| `data/openai/TransformRepository.kt` | `@Singleton` — returns `Flow<TransformStreamEvent>` |
| `data/openai/TranscribeRepository.kt` | `@Singleton` — multipart POST to Whisper |
| `data/openai/configs/FoodLoggerConfig.kt` | Example config object |
| `audio/AppAudioRecorder.kt` | `@Inject` MediaRecorder wrapper with `StateFlow<RecorderState>` |
| `di/OpenAIModule.kt` | Hilt `@Provides` wiring — mirrors `AppModule.kt` |

## Files to Modify

| File | Change |
|------|--------|
| `multi-repo-nextjs/package.json` | Add `openai` npm dependency |
| `multi-repo-nextjs/.env.local` | Add `OPENAI_API_KEY` and `USDA_API_KEY` |
| `multi-repo-ios/multi-repo-ios/Info.plist` | Add `NSMicrophoneUsageDescription` |
| `multi-repo-android/gradle/libs.versions.toml` | Add Ktor content-negotiation + serialization libs |
| `multi-repo-android/app/build.gradle.kts` | Add `OPENAI_API_KEY` + `USDA_API_KEY` BuildConfig fields + new deps |
| `multi-repo-android/app/src/main/AndroidManifest.xml` | Add `RECORD_AUDIO` permission |
| `multi-repo-android/local.properties` | Add `OPENAI_API_KEY` + `USDA_API_KEY` |

## Existing Patterns to Reuse

| Pattern | Source File | Reuse In |
|---------|------------|----------|
| `@MainActor` singleton with env var override | `SupabaseManager.swift` | `OpenAIManager.swift` |
| `object` singleton with `BuildConfig` | `SupabaseClientProvider.kt` | `OpenAIClientProvider.kt` |
| Hilt `@Module` with `@Provides @Singleton` | `AppModule.kt` | `OpenAIModule.kt` |
| Server-only client factory | `lib/supabase/server.ts` | `lib/openai/client.ts` |
| `@Observable` state wrapper | `AuthManager.swift` | `AppAudioRecorder.swift` |
| `@Singleton` repository with coroutines | `AuthRepository.kt` | `TransformRepository.kt`, `TranscribeRepository.kt` |

## Key Type Definitions

### TransformConfig (all platforms)

```
TransformConfig {
  id: string                  // "food-logger", "chat-support"
  model: string               // "gpt-4o"
  systemPrompt: string
  tools: TransformTool[]      // web_search_preview | code_interpreter | file_search | function
  inputTypes: Set<text|image>
  maxOutputTokens?: number
  temperature?: number
}
```

### TransformStreamEvent (all platforms)

```
textDelta(delta)
functionCallStart(callId, name)
functionCallDelta(callId, delta)
functionCallDone(callId, name, arguments)
imageUrl(url)
error(message)
done
```

### TransformTool variants

```
webSearchPreview          — built-in web search
codeInterpreter           — built-in code execution
fileSearch(vectorStoreIds) — built-in file search
function(name, description, parametersJsonSchema) — app-defined tool
```

### ToolHandler

A function the app registers per tool name: `(argumentsJSON) -> resultJSON`

The service handles the tool-call loop internally:
1. OpenAI streams a function_call
2. Service looks up handler by name, calls it
3. Service submits result back to OpenAI with `previous_response_id`
4. OpenAI continues streaming — caller sees seamless text output

### TranscribeResult (all platforms)

```
TranscribeResult { text, language?, duration? }
```

### AudioRecorder states

```
RecorderState: idle | recording | paused
```

Methods: `requestPermission()`, `startRecording()`, `stopRecording() -> audioData`, `pause()`, `resume()`

## Error Types

| Service | Error Variants |
|---------|---------------|
| TransformService | `apiError`, `configError`, `toolError`, `streamError`, `inputError` |
| TranscribeService | `apiError`, `formatError` |
| AudioRecorder | `permissionDenied`, `recordingFailed`, `noRecording` |

## Dependencies

| Platform | Add | Reason |
|----------|-----|--------|
| Web | `openai` npm package | Official SDK — Responses API + Whisper |
| iOS | None (raw URLSession) | No mature Swift SDK for Responses API |
| Android | Ktor content-negotiation + kotlinx-serialization-json (already in version catalog) | Reuse existing Ktor engine for HTTP + SSE |

## Permissions

| Platform | Permission | Purpose |
|----------|-----------|---------|
| iOS | `NSMicrophoneUsageDescription` | Mic access for Transcribe |
| Android | `android.permission.RECORD_AUDIO` | Mic access for Transcribe |
| Web | `navigator.mediaDevices.getUserMedia` | Browser mic (prompted at runtime) |

## Env Variables

| Platform | Variable | Location |
|----------|----------|----------|
| Web | `OPENAI_API_KEY` | `.env.local` (server-only, no `NEXT_PUBLIC_` prefix) |
| Web | `USDA_API_KEY` | `.env.local` (server-only) |
| iOS | `OPENAI_API_KEY` | Xcode scheme env vars + `OpenAISecrets.swift` (gitignored) |
| iOS | `USDA_API_KEY` | Xcode scheme env vars + `OpenAISecrets.swift` |
| Android | `OPENAI_API_KEY` | `local.properties` -> `BuildConfig.OPENAI_API_KEY` |
| Android | `USDA_API_KEY` | `local.properties` -> `BuildConfig.USDA_API_KEY` |

## Implementation Sequence

### Phase 1: Client Providers + Types (all platforms in parallel)

**Web:**
1. `npm install openai` in multi-repo-nextjs
2. Create `lib/openai/types.ts` — all type definitions
3. Create `lib/openai/client.ts` — server-only singleton
4. Add `OPENAI_API_KEY` to `.env.local`

**iOS:**
1. Create `OpenAI/OpenAISecrets.swift` (gitignored) with placeholder key
2. Create `OpenAI/OpenAIConfig.swift` — env var override pattern
3. Create `OpenAI/OpenAIManager.swift` — singleton mirroring SupabaseManager
4. Create `OpenAI/OpenAITypes.swift` — all type definitions

**Android:**
1. Add `OPENAI_API_KEY` to `local.properties`
2. Add `buildConfigField` to `app/build.gradle.kts`
3. Add Ktor deps if not already present
4. Create `data/openai/OpenAIClientProvider.kt`
5. Create `data/openai/OpenAITypes.kt`
6. Create `di/OpenAIModule.kt`

### Phase 2: TranscribeService + AudioRecorder (simpler service first)

**Web:**
1. Create `lib/openai/transcribe-service.ts`
2. Create `app/api/ai/transcribe/route.ts`
3. Create `app/hooks/use-audio-recorder.ts`

**iOS:**
1. Create `Audio/AppAudioRecorder.swift` — AVFoundation + `@Observable`
2. Add `NSMicrophoneUsageDescription` to Info.plist
3. Create `OpenAI/TranscribeService.swift` — multipart POST to Whisper

**Android:**
1. Create `audio/AppAudioRecorder.kt` — MediaRecorder + StateFlow
2. Add `RECORD_AUDIO` to AndroidManifest.xml
3. Create `data/openai/TranscribeRepository.kt`
4. Add AudioRecorder + TranscribeRepository to `OpenAIModule.kt`

### Phase 3: TransformService (complex — streaming + tool loop)

**Web:**
1. Create `lib/openai/transform-service.ts` — AsyncGenerator with SSE parsing + tool-call loop
2. Create `app/api/ai/transform/route.ts` — SSE streaming endpoint
3. Create `app/hooks/use-transform-stream.ts` — client-side SSE consumer

**iOS:**
1. Create `OpenAI/TransformService.swift` — URLSession bytes + SSE parsing + AsyncThrowingStream

**Android:**
1. Create `data/openai/TransformRepository.kt` — Ktor ByteReadChannel + SSE parsing + Flow

### Phase 4: Example Configs + USDA Food Search Tool

**All platforms:**
1. Create food-logger config with `food_search` function tool + `web_search_preview`
2. Create config registry/index (web only — iOS/Android use direct references)
3. Implement `food_search` tool handler inline in each config file — calls USDA FoodData Central API

**USDA `food_search` tool handler** (inline in each food-logger config):
- Calls `GET https://api.nal.usda.gov/fdc/v1/foods/search?query={query}&api_key={key}&pageSize=5`
- Parses response to extract: `fdcId`, `description`, `brandName`, `servingSize`, `calories`, `protein`, `fat`, `carbs` from `foodNutrients` array
- Returns JSON string with top 5 matches for the LLM to present to the user
- Nutrient IDs: Energy (1008), Protein (1003), Total Fat (1004), Carbs (1005)
- API key from env: `USDA_API_KEY` (web `.env.local`, iOS `OpenAISecrets`, Android `BuildConfig`)

**Web implementation** (in `lib/openai/configs/food-logger.ts`):
```typescript
const foodSearchHandler: ToolHandler = async (args) => {
  const { query } = args as { query: string };
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${process.env.USDA_API_KEY}&pageSize=5`
  );
  const data = await res.json();
  const foods = data.foods.map((f: any) => ({
    fdcId: f.fdcId,
    description: f.description,
    brand: f.brandName || null,
    nutrients: {
      calories: f.foodNutrients?.find((n: any) => n.nutrientId === 1008)?.value,
      protein: f.foodNutrients?.find((n: any) => n.nutrientId === 1003)?.value,
      fat: f.foodNutrients?.find((n: any) => n.nutrientId === 1004)?.value,
      carbs: f.foodNutrients?.find((n: any) => n.nutrientId === 1005)?.value,
    },
  }));
  return JSON.stringify({ results: foods });
};
```

**iOS implementation** (in `OpenAI/Configs/FoodLoggerConfig.swift`):
- Uses `URLSession.shared.data(for:)` to call the same USDA endpoint
- Parses with `JSONSerialization` (no Codable needed for inline handler)
- Returns JSON string with same structure

**Android implementation** (in `data/openai/configs/FoodLoggerConfig.kt`):
- Uses the injected Ktor `HttpClient` to call USDA endpoint
- Parses with `kotlinx.serialization`
- Returns JSON string with same structure

## Verification

### Web
```bash
cd multi-repo-nextjs
npm run build          # Ensure no type errors
npm run lint           # ESLint passes
npm run dev            # Start dev server
# Test: POST to /api/ai/transcribe with audio file
# Test: POST to /api/ai/transform with { configId: "food-logger", input: { text: "log an apple" } }
```

### iOS
```bash
cd multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios -destination 'platform=iOS Simulator,name=iPhone 17' build
# Verify: TransformService.shared.stream(...) compiles
# Verify: TranscribeService.shared.transcribe(...) compiles
# Verify: AppAudioRecorder starts/stops without crash
```

### Android
```bash
cd multi-repo-android
./gradlew assembleDebug
# Verify: TransformRepository injectable via Hilt
# Verify: TranscribeRepository injectable via Hilt
# Verify: AppAudioRecorder starts/stops without crash
```

### Manual integration test
1. Wire a temporary button in each platform's home screen
2. Tap to start recording -> stop -> send to TranscribeService -> verify transcript text
3. Send text "log an apple" to TransformService with food-logger config -> verify streaming text response
