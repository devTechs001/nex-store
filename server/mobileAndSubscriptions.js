// ============================================================================
// NEX STORE — SUBSCRIPTIONS (ADMIN/DEV MODIFIABLE) & MOBILE (FLUTTER/NATIVE) HUB
// © 2026 NEX STORE & DEVTECHS001 LABS. ALL RIGHTS RESERVED.
// STRICTLY PROPRIETARY — DO NOT SHARE, REDISTRIBUTE, OR PIRATE THIS CODE.
// ============================================================================

export const SEED_SUBSCRIPTION_PLANS = [
  {
    id: 'plan-community-free',
    code: 'COMMUNITY_FREE',
    name: 'Community & Maker',
    tagline: 'Essential access to NEX Hardware Store, PWA Offline Mode & Verified Sandboxed Apps.',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    tier_level: 1,
    badge: 'FREE FOREVER',
    features_json: JSON.stringify([
      'Install up to 5 Sandboxed Apps (/opt/nex-apps/*)',
      'Full Progressive Web App (PWA) Offline Mode',
      '5-Slot Hardware BTO Configurator Access',
      'Standard Community Support & Order Tracker',
      'Read-Only SQLite Studio & NEX-SH Basic CLI'
    ]),
    limits_json: JSON.stringify({
      maxAppsPublished: 1,
      polyglotRunsPerDay: 25,
      mobileSdkNodes: 1,
      slaUptime: '99.5%'
    }),
    is_popular: 0,
    active: 1,
    updated_by: 'System Seed',
    updated_at: '2026-10-31T09:00:00Z'
  },
  {
    id: 'plan-pro-developer',
    code: 'PRO_DEV_PUBLISHER',
    name: 'Pro Developer & Publisher',
    tagline: 'Publish Apps & System Packages via API, run Polyglot AI Studio, and extract live URL resources.',
    price_monthly: 29,
    price_yearly: 290,
    currency: 'USD',
    tier_level: 2,
    badge: 'MOST POPULAR',
    features_json: JSON.stringify([
      'Unlimited App & System Package Publishing (POST /api/developer/publish)',
      'Polyglot AI Automation Studio (Python, Rust, C++, Java, Go, TS)',
      'Live URL Image, Metadata & OpenGraph Resource Extractor',
      'Verified Publisher Badge & Ed25519 SHA-256 Package Signing',
      'Standalone .html & System Bundle Export with DRM Lock'
    ]),
    limits_json: JSON.stringify({
      maxAppsPublished: 50,
      polyglotRunsPerDay: 1000,
      mobileSdkNodes: 5,
      slaUptime: '99.9%'
    }),
    is_popular: 1,
    active: 1,
    updated_by: 'Admin / DevOps',
    updated_at: '2026-10-31T09:30:00Z'
  },
  {
    id: 'plan-mobile-flutter',
    code: 'MOBILE_FLUTTER_SDK',
    name: 'Mobile & Flutter Add-On Partner',
    tagline: 'Full Flutter, React Native, Kotlin & SwiftUI SDK bridge for mobile companion apps & OTA modules.',
    price_monthly: 59,
    price_yearly: 590,
    currency: 'USD',
    tier_level: 3,
    badge: 'FLUTTER + NATIVE',
    features_json: JSON.stringify([
      'Flutter MethodChannel & Impeller Mini-App Runtime Bridge',
      'React Native JSI TurboModule Offline SQLite WAL Sync',
      'iOS SwiftUI & Android Kotlin Biometric Passkey Auth',
      'BLE Hardware BTO Rig Thermal & Wattage Companion Stream',
      'Dedicated Mobile WebSocket Push Gateway (/ws)'
    ]),
    limits_json: JSON.stringify({
      maxAppsPublished: 150,
      polyglotRunsPerDay: 5000,
      mobileSdkNodes: 25,
      slaUptime: '99.95%'
    }),
    is_popular: 0,
    active: 1,
    updated_by: 'Mobile Platform Lead',
    updated_at: '2026-10-31T10:00:00Z'
  },
  {
    id: 'plan-enterprise-fleet',
    code: 'ENTERPRISE_ANYCAST',
    name: 'Enterprise Polyglot & BTO Fleet',
    tagline: 'Dedicated 6-region Anycast server nodes, custom hardware BTO fleet SLA, and white-glove WAF.',
    price_monthly: 199,
    price_yearly: 1990,
    currency: 'USD',
    tier_level: 4,
    badge: 'ENTERPRISE SLA',
    features_json: JSON.stringify([
      'Dedicated 6-Region Global Anycast Edge Cluster',
      'Unlimited Custom System, Driver & Kernel Package Publishing',
      'Priority BTO Hardware Workstation Fulfillment & 12% Fleet Discount',
      'Custom Admin & Developer Subscription Tier Modification API',
      '24/7 SecOps WAF, DDoS Scrubber & Anti-Piracy DRM Enforcement'
    ]),
    limits_json: JSON.stringify({
      maxAppsPublished: 9999,
      polyglotRunsPerDay: 100000,
      mobileSdkNodes: 500,
      slaUptime: '99.99%'
    }),
    is_popular: 0,
    active: 1,
    updated_by: 'Enterprise Architect',
    updated_at: '2026-10-31T10:30:00Z'
  }
];

export const SEED_USER_SUBSCRIPTIONS = [
  {
    id: 'sub-usr-01',
    plan_id: 'plan-pro-developer',
    plan_name: 'Pro Developer & Publisher',
    subscriber_name: 'Dr. Elena Vance (@elena_quantum)',
    subscriber_email: 'elena@quantum-studio.dev',
    billing_cycle: 'monthly',
    amount_paid: 29,
    status: 'ACTIVE',
    api_key_preview: 'nex_live_9f8a7b6c...e4d1',
    subscribed_at: '2026-10-25T14:20:00Z'
  },
  {
    id: 'sub-usr-02',
    plan_id: 'plan-mobile-flutter',
    plan_name: 'Mobile & Flutter Add-On Partner',
    subscriber_name: 'Koji Tanaka (@koji_dsp)',
    subscriber_email: 'koji@TokyoAudioLab.jp',
    billing_cycle: 'yearly',
    amount_paid: 590,
    status: 'ACTIVE',
    api_key_preview: 'nex_live_3c2d1e0f...a9b8',
    subscribed_at: '2026-10-28T08:15:00Z'
  },
  {
    id: 'sub-usr-03',
    plan_id: 'plan-enterprise-fleet',
    plan_name: 'Enterprise Polyglot & BTO Fleet',
    subscriber_name: 'Nairobi FinTech Cloud Ops',
    subscriber_email: 'infra@nairobi-cloud.ke',
    billing_cycle: 'monthly',
    amount_paid: 199,
    status: 'ACTIVE',
    api_key_preview: 'nex_live_7e6f5a4b...c3d2',
    subscribed_at: '2026-10-30T11:45:00Z'
  }
];

export const SEED_MOBILE_ADDONS = [
  {
    id: 'mob-flutter-bridge',
    name: 'Flutter Impeller Super-App & Sandbox Bridge',
    slug: 'flutter-bridge-sdk',
    framework: 'Flutter (Dart 3.5 • iOS / Android)',
    version: '2.4.0-add-on',
    status: 'READY',
    category: 'Mobile Container Runtime',
    description: 'Embeds NEX Store, App Store sandboxes, and real-time WebSocket telemetry directly inside Flutter mobile apps via MethodChannel and EventChannel.',
    endpoint_path: '/api/mobile/sdk-config?framework=flutter',
    sdk_snippet: `// © 2026 NEX STORE PROPRIETARY DRM — FLUTTER ADD-ON SDK
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class NexStoreFlutterBridge {
  static const MethodChannel _channel = MethodChannel('ai.nexstore.mobile/bridge');
  final String baseUrl;
  NexStoreFlutterBridge({this.baseUrl = 'https://nex-store.edge.app'});

  Future<Map<String, dynamic>> fetchStoreBootstrap() async {
    final res = await http.get(Uri.parse('$baseUrl/api/bootstrap'));
    return jsonDecode(res.body);
  }

  Future<void> mountSandboxedApp(String appId) async {
    await _channel.invokeMethod('mountNexSandbox', {'appId': appId, 'drmLock': true});
  }
}`,
    enabled: 1,
    updated_at: '2026-10-31T10:00:00Z'
  },
  {
    id: 'mob-rn-turbomodule',
    name: 'React Native JSI TurboModule & SQLite Sync',
    slug: 'rn-turbomodule-sync',
    framework: 'React Native 0.76 (New Architecture / Expo)',
    version: '1.8.2-add-on',
    status: 'READY',
    category: 'Offline-First Data Sync',
    description: 'Zero-bridge C++ JSI TurboModule that mirrors NEX Store SQLite WAL tables and push notifications to iOS & Android devices.',
    endpoint_path: '/api/mobile/sdk-config?framework=react-native',
    sdk_snippet: `// © 2026 NEX STORE PROPRIETARY DRM — REACT NATIVE JSI BRIDGE
import { NativeModules, NativeEventEmitter } from 'react-native';

export async function syncNexMobileCatalog(apiBase = '') {
  const response = await fetch(\`\${apiBase}/api/developer/apps\`);
  const { apps } = await response.json();
  return apps;
}`,
    enabled: 1,
    updated_at: '2026-10-31T10:15:00Z'
  },
  {
    id: 'mob-native-passkey',
    name: 'SwiftUI & Kotlin Biometric Passkey + DRM Signer',
    slug: 'native-biometric-passkey',
    framework: 'SwiftUI (iOS 18) & Jetpack Compose (Android 15)',
    version: '3.0.1-add-on',
    status: 'READY',
    category: 'Mobile Security & Auth',
    description: 'Hardware Secure Enclave / StrongBox Ed25519 signature verification for publishing apps and approving BTO workstation orders on mobile.',
    endpoint_path: '/api/security/rotate-keys',
    sdk_snippet: `// © 2026 NEX STORE PROPRIETARY DRM — KOTLIN / SWIFT NATIVE AUTH
// Verifies SHA-256 package signature & hardware passkey before mounting mobile add-on
fun verifyNexMobilePackage(appId: String, sha256: String): Boolean {
    return sha256.length >= 32 && appId.startsWith("app-")
}`,
    enabled: 1,
    updated_at: '2026-10-31T10:30:00Z'
  },
  {
    id: 'mob-ble-bto-rig',
    name: 'BLE Hardware Rig Thermal & Wattage Companion',
    slug: 'mobile-ble-rig-monitor',
    framework: 'Flutter & React Native BLE Peripheral',
    version: '1.2.0-future',
    status: 'BETA ADD-ON',
    category: 'Hardware IoT Telemetry',
    description: 'Pairs with NEX NovaBook and custom 5-slot BTO rigs over Bluetooth Low Energy to stream live GPU/NPU wattage, fan curves, and thermal alerts to your phone.',
    endpoint_path: '/api/bto/configs',
    sdk_snippet: `// © 2026 NEX STORE PROPRIETARY DRM — BLE HARDWARE COMPANION
// Streams 5-Slot BTO wattage & thermal telemetry to mobile dashboard
const BLE_SERVICE_UUID = "0000nex5-0000-1000-8000-00805f9b34fb";`,
    enabled: 1,
    updated_at: '2026-10-31T10:45:00Z'
  },
  {
    id: 'mob-ar-cad-preview',
    name: 'ARKit / ARCore Spatial 3D CAD Desk Placement',
    slug: 'mobile-ar-cad-preview',
    framework: 'VisionOS / ARKit / Flutter SceneView',
    version: '0.9.5-future',
    status: 'FUTURE ROADMAP',
    category: 'Spatial Commerce',
    description: 'Future add-on room enabling 1:1 scale augmented reality desk placement of NEX hardware products and multi-monitor BTO workstations.',
    endpoint_path: '/api/product-art/prod-aether-pro.svg?view=angle',
    sdk_snippet: `// © 2026 NEX STORE PROPRIETARY DRM — SPATIAL AR ADD-ON
// Loads 4-angle procedural CAD geometry into mobile AR viewport`,
    enabled: 1,
    updated_at: '2026-10-31T11:00:00Z'
  }
];

export function formatSubscriptionPlan(row) {
  if (!row) return null;
  let features = [];
  let limits = {};
  try {
    features = typeof row.features_json === 'string' ? JSON.parse(row.features_json) : row.features || [];
  } catch {
    features = [];
  }
  try {
    limits = typeof row.limits_json === 'string' ? JSON.parse(row.limits_json) : row.limits || {};
  } catch {
    limits = {};
  }
  return {
    ...row,
    is_popular: Boolean(row.is_popular),
    active: Boolean(row.active),
    features,
    limits
  };
}
