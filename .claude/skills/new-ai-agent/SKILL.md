---
name: new-ai-agent
description: Create a new AI agent feature powered by the OpenAI Transform/Transcribe service layer. Use when the user says "add an AI feature", "create an AI agent", "build an AI tool", or wants to add a new TransformConfig-based feature. Scaffolds the config, tool handlers, and demo UI across all three platforms (Web, iOS, Android).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# New AI Agent Scaffolder

Create a new AI agent feature on top of the existing OpenAI Transform & Transcribe service layer.
The service layer (TransformService, TranscribeService, OpenAIManager) is already built — this skill
creates the **config + tool handlers + UI** for a new use case.

## Workspace Paths

- **Web configs:** `multi-repo-nextjs/lib/openai/configs/`
- **Web hooks:** `multi-repo-nextjs/app/hooks/`
- **Web pages:** `multi-repo-nextjs/app/(authenticated)/`
- **Web API routes:** `multi-repo-nextjs/app/api/ai/`
- **iOS configs:** `multi-repo-ios/multi-repo-ios/OpenAI/Configs/`
- **iOS views:** `multi-repo-ios/multi-repo-ios/Views/`
- **Android configs:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/openai/configs/`
- **Android screens:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/`
- **Shared docs:** `docs/`

## Arguments

`$ARGUMENTS` — Agent description (e.g. "recipe suggestion agent" or "code review assistant with GitHub search")

## Architecture Reference

The OpenAI integration follows a **config-driven** pattern. Each AI feature is a `TransformConfig` that bundles:

1. **System prompt** — instructions for the model's behavior
2. **Tools** — function tools the model can call (with JSON Schema parameters)
3. **Tool handlers** — local closures/lambdas that execute tool calls (API calls, DB queries, etc.)
4. **Input types** — text, image, or both
5. **Model settings** — model name, temperature, max tokens

No changes to TransformService/TransformRepository are needed — just create a new config and pass it in.

### Existing Example: FoodLoggerConfig

Study these files to understand the pattern:

| Platform | Config File | Key Pattern |
|----------|-------------|-------------|
| Web | `lib/openai/configs/food-logger.ts` | `ToolHandler` async function + `TransformConfig` export |
| iOS | `OpenAI/Configs/FoodLoggerConfig.swift` | `enum` namespace + static `ToolHandler` closure + static `config` |
| Android | `data/openai/configs/FoodLoggerConfig.kt` | `object` singleton + `ToolHandler` SAM lambda + `config` val |

### Service Layer Files (DO NOT MODIFY)

These are already built and shared across all agents:

| Platform | File | Purpose |
|----------|------|---------|
| Web | `lib/openai/transform-service.ts` | Streaming transform with SSE parsing + tool-call loop |
| Web | `lib/openai/transcribe-service.ts` | Whisper audio transcription |
| Web | `lib/openai/client.ts` | OpenAI client singleton |
| Web | `lib/openai/types.ts` | Shared TypeScript types |
| Web | `app/api/ai/transform/route.ts` | SSE streaming API endpoint |
| Web | `app/api/ai/transcribe/route.ts` | Transcription API endpoint |
| Web | `app/hooks/use-transform-stream.ts` | Client-side SSE consumer hook |
| Web | `app/hooks/use-audio-recorder.ts` | Browser MediaRecorder hook |
| iOS | `OpenAI/TransformService.swift` | AsyncThrowingStream + SSE parsing + tool-call loop |
| iOS | `OpenAI/TranscribeService.swift` | Whisper multipart upload |
| iOS | `OpenAI/OpenAIManager.swift` | URLSession singleton + request builders |
| iOS | `OpenAI/OpenAIConfig.swift` | API key + endpoint constants |
| iOS | `OpenAI/OpenAITypes.swift` | All shared types (TransformConfig, events, errors) |
| iOS | `Audio/AppAudioRecorder.swift` | AVFoundation recorder |
| Android | `data/openai/TransformRepository.kt` | Ktor SSE streaming + Flow + tool-call loop |
| Android | `data/openai/TranscribeRepository.kt` | Ktor multipart Whisper upload |
| Android | `data/openai/OpenAIClientProvider.kt` | Ktor HttpClient singleton |
| Android | `data/openai/OpenAITypes.kt` | All shared types |
| Android | `audio/AppAudioRecorder.kt` | MediaRecorder wrapper |

## Workflow

### Phase 1: Understand the Agent

From `$ARGUMENTS`, determine:
- **Agent name** (PascalCase): e.g. `RecipeSuggester`, `CodeReviewer`
- **kebab-case**: e.g. `recipe-suggester`, `code-reviewer`
- **What tools the agent needs** — external APIs, DB queries, web search, etc.
- **Input modalities** — text only, image only, or both
- **Model** — `gpt-4o` (default, multimodal), `gpt-4o-mini` (faster/cheaper, text-only tasks)

Ask the user to confirm:
1. The agent's purpose and system prompt direction
2. What tools/APIs the agent should call
3. Whether it needs image input support
4. Whether it needs audio/transcription support

### Phase 2: Read Existing Patterns

Read these files to understand the current patterns:

```
# Web
multi-repo-nextjs/lib/openai/configs/food-logger.ts
multi-repo-nextjs/lib/openai/configs/index.ts
multi-repo-nextjs/lib/openai/types.ts

# iOS
multi-repo-ios/multi-repo-ios/OpenAI/Configs/FoodLoggerConfig.swift
multi-repo-ios/multi-repo-ios/OpenAI/OpenAITypes.swift

# Android
multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/openai/configs/FoodLoggerConfig.kt
multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/openai/OpenAITypes.kt
```

### Phase 3: Create Config Files

For each platform, create the config following the exact pattern of FoodLoggerConfig:

#### Web (TypeScript)

Create `multi-repo-nextjs/lib/openai/configs/{kebab-case}.ts`:

```typescript
import type { TransformConfig, ToolHandler } from "../types";

// Tool handler(s) — async functions that execute external API calls
const myToolHandler: ToolHandler = async (args) => {
  const { param } = args as { param: string };
  // ... call external API ...
  return JSON.stringify({ results: [...] });
};

export const myAgentConfig: TransformConfig = {
  id: "{kebab-case}",
  model: "gpt-4o",
  systemPrompt: `...`,
  tools: [
    { type: "function", name: "tool_name", description: "...", parameters: { ... } },
  ],
  inputTypes: new Set(["text"]),
  toolHandlers: { tool_name: myToolHandler },
};
```

Then register in `multi-repo-nextjs/lib/openai/configs/index.ts` by adding to the configs map.

#### iOS (Swift)

Create `multi-repo-ios/multi-repo-ios/OpenAI/Configs/{PascalCase}Config.swift`:

```swift
import Foundation

enum {PascalCase}Config {
    static let config = TransformConfig(
        id: "{kebab-case}",
        systemPrompt: "...",
        tools: [
            .function(name: "tool_name", description: "...", parameters: [...]),
        ],
        inputTypes: [.text],
        toolHandlers: ["tool_name": toolHandler]
    )

    private static let toolHandler: ToolHandler = { argsJSON in
        // Parse args, call API, return JSON string
    }
}
```

#### Android (Kotlin)

Create `multi-repo-android/.../data/openai/configs/{PascalCase}Config.kt`:

```kotlin
object {PascalCase}Config {
    private val toolHandler = ToolHandler { argsJson ->
        // Parse args, call API, return JSON string
    }

    val config = TransformConfig(
        id = "{kebab-case}",
        systemPrompt = "...",
        tools = listOf(
            TransformTool.Function(name = "tool_name", description = "...", parameters = buildJsonObject { ... }),
        ),
        inputTypes = setOf(TransformInputType.TEXT),
        toolHandlers = mapOf("tool_name" to toolHandler),
    )
}
```

### Phase 4: Create UI (Optional)

If the user wants a dedicated screen for this agent:

1. **Web**: Create `app/(authenticated)/{kebab-case}/page.tsx` — use `useTransformStream` hook
2. **iOS**: Create `Views/{PascalCase}View.swift` — use `TransformService.shared.stream(config:input:)`
3. **Android**: Create `feature/{lowercase}/{PascalCase}Screen.kt` + `{PascalCase}ViewModel.kt`

Follow the existing `AIDemoView`/`AIDemoScreen`/`ai-demo/page.tsx` patterns.

If no dedicated screen is needed (agent is used programmatically), skip this step.

### Phase 5: Wire Navigation (if UI was created)

- **Web**: Add route link to `AdaptiveNavShell` or as a link from another page
- **iOS**: Add tab or navigation link in `ContentView.swift`
- **Android**: Add `@Serializable data object` to `Screen` sealed interface and wire in `MainActivity.kt`

### Phase 6: Environment Variables

If the agent's tool handlers need new API keys:

1. **Web**: Add to `.env.local` and document in `.env.local.example`
2. **iOS**: Add to `OpenAISecrets.swift` and `OpenAIConfig.swift` (env var override pattern)
3. **Android**: Add to `local.properties` and `build.gradle.kts` BuildConfig fields, then expose in `OpenAIClientProvider.kt`

### Phase 7: Verify

- [ ] Web config is registered in `configs/index.ts`
- [ ] iOS config compiles (run `xcodebuild build`)
- [ ] Android config compiles (run `./gradlew assembleDebug`)
- [ ] Tool handlers return valid JSON strings
- [ ] API keys are gitignored (never in source code)
- [ ] If UI was created, navigation is wired on all platforms

## Available Tool Types

### Built-in OpenAI Tools (no handler needed)
- `web_search_preview` — model can search the web
- `code_interpreter` — model can run Python code
- `file_search` — model can search vector stores (requires vector_store_ids)

### Custom Function Tools (need a ToolHandler)
Define a JSON Schema for parameters, implement a handler that:
1. Receives the model's JSON arguments as a string
2. Calls an external API or performs computation
3. Returns a JSON string result

The model will see the result and incorporate it into its response.

## Tips

- Keep tool handler responses concise — large JSON wastes tokens
- Return `{"error": "..."}` on failure instead of throwing — lets the model handle gracefully
- Use `gpt-4o-mini` for text-only agents that don't need vision
- The tool-call loop in TransformService handles multi-turn automatically — if the model needs to call multiple tools, it will
- Test tool handlers independently (e.g. via curl) before wiring into the config
