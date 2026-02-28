#!/usr/bin/env bash
# strip-auth.sh — Remove Supabase, Auth, and GoogleSignIn from scaffolded project
# Called when no Supabase project ref is provided (local-first app).
#
# Usage: ./scripts/strip-auth.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android>

set -euo pipefail

TARGET_DIR="${1:?Usage: strip-auth.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android>}"
APP_SLUG="${2:?Missing app-slug}"
INCLUDE_WEB="${3:-false}"
INCLUDE_IOS="${4:-false}"
INCLUDE_ANDROID="${5:-false}"

APP_SLUG_UNDERSCORE="${APP_SLUG//-/_}"

echo "Stripping auth & Supabase (no Supabase ref provided)..."

# ── iOS ──────────────────────────────────────────────────────────────────────

if [ "$INCLUDE_IOS" = "true" ]; then
  IOS_SRC="$TARGET_DIR/${APP_SLUG}-ios/${APP_SLUG}-ios"

  if [ -d "$IOS_SRC" ]; then
    echo "  iOS: removing Auth/, Supabase/, Views/Auth/, Models/ProfileModel.swift..."
    rm -rf "$IOS_SRC/Auth" 2>/dev/null || true
    rm -rf "$IOS_SRC/Supabase" 2>/dev/null || true
    rm -rf "$IOS_SRC/Views/Auth" 2>/dev/null || true
    rm -f "$IOS_SRC/Models/ProfileModel.swift" 2>/dev/null || true

    # Remove Secrets files from iOS root
    rm -f "$TARGET_DIR/${APP_SLUG}-ios/Secrets.swift" 2>/dev/null || true
    rm -f "$TARGET_DIR/${APP_SLUG}-ios/Secrets.example.swift" 2>/dev/null || true

    # Simplify app entry point — remove auth gate
    APP_SWIFT="$IOS_SRC/${APP_SLUG_UNDERSCORE}_iosApp.swift"
    if [ -f "$APP_SWIFT" ]; then
      echo "  iOS: simplifying app entry point..."
      cat > "$APP_SWIFT" << 'SWIFT_EOF'
//
//  APP_SLUG_UNDERSCORE_iosApp.swift
//  APP_SLUG-ios
//

import SwiftUI

@main
struct APP_SLUG_UNDERSCORE_iosApp: App {
    init() {
        NativeBottomNavStyling.applyAppearance()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onTapGesture {
                    UIApplication.shared.sendAction(
                        #selector(UIResponder.resignFirstResponder),
                        to: nil, from: nil, for: nil
                    )
                }
        }
    }
}
SWIFT_EOF
      # Replace placeholders
      perl -pi -e "s/APP_SLUG_UNDERSCORE/${APP_SLUG_UNDERSCORE}/g" "$APP_SWIFT"
      perl -pi -e "s/APP_SLUG/${APP_SLUG}/g" "$APP_SWIFT"
    fi

    # Clean Info.plist — remove Google OAuth entries
    INFO_PLIST="$IOS_SRC/Info.plist"
    if [ -f "$INFO_PLIST" ]; then
      echo "  iOS: cleaning Info.plist..."
      # Remove GIDClientID and CFBundleURLTypes blocks; keep camera/microphone
      perl -0777 -pi -e 's/\s*<key>GIDClientID<\/key>\s*<string>[^<]*<\/string>//gs' "$INFO_PLIST"
      perl -0777 -pi -e 's/\s*<key>CFBundleURLTypes<\/key>\s*<array>.*<\/array>//gs' "$INFO_PLIST"
      perl -0777 -pi -e 's/\s*<key>NSAppTransportSecurity<\/key>\s*<dict>.*?<\/dict>//gs' "$INFO_PLIST"
    fi

    # Strip SPM packages from pbxproj
    PBXPROJ="$TARGET_DIR/${APP_SLUG}-ios/${APP_SLUG}-ios.xcodeproj/project.pbxproj"
    if [ -f "$PBXPROJ" ]; then
      echo "  iOS: removing Supabase & GoogleSignIn SPM packages from pbxproj..."

      # Step 1: Remove full multi-line blocks FIRST (before single-line removals)
      # Remove XCSwiftPackageProductDependency blocks by productName
      perl -0777 -pi -e 's/\t\t\w+\s*\/\*\s*(?:Auth|Functions|PostgREST|Realtime|Storage|Supabase|GoogleSignIn|GoogleSignInSwift)\s*\*\/\s*=\s*\{\n(?:\t\t\t[^\n]*\n)*?\t\t\};\n//gs' "$PBXPROJ"

      # Remove XCRemoteSwiftPackageReference blocks by repositoryURL
      perl -0777 -pi -e 's/\t\t\w+\s*\/\*\s*XCRemoteSwiftPackageReference "supabase-swift"\s*\*\/\s*=\s*\{\n(?:\t\t\t[^\n]*\n)*?\t\t\};\n//gs' "$PBXPROJ"
      perl -0777 -pi -e 's/\t\t\w+\s*\/\*\s*XCRemoteSwiftPackageReference "GoogleSignIn-iOS"\s*\*\/\s*=\s*\{\n(?:\t\t\t[^\n]*\n)*?\t\t\};\n//gs' "$PBXPROJ"

      # Step 2: Remove single-line references (PBXBuildFile entries, array references)
      perl -ni -e 'print unless /Auth in Frameworks|Functions in Frameworks|PostgREST in Frameworks|Realtime in Frameworks|Storage in Frameworks|Supabase in Frameworks|GoogleSignIn in Frameworks|GoogleSignInSwift in Frameworks/' "$PBXPROJ"

      # Remove packageProductDependencies array entries (lines ending with comma)
      perl -ni -e 'print unless /^\t{3,}\w+\s+\/\*\s*(?:Auth|Functions|PostgREST|Realtime|Storage|Supabase|GoogleSignIn|GoogleSignInSwift)\s*\*\/\s*,/' "$PBXPROJ"

      # Remove packageReferences array entries for supabase-swift and GoogleSignIn-iOS
      perl -ni -e 'print unless /supabase-swift|GoogleSignIn-iOS/' "$PBXPROJ"
    fi

    # Remove stale Package.resolved
    rm -f "$TARGET_DIR/${APP_SLUG}-ios/${APP_SLUG}-ios.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved" 2>/dev/null || true
  fi
fi

# ── Web ──────────────────────────────────────────────────────────────────────

if [ "$INCLUDE_WEB" = "true" ]; then
  WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"

  if [ -d "$WEB_DIR" ]; then
    echo "  Web: removing auth & Supabase files..."
    rm -rf "$WEB_DIR/lib/auth" 2>/dev/null || true
    rm -rf "$WEB_DIR/lib/supabase" 2>/dev/null || true
    rm -rf "$WEB_DIR/app/(auth)" 2>/dev/null || true
    rm -rf "$WEB_DIR/app/auth" 2>/dev/null || true
    rm -f "$WEB_DIR/middleware.ts" 2>/dev/null || true
    rm -f "$WEB_DIR/lib/database.types.ts" 2>/dev/null || true

    # Simplify layout — remove auth context wrapper if present
    LAYOUT="$WEB_DIR/app/layout.tsx"
    if [ -f "$LAYOUT" ]; then
      perl -ni -e 'print unless /AuthProvider|auth-context|supabase/' "$LAYOUT"
    fi

    # Remove @supabase packages from package.json
    PACKAGE_JSON="$WEB_DIR/package.json"
    if [ -f "$PACKAGE_JSON" ]; then
      echo "  Web: removing Supabase npm packages..."
      jq 'del(.dependencies["@supabase/supabase-js"], .dependencies["@supabase/ssr"], .dependencies["@supabase/auth-helpers-nextjs"])' \
        "$PACKAGE_JSON" > "${PACKAGE_JSON}.tmp" && mv "${PACKAGE_JSON}.tmp" "$PACKAGE_JSON"
    fi
  fi
fi

# ── Android ──────────────────────────────────────────────────────────────────

if [ "$INCLUDE_ANDROID" = "true" ]; then
  ANDROID_DIR="$TARGET_DIR/${APP_SLUG}-android"

  if [ -d "$ANDROID_DIR" ]; then
    echo "  Android: removing auth & Supabase files..."
    # Find and remove auth-related directories
    find "$ANDROID_DIR" -type d -name "auth" -exec rm -rf {} + 2>/dev/null || true
    find "$ANDROID_DIR" -name "ProfileModel.kt" -delete 2>/dev/null || true

    # Remove Supabase deps from build.gradle
    BUILD_GRADLE="$ANDROID_DIR/app/build.gradle.kts"
    if [ -f "$BUILD_GRADLE" ]; then
      echo "  Android: removing Supabase gradle dependencies..."
      perl -ni -e 'print unless /supabase|google.*auth|credential/i' "$BUILD_GRADLE"
    fi
  fi
fi

# ── Root cleanup ─────────────────────────────────────────────────────────────

# Remove supabase/ migrations directory if present
rm -rf "$TARGET_DIR/supabase" 2>/dev/null || true

# Strip auth sections from root CLAUDE.md
CLAUDE_MD="$TARGET_DIR/CLAUDE.md"
if [ -f "$CLAUDE_MD" ]; then
  echo "  Cleaning auth references from CLAUDE.md..."
  # Remove the Authentication section
  perl -0777 -pi -e 's/## Authentication\n.*?(?=\n## |\z)//s' "$CLAUDE_MD"
fi

echo "Auth & Supabase stripping complete."
