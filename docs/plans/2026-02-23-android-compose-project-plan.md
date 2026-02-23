# Android (Jetpack Compose) Full Parity Scaffold — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a full-parity Android project (`multi-repo-android/`) with Jetpack Compose, matching all 14 atomic components, 4 patterns, 13 native wrappers, 3 adaptive wrappers, design tokens, navigation, Supabase client, and extended workspace tooling.

**Architecture:** Hybrid structure — `ui/` subtree mirrors iOS component layout for cross-platform tooling; `feature/` subtree follows Android convention. Hilt DI, type-safe Compose Navigation, supabase-kt networking. Two-layer design tokens (Primitive internal, Semantic public) with light/dark support via `isSystemInDarkTheme()`.

**Tech Stack:** Kotlin 2.1, Jetpack Compose (BOM 2025.01.01), Material Design 3, Hilt 2.53, Compose Navigation 2.8, supabase-kt 3.1, Phosphor Icons, Ktor 3.0

**Design doc:** `docs/plans/2026-02-23-android-compose-project-design.md`

---

## Phase 1: Project Skeleton & Build Config

### Task 1: Initialize git repo and root Gradle files

**Files:**
- Create: `multi-repo-android/.gitignore`
- Create: `multi-repo-android/build.gradle.kts`
- Create: `multi-repo-android/settings.gradle.kts`
- Create: `multi-repo-android/gradle.properties`
- Create: `multi-repo-android/gradle/libs.versions.toml`

**Step 1: Create the directory and init git**

```bash
mkdir -p multi-repo-android
cd multi-repo-android
git init
```

**Step 2: Write `.gitignore`**

```gitignore
*.iml
.gradle
/local.properties
/.idea
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
```

**Step 3: Write `gradle/libs.versions.toml`**

Use exact versions from design doc section 6. All dependencies declared here — no version strings in build.gradle.kts files.

```toml
[versions]
agp = "8.7.3"
kotlin = "2.1.0"
compose-bom = "2025.01.01"
hilt = "2.53.1"
navigation = "2.8.5"
supabase = "3.1.1"
ktor = "3.0.3"
lifecycle = "2.8.7"
material3-adaptive = "1.1.0"
ksp = "2.1.0-1.0.29"
serialization = "1.7.3"

[libraries]
compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "compose-bom" }
compose-material3 = { group = "androidx.compose.material3", name = "material3" }
compose-material3-adaptive = { group = "androidx.compose.material3.adaptive", name = "adaptive-navigation-suite", version.ref = "material3-adaptive" }
compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
compose-foundation = { group = "androidx.compose.foundation", name = "foundation" }
lifecycle-runtime = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }
lifecycle-viewmodel = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }
navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigation" }
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-android-compiler", version.ref = "hilt" }
hilt-navigation = { group = "androidx.hilt", name = "hilt-navigation-compose", version = "1.2.0" }
supabase-postgrest = { group = "io.github.jan-tennert.supabase", name = "postgrest-kt", version.ref = "supabase" }
supabase-realtime = { group = "io.github.jan-tennert.supabase", name = "realtime-kt", version.ref = "supabase" }
supabase-gotrue = { group = "io.github.jan-tennert.supabase", name = "gotrue-kt", version.ref = "supabase" }
supabase-compose-auth = { group = "io.github.jan-tennert.supabase", name = "compose-auth", version.ref = "supabase" }
ktor-client = { group = "io.ktor", name = "ktor-client-android", version.ref = "ktor" }
activity-compose = { group = "androidx.activity", name = "activity-compose", version = "1.9.3" }
core-ktx = { group = "androidx.core", name = "core-ktx", version = "1.15.0" }
serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "serialization" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

**Step 4: Write root `build.gradle.kts`**

```kotlin
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.hilt) apply false
    alias(libs.plugins.ksp) apply false
}
```

**Step 5: Write `settings.gradle.kts`**

```kotlin
pluginManagement {
    repositories {
        google { content { includeGroupByRegex("com\\.android.*") ; includeGroupByRegex("com\\.google.*") ; includeGroupByRegex("androidx.*") } }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolution { repositories { google() ; mavenCentral() } }
rootProject.name = "multi-repo-android"
include(":app")
```

**Step 6: Write `gradle.properties`**

```properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
```

**Step 7: Commit**

```bash
git add -A && git commit -m "chore: init Android project with Gradle version catalog"
```

---

### Task 2: App module build config + AndroidManifest

**Files:**
- Create: `multi-repo-android/app/build.gradle.kts`
- Create: `multi-repo-android/app/src/main/AndroidManifest.xml`

**Step 1: Write `app/build.gradle.kts`**

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.abhishekverma.multirepo"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.abhishekverma.multirepo"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
}

dependencies {
    // Compose
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.material3)
    implementation(libs.compose.material3.adaptive)
    implementation(libs.compose.foundation)
    implementation(libs.compose.ui.tooling.preview)
    debugImplementation(libs.compose.ui.tooling)

    // Lifecycle
    implementation(libs.lifecycle.runtime)
    implementation(libs.lifecycle.viewmodel)

    // Navigation
    implementation(libs.navigation.compose)

    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation)

    // Supabase
    implementation(libs.supabase.postgrest)
    implementation(libs.supabase.gotrue)
    implementation(libs.supabase.realtime)
    implementation(libs.ktor.client)

    // Serialization
    implementation(libs.serialization.json)

    // Core
    implementation(libs.activity.compose)
    implementation(libs.core.ktx)
}
```

**Step 2: Write `AndroidManifest.xml`**

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:name=".MultiRepoApp"
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.MultiRepo">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.MultiRepo">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

**Step 3: Write `app/src/main/res/values/strings.xml`**

```xml
<resources>
    <string name="app_name">MultiRepo</string>
</resources>
```

**Step 4: Write `app/src/main/res/values/themes.xml`**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.MultiRepo" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
```

**Step 5: Commit**

```bash
git add -A && git commit -m "chore: add app module build config and manifest"
```

---

### Task 3: Application class + MainActivity + empty theme

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MultiRepoApp.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/theme/Theme.kt`

**Step 1: Write `MultiRepoApp.kt`**

```kotlin
package com.abhishekverma.multirepo

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MultiRepoApp : Application()
```

**Step 2: Write minimal `Theme.kt`** (placeholder — tokens come in Phase 2)

```kotlin
package com.abhishekverma.multirepo.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

@Composable
fun MultiRepoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) darkColorScheme() else lightColorScheme()
    MaterialTheme(colorScheme = colorScheme, content = content)
}
```

**Step 3: Write `MainActivity.kt`**

```kotlin
package com.abhishekverma.multirepo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.abhishekverma.multirepo.ui.theme.MultiRepoTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MultiRepoTheme {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("MultiRepo Android")
                }
            }
        }
    }
}
```

**Step 4: Verify the project compiles**

```bash
cd multi-repo-android && ./gradlew assembleDebug
```

Expected: BUILD SUCCESSFUL

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Application, MainActivity, and minimal Compose theme"
```

---

## Phase 2: Design Token System

### Task 4: Primitive + Semantic color tokens (DesignTokens.kt)

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/theme/DesignTokens.kt`

**Reference:** Copy all hex values from `multi-repo-ios/multi-repo-ios/DesignTokens.swift` (lines 45-388). Every `adaptive(light: "X", dark: "Y")` becomes a Compose `@Composable get()` with `isSystemInDarkTheme()`.

**Step 1: Write `DesignTokens.kt`**

The file must contain:

1. **`internal object PrimitiveColors`** — all primitive palette values (Slate, Zinc, Neutral, Red, Amber, Green, Indigo, Base). Mark `internal` so they can't be used in component files. Hex values as `Color(0xFFxxxxxx)`.

2. **`object SemanticColors`** — all semantic tokens as `@Composable @ReadOnlyComposable get()` properties. Categories:
   - Surfaces/Base (9 tokens: BasePrimary, BasePrimaryHover, BasePrimaryPressed, BaseLowContrast, BaseLowContrastHover, BaseLowContrastPressed, BaseHighContrast, BaseHighContrastHover, BaseHighContrastPressed)
   - Surfaces/Inverse (7 tokens)
   - Surfaces/BrandInteractive (9 tokens)
   - Surfaces/Accent (5 tokens)
   - Surfaces/Success (4 tokens: Solid, SolidHover, SolidPressed, Subtle)
   - Surfaces/Warning (2 tokens: Solid, Subtle)
   - Surfaces/Error (4 tokens)
   - Typography (14 tokens)
   - Icons (14 tokens)
   - Border (7 tokens)

   Light/dark hex values come directly from `DesignTokens.swift` `adaptive(light:dark:)` calls.

3. **`object Spacing`** — `space1 = 4.dp` through `space24 = 96.dp` (matching `CGFloat.space*` from Swift lines 392-405)

4. **`object Radius`** — `none = 0.dp` through `full = 9999.dp` (matching Swift lines 419-427)

5. **`object IconSize`** — `xs = 12.dp`, `sm = 16.dp`, `md = 20.dp`, `lg = 24.dp`, `xl = 32.dp` (matching Swift lines 433-438)

**Step 2: Verify compiles**

```bash
./gradlew assembleDebug
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add two-layer design token system (Primitive + Semantic)"
```

---

### Task 5: Typography tokens (Type.kt)

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/theme/Type.kt`

**Reference:** `DesignTokens.swift` lines 447-505 — all 28 `Font` styles.

**Step 1: Write `Type.kt`**

```kotlin
package com.abhishekverma.multirepo.ui.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object AppTypography {
    // Display
    val displayLarge  = TextStyle(fontSize = 96.sp, lineHeight = 104.sp, fontWeight = FontWeight.Normal)
    val displayMedium = TextStyle(fontSize = 80.sp, lineHeight = 88.sp,  fontWeight = FontWeight.Normal)
    val displaySmall  = TextStyle(fontSize = 64.sp, lineHeight = 72.sp,  fontWeight = FontWeight.Normal)
    // Heading
    val headingLarge  = TextStyle(fontSize = 56.sp, lineHeight = 64.sp,  fontWeight = FontWeight.Bold)
    val headingMedium = TextStyle(fontSize = 48.sp, lineHeight = 56.sp,  fontWeight = FontWeight.Bold)
    val headingSmall  = TextStyle(fontSize = 40.sp, lineHeight = 48.sp,  fontWeight = FontWeight.Bold)
    // Title
    val titleLarge    = TextStyle(fontSize = 28.sp, lineHeight = 36.sp,  fontWeight = FontWeight.Bold)
    val titleMedium   = TextStyle(fontSize = 24.sp, lineHeight = 32.sp,  fontWeight = FontWeight.Bold)
    val titleSmall    = TextStyle(fontSize = 20.sp, lineHeight = 28.sp,  fontWeight = FontWeight.Bold)
    // Body
    val bodyLarge     = TextStyle(fontSize = 16.sp, lineHeight = 24.sp,  fontWeight = FontWeight.Normal)
    val bodyMedium    = TextStyle(fontSize = 14.sp, lineHeight = 20.sp,  fontWeight = FontWeight.Normal)
    val bodySmall     = TextStyle(fontSize = 12.sp, lineHeight = 16.sp,  fontWeight = FontWeight.Normal)
    // Body Emphasized
    val bodyLargeEm   = TextStyle(fontSize = 16.sp, lineHeight = 24.sp,  fontWeight = FontWeight.Medium)
    val bodyMediumEm  = TextStyle(fontSize = 14.sp, lineHeight = 20.sp,  fontWeight = FontWeight.Medium)
    val bodySmallEm   = TextStyle(fontSize = 12.sp, lineHeight = 16.sp,  fontWeight = FontWeight.Medium)
    // CTA
    val ctaLarge      = TextStyle(fontSize = 16.sp, lineHeight = 24.sp,  fontWeight = FontWeight.SemiBold)
    val ctaMedium     = TextStyle(fontSize = 14.sp, lineHeight = 20.sp,  fontWeight = FontWeight.SemiBold)
    val ctaSmall      = TextStyle(fontSize = 12.sp, lineHeight = 16.sp,  fontWeight = FontWeight.SemiBold)
    // Link
    val linkLarge     = TextStyle(fontSize = 16.sp, lineHeight = 24.sp,  fontWeight = FontWeight.Medium)
    val linkMedium    = TextStyle(fontSize = 14.sp, lineHeight = 20.sp,  fontWeight = FontWeight.Medium)
    val linkSmall     = TextStyle(fontSize = 12.sp, lineHeight = 16.sp,  fontWeight = FontWeight.Medium)
    // Caption
    val captionMedium = TextStyle(fontSize = 12.sp, lineHeight = 16.sp,  fontWeight = FontWeight.Normal)
    val captionSmall  = TextStyle(fontSize = 10.sp, lineHeight = 14.sp,  fontWeight = FontWeight.Normal)
    // Badge
    val badgeMedium   = TextStyle(fontSize = 10.sp, lineHeight = 14.sp,  fontWeight = FontWeight.SemiBold)
    val badgeSmall    = TextStyle(fontSize = 8.sp,  lineHeight = 12.sp,  fontWeight = FontWeight.SemiBold)
    // Overline (pair with letterSpacing for tracking)
    val overlineSmall  = TextStyle(fontSize = 8.sp,  lineHeight = 12.sp,  fontWeight = FontWeight.Bold)
    val overlineMedium = TextStyle(fontSize = 10.sp, lineHeight = 14.sp,  fontWeight = FontWeight.Bold)
    val overlineLarge  = TextStyle(fontSize = 12.sp, lineHeight = 16.sp,  fontWeight = FontWeight.Bold)
}
```

**Step 2: Verify compiles**

```bash
./gradlew assembleDebug
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add 28 typography token styles"
```

---

### Task 6: Wire tokens into Material 3 theme

**Files:**
- Modify: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/theme/Theme.kt`

**Step 1: Update `Theme.kt`** to use `SemanticColors` for Material 3 color scheme:

```kotlin
package com.abhishekverma.multirepo.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.material3.windowsizeclass.WindowSizeClass

val LocalWindowSizeClass = staticCompositionLocalOf<WindowSizeClass> {
    error("WindowSizeClass not provided")
}

@Composable
fun MultiRepoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) darkColorScheme(
        primary = SemanticColors.surfacesBrandInteractive,
        onPrimary = SemanticColors.typographyOnBrandPrimary,
        surface = SemanticColors.surfacesBasePrimary,
        onSurface = SemanticColors.typographyPrimary,
        error = SemanticColors.surfacesErrorSolid,
        onError = SemanticColors.typographyOnBrandPrimary,
        outline = SemanticColors.borderDefault,
    ) else lightColorScheme(
        primary = SemanticColors.surfacesBrandInteractive,
        onPrimary = SemanticColors.typographyOnBrandPrimary,
        surface = SemanticColors.surfacesBasePrimary,
        onSurface = SemanticColors.typographyPrimary,
        error = SemanticColors.surfacesErrorSolid,
        onError = SemanticColors.typographyOnBrandPrimary,
        outline = SemanticColors.borderDefault,
    )

    MaterialTheme(colorScheme = colorScheme, content = content)
}
```

**Step 2: Verify compiles**

```bash
./gradlew assembleDebug
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: wire semantic tokens into Material 3 theme"
```

---

## Phase 3: Icon System

### Task 7: Phosphor icon helper

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/icons/PhosphorIconHelper.kt`

**Note:** The Phosphor Icons Compose library may not be available on Maven Central. If `com.phosphoricons:phosphor-android` doesn't resolve, use Material Icons as a placeholder and create the abstraction layer so it can be swapped later. The helper should still define `IconSize` enum and a `PhosphorIcon` composable wrapper.

**Step 1: Write `PhosphorIconHelper.kt`**

Define:
- `enum class IconSize(val dp: Dp)` — xs(12), sm(16), md(20), lg(24), xl(32)
- `enum class IconWeight` — Thin, Light, Regular, Bold, Fill, Duotone
- `@Composable fun AppIcon(imageVector: ImageVector, size: IconSize = IconSize.Md, tint: Color = SemanticColors.iconsPrimary, contentDescription: String? = null)` — wrapper that applies token-based size and color

If Phosphor Compose is unavailable, use `androidx.compose.material.icons` as the backing icon set and document the mapping.

**Step 2: Verify compiles**

```bash
./gradlew assembleDebug
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add icon system helper with size/color tokens"
```

---

## Phase 4: Atomic Components (14)

Each component is one task. Follow the iOS `AppButton.swift` pattern: enums for variant/size, private spec structs, `@Composable` function with token-only styling.

### Task 8: AppButton

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppButton.kt`

**Reference:** `multi-repo-ios/multi-repo-ios/Components/Button/AppButton.swift` (lines 1-339) and `multi-repo-nextjs/app/components/Button/Button.tsx` (lines 1-225).

**Step 1: Write `AppButton.kt`**

Must include:
- `enum class ButtonVariant` — Primary, Secondary, Tertiary, Success, Danger
- `enum class ButtonSize` — Sm, Md, Lg (with paddingH, paddingV, gap, iconSize, textStyle specs from Swift lines 48-80)
- Private `ButtonColorSpec` data class (background, backgroundPressed, foreground, border nullable) — token values from Swift lines 94-156
- `@Composable fun AppButton(label, onClick, variant, size, enabled, isLoading, leadingIcon, trailingIcon, modifier)` — pill shape (Capsule = `RoundedCornerShape(50%)`), 0.5 opacity when disabled, haptic feedback via `HapticFeedbackType`
- `@Preview` composable showing all variants

**Step 2: Verify compiles**

```bash
./gradlew assembleDebug
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add AppButton component (5 variants, 3 sizes)"
```

---

### Task 9: AppIconButton

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppIconButton.kt`

**Reference:** iOS `AppIconButton.swift`, Web `IconButton.tsx`

Icon-only button. Same variant/size system as AppButton but without label text. Circle shape instead of pill.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppIconButton component"
```

---

### Task 10: AppBadge

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppBadge.kt`

**Reference:** iOS `AppBadge.swift`, Web `Badge.tsx`

Variants: Success, Warning, Error, Info, Neutral. Sizes: Sm, Md. Pill-shaped container with text. All colors from SemanticColors.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppBadge component"
```

---

### Task 11: AppLabel

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppLabel.kt`

**Reference:** iOS `AppLabel.swift`, Web `Label.tsx`

Simple text + optional leading icon. Uses typography tokens.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppLabel component"
```

---

### Task 12: AppChip

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppChip.kt`

**Reference:** iOS `AppChip.swift`, Web `Chip.tsx`

Variants: Tab, Filter. Toggleable. Selected state uses `surfacesBrandInteractiveLowContrastPressed` (as allowed by design-token-semantics-guard). Unselected uses `surfacesBaseLowContrast`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppChip component (Tab + Filter variants)"
```

---

### Task 13: AppTabs

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppTabs.kt`

**Reference:** iOS `AppTabs.swift`, Web `Tabs.tsx`

Horizontal scrollable tab bar. Active tab indicator. All colors from tokens.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppTabs component"
```

---

### Task 14: AppSegmentControlBar

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppSegmentControlBar.kt`

**Reference:** iOS `AppSegmentControlBar.swift`, Web `SegmentControlBar.tsx`

Segmented control with sliding indicator. Fixed-width segments.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppSegmentControlBar component"
```

---

### Task 15: AppThumbnail

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppThumbnail.kt`

**Reference:** iOS `AppThumbnail.swift`, Web `Thumbnail.tsx`

Image thumbnail with configurable size and shape (circle, rounded rect). Placeholder state.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppThumbnail component"
```

---

### Task 16: AppInputField

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppInputField.kt`

**Reference:** iOS `AppInputField.swift`, Web `InputField.tsx`

Text input with states (Default, Success, Warning, Error). Label, placeholder, helper text, leading/trailing icons. Border color changes by state. This is the most complex atomic component.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppInputField component with validation states"
```

---

### Task 17: AppToast

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppToast.kt`

**Reference:** iOS `AppToast.swift`, Web `Toast.tsx`

Notification toast with variants (Success, Warning, Error, Info). Optional action button. Auto-dismiss.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppToast component"
```

---

### Task 18: AppDivider

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppDivider.kt`

**Reference:** iOS `AppDivider.swift`, Web `Divider.tsx`

Horizontal/vertical divider using `borderDefault` or `borderMuted` color tokens.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppDivider component"
```

---

### Task 19: AppCheckbox, AppRadioButton, AppSwitch

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppCheckbox.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppRadioButton.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppSwitch.kt`

**Reference:** iOS counterparts, Web counterparts

Simple form controls wrapping Material 3 `Checkbox`, `RadioButton`, `Switch` with token-based colors (brand interactive for checked state). Each includes optional label.

**Step 1: Implement all three, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppCheckbox, AppRadioButton, AppSwitch form controls"
```

---

### Task 20: Verify all atomics compile together

**Step 1: Full build**

```bash
./gradlew assembleDebug
```

Expected: BUILD SUCCESSFUL

**Step 2: Commit (if any fixes needed)**

---

## Phase 5: Pattern Components (4)

### Task 21: AppTextBlock, AppStepIndicator, AppStepper, AppListItem

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/patterns/AppTextBlock.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/patterns/AppStepIndicator.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/patterns/AppStepper.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/patterns/AppListItem.kt`

**Reference:** iOS `Components/Patterns/App*.swift`, Web `components/patterns/*/`

Each pattern composes atomic components:
- **AppTextBlock** — typography + optional icon
- **AppStepIndicator** — AppBadge + AppDivider + AppLabel in a horizontal/vertical sequence
- **AppStepper** — AppIconButton (minus/plus) + AppLabel (count)
- **AppListItem** — AppThumbnail + AppLabel + trailing control slot (Switch, Chevron, Badge, etc.)

**Step 1: Implement all four, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add pattern components (TextBlock, StepIndicator, Stepper, ListItem)"
```

---

## Phase 6: Native Wrappers (13) + Centralized Styling

### Task 22: NativeComponentStyling.kt

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/NativeComponentStyling.kt`

**Reference:** `multi-repo-ios/multi-repo-ios/NativeComponentStyling.swift`

One `object` per wrapper with nested `Colors`, `Layout`, `Typography` objects. All values reference `SemanticColors`, `Spacing`, `Radius`, `AppTypography` — no hardcoded values.

**Step 1: Write all 13 styling objects (Picker, DatePicker, ProgressLoader, ColorPicker, BottomSheet, ActionSheet, AlertPopup, PageHeader, ContextMenu, BottomNavBar, Carousel, Tooltip, RangeSlider)**

**Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add centralized NativeComponentStyling with 13 wrapper configs"
```

---

### Task 23: AppNativePicker + AppDateTimePicker + AppProgressLoader

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppNativePicker.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppDateTimePicker.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppProgressLoader.kt`

**AppNativePicker:** `ExposedDropdownMenuBox` + `DropdownMenuItem`. Props: `value`, `options: List<PickerOption>`, `onSelect`, `label`, `showError`, `enabled`.

**AppDateTimePicker:** Material 3 `DatePickerDialog` / `TimePickerDialog`. Props: `value: Long?`, `onValueChange`, `mode: DateTimeMode` (Date/Time/DateTime), `label`.

**AppProgressLoader:** `CircularProgressIndicator` / `LinearProgressIndicator`. Props: `variant: ProgressVariant` (Indefinite/Definite), `value`, `total`, `label`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppNativePicker, AppDateTimePicker, AppProgressLoader"
```

---

### Task 24: AppBottomSheet + AppActionSheet + AppAlertPopup

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppBottomSheet.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppActionSheet.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppAlertPopup.kt`

**AppBottomSheet:** `ModalBottomSheet` (M3). Props: `isPresented`, `onDismiss`, `content`.

**AppActionSheet:** `AlertDialog` with vertical action buttons. Props: `isPresented`, `onDismiss`, `title`, `message`, `actions: List<ActionSheetAction>`.

**AppAlertPopup:** `AlertDialog` (M3). Props: `isPresented`, `onDismiss`, `title`, `message`, `buttons: List<AlertButton>`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppBottomSheet, AppActionSheet, AppAlertPopup"
```

---

### Task 25: AppPageHeader + AppContextMenu + AppBottomNavBar

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppPageHeader.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppContextMenu.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppBottomNavBar.kt`

**AppPageHeader:** `TopAppBar` / `CenterAlignedTopAppBar` (M3). Props: `title`, `navigationIcon`, `actions: List<HeaderAction>`.

**AppContextMenu:** `DropdownMenu`. Props: `isExpanded`, `onDismiss`, `items: List<ContextMenuItem>`, `anchor: @Composable ()`.

**AppBottomNavBar:** `NavigationBar` (M3). Props: `selectedTab`, `onTabSelect`, `tabs: List<NavTab>`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppPageHeader, AppContextMenu, AppBottomNavBar"
```

---

### Task 26: AppCarousel + AppTooltip + AppRangeSlider + AppColorPicker

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppCarousel.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppTooltip.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppRangeSlider.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/AppColorPicker.kt`

**AppCarousel:** `HorizontalPager` (Foundation). Props: `items`, `style: CarouselStyle` (Paged/ScrollSnap), `showDots`.

**AppTooltip:** `PlainTooltip` / `RichTooltip` (M3). Props: `isVisible`, `text`, `anchor: @Composable ()`.

**AppRangeSlider:** `RangeSlider` (M3). Props: `lowerValue`, `upperValue`, `onValueChange`, `range`, `step`, `showLabels`. Haptic feedback on grab and step change.

**AppColorPicker:** Custom Compose implementation (HSV wheel or palette grid). Props: `value: Color`, `onValueChange`, `label`, `showOpacity`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AppCarousel, AppTooltip, AppRangeSlider, AppColorPicker"
```

---

## Phase 7: Adaptive Wrappers (3)

### Task 27: AdaptiveNavShell

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveNavShell.kt`

**Reference:** iOS `AdaptiveNavShell.swift`, Web `AdaptiveNavShell.tsx`

Reads `LocalWindowSizeClass`:
- **Compact:** `NavigationBar` bottom tabs (icon + label per tab, brand color on active)
- **Medium/Expanded:** `NavigationRail` icon rail (60dp collapsed / 240dp expanded, animated toggle, tooltip on hover when collapsed)

Props: `tabs: List<NavTab>`, `selectedTab`, `onTabSelect`, `content: @Composable ()`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AdaptiveNavShell (bottom tabs / collapsible rail)"
```

---

### Task 28: AdaptiveSheet

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveSheet.kt`

**Reference:** iOS `AdaptiveSheet.swift`, Web `AdaptiveSheet.tsx`

Reads `LocalWindowSizeClass`:
- **Compact:** `ModalBottomSheet` (swipe-to-dismiss, rounded top corners)
- **Medium/Expanded:** `Dialog` (centered, max 480dp, overlay scrim)

Props: `isPresented`, `onDismiss`, `title`, `description`, `content: @Composable ()`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AdaptiveSheet (bottom sheet / modal dialog)"
```

---

### Task 29: AdaptiveSplitView

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveSplitView.kt`

**Reference:** Design doc section 3.4

Reads `LocalWindowSizeClass`:
- **Compact:** Single-pane push navigation (list only, detail on navigate)
- **Medium/Expanded:** `ListDetailPaneScaffold` (side-by-side)

Props: `listContent: @Composable ()`, `detailContent: @Composable ()`.

**Step 1: Implement, Step 2: Verify, Step 3: Commit**

```bash
git commit -m "feat: add AdaptiveSplitView (push nav / split pane)"
```

---

## Phase 8: Navigation, DI, Supabase, Home Screen

### Task 30: Hilt DI module + Supabase client

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/di/AppModule.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/supabase/SupabaseClientProvider.kt`

**Step 1: Write `SupabaseClientProvider.kt`** — creates Supabase client instance (URL + anon key from BuildConfig or hardcoded placeholder)

**Step 2: Write `AppModule.kt`** — Hilt `@Module` providing Supabase client as `@Singleton`

**Step 3: Verify, Step 4: Commit**

```bash
git commit -m "feat: add Hilt DI module and Supabase client provider"
```

---

### Task 31: Type-safe navigation + Home screen

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/navigation/Screen.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/home/HomeScreen.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/home/HomeViewModel.kt`
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/home/HomeScreenState.kt`
- Modify: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt`

**Step 1: Write `Screen.kt`** — `@Serializable sealed interface Screen { data object Home : Screen }`

**Step 2: Write `HomeScreenState.kt`** — sealed interface with Loading/Empty/Error/Populated

**Step 3: Write `HomeViewModel.kt`** — `@HiltViewModel`, `StateFlow<HomeScreenState>`, stub `load()` function

**Step 4: Write `HomeScreen.kt`** — `@Composable` that observes state, renders all four states using AppProgressLoader, AppButton (retry), etc.

**Step 5: Update `MainActivity.kt`** — Wire `WindowSizeClass`, `CompositionLocalProvider`, `AdaptiveNavShell`, `NavHost` with Home route

**Step 6: Verify**

```bash
./gradlew assembleDebug
```

**Step 7: Commit**

```bash
git commit -m "feat: add navigation, Home screen with 4-state pattern"
```

---

### Task 32: Component showcase screen

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/showcase/ShowcaseScreen.kt`
- Modify: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/navigation/Screen.kt` — add Showcase route

**Step 1: Write showcase** that renders every atomic component, pattern, and native wrapper (matching iOS ContentView showcase). Scrollable column with section headers.

**Step 2: Wire into navigation**

**Step 3: Verify, Step 4: Commit**

```bash
git commit -m "feat: add component showcase screen"
```

---

## Phase 9: CLAUDE.md + Documentation Updates

### Task 33: Write `multi-repo-android/CLAUDE.md`

**Files:**
- Create: `multi-repo-android/CLAUDE.md`

Platform-specific instructions covering:
- Stack: Kotlin 2.1, Jetpack Compose, Material 3, Hilt, supabase-kt
- Build command: `./gradlew assembleDebug`
- Architecture: hybrid (ui/ mirrors iOS, feature/ follows Android convention)
- Component file structure and naming
- Token system (DesignTokens.kt two-layer)
- Navigation pattern (type-safe sealed interface)
- Screen pattern (4 states, ViewModel + StateFlow)

**Step 1: Write, Step 2: Commit**

```bash
git commit -m "docs: add Android platform CLAUDE.md"
```

---

### Task 34: Update root CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (workspace root)

Add `## multi-repo-android` section after `## multi-repo-ios` with:
- Stack info
- Build commands
- Architecture overview
- Component conventions matching iOS section
- Reference to `multi-repo-android/CLAUDE.md` for details

Also update:
- Repository Structure section — add `multi-repo-android/`
- Cross-Platform Conventions — mention Android naming
- Screen Conventions — add Android column
- Any table that lists "Web | iOS" now lists "Web | iOS | Android"

**Step 1: Edit, Step 2: Commit from workspace root**

```bash
git add CLAUDE.md && git commit -m "docs: add Android platform to root CLAUDE.md"
```

---

### Task 35: Update docs/components.md

**Files:**
- Modify: `docs/components.md`

Add "Android Implementation" column to:
- Atomic components table
- Pattern components table
- Native wrappers table
- Adaptive wrappers table

Each cell: file path (e.g., `ui/components/AppButton.kt`) + status (Done)

**Step 1: Edit, Step 2: Commit**

```bash
git add docs/components.md && git commit -m "docs: add Android column to component registry"
```

---

### Task 36: Update docs/design-tokens.md

**Files:**
- Modify: `docs/design-tokens.md`

Add "Kotlin" column to token mapping tables. Example row:
`surfacesBrandInteractive | --surfaces-brand-interactive | Color.surfacesBrandInteractive | SemanticColors.surfacesBrandInteractive`

**Step 1: Edit, Step 2: Commit**

```bash
git add docs/design-tokens.md && git commit -m "docs: add Kotlin token names to design-tokens.md"
```

---

## Phase 10: Workspace Tooling Extensions

### Task 37: Extend hooks in .claude/settings.json

**Files:**
- Modify: `.claude/settings.json`

Extend each hook to include Android `.kt` file patterns:

1. **design-token-guard** — add condition: if file path contains `multi-repo-android` and ends `.kt`, block references to `PrimitiveColors.`
2. **native-wrapper-guard** — add Android raw API warnings: `TextField(`, `Button(` from `androidx.compose.material3`, `Surface(`, `LazyColumn(` in screen files
3. **adaptive-layout-guard** — check Android screen files for `LocalWindowSizeClass` or `WindowSizeClass`
4. **screen-structure-guard** — check Android `*Screen.kt` files for component imports
5. **comment-enforcer** — add `.kt` file check
6. **cross-platform-reminder** — remind of 2 counterparts when editing any platform

**Step 1: Edit settings.json, Step 2: Commit**

```bash
git add .claude/settings.json && git commit -m "chore: extend hooks for Android .kt file patterns"
```

---

### Task 38: Create android-native-components skill

**Files:**
- Create: `.claude/skills/android-native-components/SKILL.md`

**Reference:** `.claude/skills/ios-native-components/SKILL.md` (parallel structure)

Auto-invoked when building Android screens. Lists all 13 Android native wrappers with their props, backing APIs, and usage examples. Includes the "always use App* wrappers" rule.

**Step 1: Write skill, Step 2: Commit**

```bash
git add .claude/skills/android-native-components/ && git commit -m "feat: add android-native-components reference skill"
```

---

### Task 39: Extend cross-platform skills

**Files:**
- Modify: `.claude/skills/cross-platform-feature/SKILL.md` — add Android scaffold phase
- Modify: `.claude/skills/new-screen/SKILL.md` — add Android screen creation
- Modify: `.claude/skills/design-token-sync/SKILL.md` — add Kotlin generation step

For each skill, add a new phase/step that creates the Android counterpart file(s) matching the existing web + iOS patterns.

**Step 1: Edit all three skills, Step 2: Commit**

```bash
git add .claude/skills/ && git commit -m "feat: extend cross-platform skills for Android"
```

---

### Task 40: Extend agents for 3-way review

**Files:**
- Modify: `.claude/agents/cross-platform-reviewer.md` — add Android file discovery patterns
- Modify: `.claude/agents/design-consistency-checker.md` — add Kotlin token validation
- Modify: `.claude/agents/screen-reviewer.md` — add Android screen audit criteria
- Modify: `.claude/agents/complex-component-reviewer.md` — add Compose composition review

Each agent needs to:
1. Search `multi-repo-android/` alongside existing web/iOS paths
2. Know Android naming conventions (`*Screen.kt`, `ui/components/App*.kt`)
3. Check Android-specific patterns (WindowSizeClass, HiltViewModel, StateFlow)

**Step 1: Edit all agents, Step 2: Commit**

```bash
git add .claude/agents/ && git commit -m "feat: extend agents for 3-way cross-platform review"
```

---

### Task 41: Update PRD template

**Files:**
- Modify: `docs/PRDs/prd-template.md`

Add Android row to Cross-Platform Scope table and Data Model section:

```markdown
| Android (Compose) | feature/<name>/<Name>Screen.kt | [ ] |
```

```markdown
- Kotlin model: multi-repo-android/app/src/main/java/.../data/model/<Feature>Model.kt
```

**Step 1: Edit, Step 2: Commit**

```bash
git add docs/PRDs/ && git commit -m "docs: add Android to PRD template"
```

---

## Phase 11: Final Verification

### Task 42: Full build verification

**Step 1: Build Android project**

```bash
cd multi-repo-android && ./gradlew assembleDebug
```

Expected: BUILD SUCCESSFUL

**Step 2: Verify web still builds**

```bash
cd ../multi-repo-nextjs && npm run build
```

Expected: Build succeeds

**Step 3: Verify iOS still builds** (if Xcode available)

```bash
cd ../multi-repo-ios && xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios -destination 'platform=iOS Simulator,name=iPhone 17' build
```

**Step 4: Run cross-platform reviewer agent** to generate initial parity report

---

### Task 43: Final commits and summary

**Step 1: Ensure all changes are committed in all 3 repos**

```bash
# From workspace root
git status
git -C multi-repo-android status
git -C multi-repo-nextjs status
git -C multi-repo-ios status
```

**Step 2: Tag the Android repo**

```bash
cd multi-repo-android && git tag v0.1.0-scaffold
```

---

## Summary

| Phase | Tasks | What's Built |
|-------|-------|-------------|
| 1: Skeleton | 1-3 | Gradle config, manifest, Application + Activity, empty theme |
| 2: Tokens | 4-6 | DesignTokens.kt (80+ colors), Type.kt (28 styles), Theme.kt |
| 3: Icons | 7 | PhosphorIconHelper with size/weight/color tokens |
| 4: Atomics | 8-20 | 14 components (Button, Badge, InputField, Toast, etc.) |
| 5: Patterns | 21 | 4 pattern components (TextBlock, StepIndicator, Stepper, ListItem) |
| 6: Natives | 22-26 | 13 native wrappers + NativeComponentStyling.kt |
| 7: Adaptive | 27-29 | 3 adaptive wrappers (NavShell, Sheet, SplitView) |
| 8: Navigation | 30-32 | Hilt DI, Supabase, Navigation, Home + Showcase screens |
| 9: Docs | 33-36 | CLAUDE.md files, components.md, design-tokens.md |
| 10: Tooling | 37-41 | Hooks, skills, agents, PRD template — all 3-way |
| 11: Verify | 42-43 | Full build, cross-platform parity check |
