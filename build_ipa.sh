#!/bin/bash
set -e

# ==============================================================================
# Script d'empaquetage 1-clic pour générer AuraCampus.ipa
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_DIR="$PROJECT_DIR/ios-app"
BUILD_DIR="$IOS_DIR/build"
OUTPUT_IPA="$PROJECT_DIR/AuraCampus.ipa"
PAYLOAD_DIR="$PROJECT_DIR/build_temp/Payload"

echo "🚀 [1/5] Régénération du projet Xcode avec xcodegen..."
cd "$IOS_DIR"
xcodegen generate

echo "🔨 [2/5] Compilation Release (prête pour signature personnalisée)..."
xcodebuild -project AuraCampus.xcodeproj \
  -scheme AuraCampus \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  BUILD_DIR="$BUILD_DIR" \
  clean build \
  -quiet

echo "📦 [3/5] Préparation du dossier Payload..."
rm -rf "$PROJECT_DIR/build_temp"
mkdir -p "$PAYLOAD_DIR"
cp -R "$BUILD_DIR/Release-iphoneos/AuraCampus.app" "$PAYLOAD_DIR/"

# Nettoyage complet des signatures et attributs étendus
rm -rf "$PAYLOAD_DIR/AuraCampus.app/_CodeSignature"
rm -f "$PAYLOAD_DIR/AuraCampus.app/embedded.mobileprovision"
xattr -cr "$PAYLOAD_DIR/AuraCampus.app"

echo "🗜️  [4/5] Création de l'archive AuraCampus.ipa vierge de signature..."
rm -f "$OUTPUT_IPA"
cd "$PROJECT_DIR/build_temp"
zip -qr "$OUTPUT_IPA" Payload
rm -rf "$PROJECT_DIR/build_temp"

echo ""
echo "🎉 SUCCÈS ! Votre fichier IPA est prêt :"
ls -lh "$OUTPUT_IPA"
echo ""
echo "Pour l'installer sur votre iPhone :"
echo "1. Branchez votre iPhone en USB."
echo "2. Ouvrez Xcode > Window > Devices and Simulators (Cmd + Shift + 2)."
echo "3. Glissez-déposez $OUTPUT_IPA dans 'Installed Apps'."
echo "=============================================================================="
