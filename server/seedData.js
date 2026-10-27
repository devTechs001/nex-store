export const SEED_CATEGORIES = [
  {
    id: 'cat-audio',
    name: 'Spatial Audio',
    slug: 'audio',
    description: 'Studio-grade headphones, DACs, and acoustic architecture',
    icon: 'Headphones',
    accent_color: '#6366f1'
  },
  {
    id: 'cat-compute',
    name: 'Next-Gen Compute',
    slug: 'compute',
    description: 'Neural workstations, ultrabooks, and OLED creator displays',
    icon: 'Laptop',
    accent_color: '#06b6d4'
  },
  {
    id: 'cat-peripherals',
    name: 'Precision Peripherals',
    slug: 'peripherals',
    description: 'Hall-effect mechanical keyboards, carbon mice, and control surfaces',
    icon: 'Keyboard',
    accent_color: '#10b981'
  },
  {
    id: 'cat-wearables',
    name: 'Biometric & Spatial',
    slug: 'wearables',
    description: 'Titanium smartwatches, AR optics, and health telemetry rings',
    icon: 'Watch',
    accent_color: '#f59e0b'
  },
  {
    id: 'cat-imaging',
    name: 'Optics & Aerial',
    slug: 'imaging',
    description: 'Cinema mirrorless cameras, autonomous drones, and gimbals',
    icon: 'Camera',
    accent_color: '#ec4899'
  },
  {
    id: 'cat-power',
    name: 'GaN Power & Desk',
    slug: 'power',
    description: 'Solid-state power stations, MagSafe docks, and modular lighting',
    icon: 'Zap',
    accent_color: '#8b5cf6'
  }
];

export const SEED_PRODUCTS = [
  {
    id: 'prod-aether-pro',
    sku: 'NEX-AUD-001',
    name: 'Aether Pro X1 Planar Headphones',
    tagline: '106mm planar magnetic drivers with adaptive neural ANC',
    description: 'Engineered from CNC-milled aerospace magnesium and lambskin acoustic memory foam. The Aether Pro X1 delivers zero-distortion reference sound with dual-chip adaptive noise cancellation, lossless ultra-wideband wireless audio, and 52-hour battery stamina.',
    category: 'audio',
    brand: 'NEX Acoustic',
    price: 449.00,
    original_price: 549.00,
    cost_price: 240.00,
    stock: 24,
    low_stock_threshold: 6,
    rating: 4.9,
    review_count: 142,
    sold_count: 890,
    featured: 1,
    is_flash_sale: 1,
    flash_sale_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
    badge: 'FLASH DEAL',
    image_url: '/api/product-art/prod-aether-pro.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Acoustic Chamber', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Frequency Spec', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Driver: '106mm Nanoscale Planar Magnetic',
      Impedance: '32 Ohms Ultra-Linear',
      'Frequency Response': '5 Hz – 55,000 Hz',
      Connectivity: 'Bluetooth 5.4 Lossless + USB-C 32-bit/384kHz DAC',
      Battery: '52 Hours ANC On (Fast Charge: 10m = 8h)',
      Weight: '318g Machined Magnesium Chassis'
    }),
    colors_json: JSON.stringify([
      { name: 'Obsidian Black', hex: '#18181b' },
      { name: 'Titanium Silver', hex: '#94a3b8' },
      { name: 'Cobalt Indigo', hex: '#4f46e5' }
    ]),
    tags_json: JSON.stringify(['planar', 'anc', 'wireless', 'lossless', 'studio', 'audiophile'])
  },
  {
    id: 'prod-chronos-key',
    sku: 'NEX-PER-002',
    name: 'Chronos 75 Hall-Effect Keyboard',
    tagline: 'Rapid-trigger magnetic switches with 8000Hz hyper-polling',
    description: 'Gasket-mounted CNC 6063 aluminum keyboard featuring adjustable 0.1mm–4.0mm magnetic Hall-Effect switches, rotary OLED command dial, acoustic poron dampening layers, and hot-swappable zero-latency wireless connectivity.',
    category: 'peripherals',
    brand: 'NEX Input',
    price: 229.00,
    original_price: 269.00,
    cost_price: 115.00,
    stock: 18,
    low_stock_threshold: 5,
    rating: 4.9,
    review_count: 98,
    sold_count: 645,
    featured: 1,
    is_flash_sale: 0,
    flash_sale_ends_at: null,
    badge: 'BESTSELLER',
    image_url: '/api/product-art/prod-chronos-key.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Switch Cutaway', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Actuation Graph', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Switches: 'NEX Raiden Magnetic Hall-Effect (0.1mm Rapid Trigger)',
      Polling: '8000Hz Wired / 4000Hz 2.4GHz Wireless',
      Chassis: '2.1kg CNC Anodized 6063 Aluminum + Brass Weight',
      Display: '1.4" Full-Color IPS Telemetry Screen + Rotary Encoder',
      Keycaps: 'Double-Shot PBT Cherry Profile',
      Battery: '6000mAh Dual-Cell (Up to 240 Hours)'
    }),
    colors_json: JSON.stringify([
      { name: 'Space Grey', hex: '#334155' },
      { name: 'Arctic White', hex: '#e2e8f0' },
      { name: 'Emerald Cyber', hex: '#10b981' }
    ]),
    tags_json: JSON.stringify(['keyboard', 'mechanical', 'hall-effect', '8000hz', 'aluminum', 'gaming'])
  },
  {
    id: 'prod-nova-book',
    sku: 'NEX-CMP-003',
    name: 'NovaBook Pro 16 OLED Workstation',
    tagline: '16" 4K 240Hz Tandem OLED with 120 TOPS Neural Engine',
    description: 'Ultra-thin 14.9mm unibody workstation engineered for AI engineering, 8K color grading, and real-time 3D rendering. Features vapor-chamber liquid metal cooling, 64GB unified LPDDR5X memory, and 22 hours of battery life.',
    category: 'compute',
    brand: 'NEX Systems',
    price: 2399.00,
    original_price: 2699.00,
    cost_price: 1650.00,
    stock: 9,
    low_stock_threshold: 4,
    rating: 4.8,
    review_count: 67,
    sold_count: 312,
    featured: 1,
    is_flash_sale: 1,
    flash_sale_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 9).toISOString(),
    badge: 'PRO WORKSTATION',
    image_url: '/api/product-art/prod-nova-book.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Thermal Architecture', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Benchmark Matrix', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Processor: '16-Core NEX-M4 Ultra + 120 TOPS NPU',
      Display: '16.2" Tandem OLED 3840x2400, 240Hz, 1600 nits HDR',
      Memory: '64GB Unified LPDDR5X (8533 MT/s)',
      Storage: '2TB PCIe Gen5 NVMe SSD (14,200 MB/s)',
      Ports: '3x Thunderbolt 5, HDMI 2.1, SD Express 8.0, MagPower',
      Weight: '1.68 kg Aerospace Unibody'
    }),
    colors_json: JSON.stringify([
      { name: 'Midnight Carbon', hex: '#0f172a' },
      { name: 'Starlight Silver', hex: '#cbd5e1' }
    ]),
    tags_json: JSON.stringify(['laptop', 'oled', 'workstation', 'ai', 'thunderbolt-5', 'creator'])
  },
  {
    id: 'prod-solaris-watch',
    sku: 'NEX-WRB-004',
    name: 'Solaris Apex Titanium Chronometer',
    tagline: 'Grade-5 titanium biometric watch with sapphire solar charging',
    description: 'Built for endurance athletes and deep-tech explorers. Features dual-frequency L1+L5 satellite navigation, continuous ECG & VO2 Max telemetry, 100m dive certification, and 34-day solar-assisted battery life.',
    category: 'wearables',
    brand: 'NEX Biometrics',
    price: 599.00,
    original_price: 699.00,
    cost_price: 310.00,
    stock: 15,
    low_stock_threshold: 5,
    rating: 4.9,
    review_count: 118,
    sold_count: 520,
    featured: 1,
    is_flash_sale: 0,
    flash_sale_ends_at: null,
    badge: 'TITANIUM SERIES',
    image_url: '/api/product-art/prod-solaris-watch.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Sensor Array', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Biometric Spec', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Case: '47mm Grade-5 Brushed Titanium + Sapphire Crystal',
      Display: '1.5" LTPO Micro-OLED (3000 nits Peak Brightness)',
      Sensors: 'BioTracker 6.0 (ECG, SpO2, Skin Temp, Arterial Stiffness)',
      Navigation: 'Dual-Band Multi-GNSS + Offline Topographic Maps',
      WaterResistance: '10 ATM / EN13319 Dive Certified to 100m',
      Battery: 'Up to 34 Days Solar Standby / 95h Continuous GPS'
    }),
    colors_json: JSON.stringify([
      { name: 'Raw Titanium', hex: '#64748b' },
      { name: 'Stealth DLC Black', hex: '#1e293b' },
      { name: 'Alpine Orange Band', hex: '#f97316' }
    ]),
    tags_json: JSON.stringify(['smartwatch', 'titanium', 'gps', 'biometric', 'solar', 'wearable'])
  },
  {
    id: 'prod-volt-gan',
    sku: 'NEX-PWR-005',
    name: 'VoltMatrix 240W GaN Desktop Hub',
    tagline: '6-port GaN Prime power station with real-time OLED wattmeter',
    description: 'Eliminate cable clutter with a single desktop power command center. Dynamically distributes up to 240W across 4 USB-C PD 3.1 ports and 2 USB-A ports, while displaying live per-port voltage, current, and thermal telemetry.',
    category: 'power',
    brand: 'NEX Power',
    price: 149.00,
    original_price: 189.00,
    cost_price: 68.00,
    stock: 32,
    low_stock_threshold: 8,
    rating: 4.8,
    review_count: 204,
    sold_count: 1420,
    featured: 0,
    is_flash_sale: 1,
    flash_sale_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    badge: 'FLASH DEAL',
    image_url: '/api/product-art/prod-volt-gan.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'GaN Architecture', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Power Curve', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      TotalOutput: '240W Continuous PD 3.1 EPR',
      SinglePortMax: '140W USB-C1 / C2 (MacBook Pro 16 Fast Charge)',
      Telemetry: '2.0" Live IPS Wattage, Voltage & Temperature Graph',
      Protection: 'ActiveShield 4.0 (3.2M thermal checks per day)',
      WirelessPad: '15W Qi2 Magnetic Fast Charging Top Deck',
      Dimensions: '108 x 74 x 42 mm'
    }),
    colors_json: JSON.stringify([
      { name: 'Graphite Matte', hex: '#27272a' },
      { name: 'Glacier Silver', hex: '#cbd5e1' }
    ]),
    tags_json: JSON.stringify(['charger', 'gan', 'usb-c', '240w', 'desk-setup', 'qi2'])
  },
  {
    id: 'prod-lumina-cam',
    sku: 'NEX-IMG-006',
    name: 'Lumina FX9 Full-Frame Cinema Camera',
    tagline: '8K 60fps global shutter sensor with 16-stop dynamic range',
    description: 'Compact full-frame cinema powerhouse featuring an active-cooled 45MP global shutter CMOS sensor, internal 16-bit RAW recording, AI subject lidar autofocus, and 5-axis 8.0-stop in-body image stabilization.',
    category: 'imaging',
    brand: 'NEX Optics',
    price: 3199.00,
    original_price: 3499.00,
    cost_price: 2150.00,
    stock: 4,
    low_stock_threshold: 5,
    rating: 5.0,
    review_count: 41,
    sold_count: 175,
    featured: 1,
    is_flash_sale: 0,
    flash_sale_ends_at: null,
    badge: 'LOW STOCK',
    image_url: '/api/product-art/prod-lumina-cam.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Sensor Stack', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Dynamic Range', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Sensor: '35mm Full-Frame 45.2MP Global Shutter BSI CMOS',
      Video: '8K 60p 16-bit RAW / 4K 120p 4:2:2 10-bit All-I',
      DynamicRange: '16.2 Stops Dual Native ISO (800 / 6400)',
      Stabilization: '8.0-Stop 5-Axis Active Gyro IBIS',
      Autofocus: '759-Point Phase Detection + 3D LiDAR Rangefinder',
      Media: 'Dual CFexpress Type B + Full-Size HDMI 2.1'
    }),
    colors_json: JSON.stringify([
      { name: 'Cinema Matte Black', hex: '#171717' },
      { name: 'Cine Titanium', hex: '#737373' }
    ]),
    tags_json: JSON.stringify(['camera', '8k', 'cinema', 'full-frame', 'global-shutter', 'video'])
  },
  {
    id: 'prod-spectre-mouse',
    sku: 'NEX-PER-007',
    name: 'Spectre Carbon 39g Wireless Mouse',
    tagline: 'Forged carbon fiber shell with 42,000 DPI optical sensor',
    description: 'Weighing an astonishing 39 grams without honeycomb holes, the Spectre Carbon pairs a hand-laid forged carbon composite exoskeleton with optical micro-switches and an included 8000Hz magnetic charging receiver dock.',
    category: 'peripherals',
    brand: 'NEX Input',
    price: 159.00,
    original_price: 179.00,
    cost_price: 72.00,
    stock: 27,
    low_stock_threshold: 6,
    rating: 4.9,
    review_count: 163,
    sold_count: 980,
    featured: 0,
    is_flash_sale: 0,
    flash_sale_ends_at: null,
    badge: 'ULTRALIGHT 39G',
    image_url: '/api/product-art/prod-spectre-mouse.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Carbon Exoskeleton', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Sensor Precision', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Weight: '39g Solid Forged Carbon Composite',
      Sensor: 'NEX FocusPro 42K Optical (750 IPS / 85G Acceleration)',
      PollingRate: 'True 8000Hz Wireless w/ Magnetic Dongle',
      Switches: 'Gen-4 Optical (100M Clicks, 0.12ms Debounce)',
      Feet: '100% Virgin Grade PTFE Rounded Skates',
      Battery: '110 Hours @ 1000Hz / 32 Hours @ 8000Hz'
    }),
    colors_json: JSON.stringify([
      { name: 'Forged Carbon', hex: '#1f2937' },
      { name: 'Crimson Weave', hex: '#dc2626' },
      { name: 'Glacier White', hex: '#f8fafc' }
    ]),
    tags_json: JSON.stringify(['mouse', 'carbon', 'wireless', 'ultralight', 'esports', '8000hz'])
  },
  {
    id: 'prod-vision-air',
    sku: 'NEX-WRB-008',
    name: 'VisionAir Pro Micro-OLED Spatial Glasses',
    tagline: '210" virtual 4K workspace in 72g electrochromic eyewear',
    description: 'Project a crystal-clear 210-inch spatial triple-monitor setup anywhere. Equipped with Sony Micro-OLED optics, 120Hz refresh rate, electrochromic one-touch dimming lenses, and directional whisper-quiet acoustic temples.',
    category: 'wearables',
    brand: 'NEX Spatial',
    price: 499.00,
    original_price: 599.00,
    cost_price: 260.00,
    stock: 11,
    low_stock_threshold: 5,
    rating: 4.7,
    review_count: 79,
    sold_count: 410,
    featured: 1,
    is_flash_sale: 1,
    flash_sale_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    badge: 'SPATIAL AR',
    image_url: '/api/product-art/prod-vision-air.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Micro-OLED Prism', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Optics Spec', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Optics: 'Dual Sony 0.68" Micro-OLED (52 PPD, 120Hz)',
      VirtualScreen: 'Equivalent to 210" @ 6m (3DoF/6DoF Spatial Anchor)',
      Dimming: '3-Stage Instant Electrochromic Lens Tint (0% to 99.5%)',
      Audio: 'Phase-Cancelling Directional Acoustic Chambers',
      Weight: '72g Magnesium-Titanium Frame',
      Compatibility: 'USB-C DisplayPort (Mac, PC, iPhone, Steam Deck)'
    }),
    colors_json: JSON.stringify([
      { name: 'Obsidian Tint', hex: '#111827' },
      { name: 'Cyber Indigo', hex: '#4338ca' }
    ]),
    tags_json: JSON.stringify(['ar', 'glasses', 'micro-oled', 'spatial', 'monitor', 'wearable'])
  },
  {
    id: 'prod-pulse-dac',
    sku: 'NEX-AUD-009',
    name: 'Pulse Tube & R2R Balanced Desktop DAC/Amp',
    tagline: 'True 24-bit discrete R2R ladder DAC with switchable JAN tube stage',
    description: 'Switch effortlessly between ultra-transparent solid-state precision and warm vintage vacuum tube harmonics. Features dual balanced 4.4mm and 4-pin XLR outputs delivering up to 6,400mW per channel.',
    category: 'audio',
    brand: 'NEX Acoustic',
    price: 699.00,
    original_price: 799.00,
    cost_price: 380.00,
    stock: 7,
    low_stock_threshold: 4,
    rating: 4.9,
    review_count: 54,
    sold_count: 230,
    featured: 0,
    is_flash_sale: 0,
    flash_sale_ends_at: null,
    badge: 'AUDIOPHILE R2R',
    image_url: '/api/product-art/prod-pulse-dac.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'R2R Ladder Array', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'THD+N Chart', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Architecture: 'Fully Balanced 24-Bit Discrete Resistor Ladder (0.005% Precision)',
      TubeStage: 'Matched Pair Raytheon JAN6418 Vacuum Tubes',
      OutputPower: '6400mW @ 32 Ohms Balanced XLR / 4.4mm',
      SNR: '131 dB (A-Weighted)',
      Inputs: 'USB-C UAC2, I2S HDMI, Coaxial, Optical, Bluetooth LDAC',
      Chassis: 'Bead-Blasted CNC Aluminum with Tempered Glass Window'
    }),
    colors_json: JSON.stringify([
      { name: 'Anodized Black', hex: '#18181b' },
      { name: 'Champagne Gold', hex: '#d97706' }
    ]),
    tags_json: JSON.stringify(['dac', 'amplifier', 'r2r', 'audiophile', 'balanced', 'tube'])
  },
  {
    id: 'prod-aero-drone',
    sku: 'NEX-IMG-010',
    name: 'AeroVortex X4 Autonomous 8K Cine-Drone',
    tagline: 'Omnidirectional LiDAR obstacle avoidance with 48-minute flight time',
    description: 'Foldable carbon-arm aerial cinematography platform equipped with a Dual-Telephoto + Hasselblad-tuned 4/3 CMOS camera system, 20km OcuSync 4+ HD transmission, and neural autonomous subject choreography.',
    category: 'imaging',
    brand: 'NEX Optics',
    price: 1599.00,
    original_price: 1849.00,
    cost_price: 990.00,
    stock: 13,
    low_stock_threshold: 5,
    rating: 4.9,
    review_count: 88,
    sold_count: 390,
    featured: 1,
    is_flash_sale: 1,
    flash_sale_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 11).toISOString(),
    badge: 'AUTONOMOUS AI',
    image_url: '/api/product-art/prod-aero-drone.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Tri-Camera Gimbal', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Flight Telemetry', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      CameraSystem: '24mm f/2.8-f/11 4/3 CMOS + 70mm & 166mm Tele Lenses',
      VideoResolution: '6K 60fps Apple ProRes 422 HQ / 4K 120fps D-Log M',
      FlightTime: '48 Minutes Max Hover / 21 m/s Sport Speed',
      Avoidance: '360° Solid-State LiDAR + 6 Fisheye Vision Sensors',
      Transmission: '20km 1080p/120fps Low-Latency Digital Link',
      TakeoffWeight: '895g Foldable Carbon Frame'
    }),
    colors_json: JSON.stringify([
      { name: 'Tactical Slate', hex: '#334155' },
      { name: 'Desert Sand', hex: '#a8a29e' }
    ]),
    tags_json: JSON.stringify(['drone', 'aerial', 'lidar', 'camera', 'prores', 'autonomous'])
  },
  {
    id: 'prod-canvas-display',
    sku: 'NEX-CMP-011',
    name: 'ProCanvas 32" 6K Retina Studio Display',
    tagline: '6016x3384 Mini-LED reference monitor with Thunderbolt 5 hub',
    description: 'Factory-calibrated ΔE < 0.4 reference monitor featuring 2,304 full-array local dimming zones, nano-texture anti-reflective glass, built-in 4K AI center-stage webcam, and 140W single-cable host power delivery.',
    category: 'compute',
    brand: 'NEX Systems',
    price: 1799.00,
    original_price: 2099.00,
    cost_price: 1120.00,
    stock: 10,
    low_stock_threshold: 4,
    rating: 4.8,
    review_count: 72,
    sold_count: 265,
    featured: 0,
    is_flash_sale: 0,
    flash_sale_ends_at: null,
    badge: '6K MINI-LED',
    image_url: '/api/product-art/prod-canvas-display.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Mini-LED Backlight', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Color Gamut', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Resolution: '32" 6K (6016 x 3384) @ 120Hz ProMotion (218 PPI)',
      Backlight: '2,304-Zone Mini-LED (2000 nits Peak, 1,000,000:1 Contrast)',
      ColorAccuracy: '99.8% DCI-P3, 100% sRGB, True 10-bit, Factory Calibrated',
      Connectivity: '2x Thunderbolt 5 (140W PD), HDMI 2.1, DisplayPort 2.1, KVM',
      Stand: 'Counterbalanced Zero-Gravity Tilt, Height & 90° Pivot Arm',
      Finish: 'Nano-Texture Matte Etched Glass'
    }),
    colors_json: JSON.stringify([
      { name: 'Studio Silver', hex: '#94a3b8' },
      { name: 'Space Black', hex: '#18181b' }
    ]),
    tags_json: JSON.stringify(['monitor', '6k', 'mini-led', 'display', 'thunderbolt-5', 'creator'])
  },
  {
    id: 'prod-terra-powerstation',
    sku: 'NEX-PWR-012',
    name: 'TerraCore 1500 Solid-State Power Station',
    tagline: '1536Wh semi-solid LiFePO4 battery with <10ms UPS switchover',
    description: 'Compact studio & expedition backup power station utilizing high-density semi-solid LiFePO4 cells rated for 6,000+ cycles. Delivers 2400W pure sine wave AC output and recharges 0–80% in just 35 minutes.',
    category: 'power',
    brand: 'NEX Power',
    price: 899.00,
    original_price: 1099.00,
    cost_price: 540.00,
    stock: 14,
    low_stock_threshold: 5,
    rating: 4.9,
    review_count: 93,
    sold_count: 340,
    featured: 0,
    is_flash_sale: 0,
    flash_sale_ends_at: null,
    badge: '6000 CYCLES',
    image_url: '/api/product-art/prod-terra-powerstation.svg',
    gallery_json: JSON.stringify([
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Solid-State Cell Pack', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'UPS Spec', view: 'spec' }
    ]),
    specs_json: JSON.stringify({
      Capacity: '1536Wh Semi-Solid LiFePO4 (6,000 Cycles to 80%)',
      ACOutput: '4x Pure Sine Wave Outlets (2400W Continuous / 4800W Surge)',
      FastCharge: 'HyperCharge AC 1800W (0-80% in 35 Minutes) + 800W Solar MPPT',
      UPSMode: '< 8ms Server-Grade Uninterruptible Power Supply Switchover',
      NoiseLevel: 'Whisper Quiet < 28 dB Under 1000W Load',
      Weight: '13.4 kg Compact Alloy Enclosure'
    }),
    colors_json: JSON.stringify([
      { name: 'Industrial Cyber Grey', hex: '#3f3f46' },
      { name: 'Expedition Olive', hex: '#4d7c0f' }
    ]),
    tags_json: JSON.stringify(['power-station', 'battery', 'ups', 'solar', 'lifepo4', 'backup'])
  }
];

export const SEED_COUPONS = [
  {
    id: 'coup-welcome10',
    code: 'WELCOME10',
    description: '10% off any order for new NEX Store members',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 100,
    max_uses: 500,
    used_count: 128,
    active: 1,
    expires_at: '2027-12-31T23:59:59Z'
  },
  {
    id: 'coup-nex20',
    code: 'NEX20',
    description: '20% VIP launch discount on orders over $400',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 400,
    max_uses: 250,
    used_count: 84,
    active: 1,
    expires_at: '2027-06-30T23:59:59Z'
  },
  {
    id: 'coup-flash75',
    code: 'FLASH75',
    description: '$75 instant rebate on orders over $500',
    discount_type: 'fixed',
    discount_value: 75,
    min_order_amount: 500,
    max_uses: 100,
    used_count: 42,
    active: 1,
    expires_at: '2027-03-31T23:59:59Z'
  },
  {
    id: 'coup-creator150',
    code: 'STUDIO150',
    description: '$150 off pro workstations & cinema gear over $1,500',
    discount_type: 'fixed',
    discount_value: 150,
    min_order_amount: 1500,
    max_uses: 75,
    used_count: 19,
    active: 1,
    expires_at: '2027-12-31T23:59:59Z'
  }
];

export const SEED_REVIEWS = [
  {
    id: 'rev-1',
    product_id: 'prod-aether-pro',
    author_name: 'Marcus Vance',
    author_location: 'Nairobi, KE',
    rating: 5,
    title: 'Sub-bass extension and imaging rival $2,000 studio cans',
    comment: 'I use the Aether Pro X1 over USB-C DAC mode for mastering and Bluetooth 5.4 on flights. The magnesium headband has zero hot-spots even after 8 hours.',
    verified_purchase: 1,
    helpful_count: 34,
    created_at: '2026-10-21T14:22:00Z'
  },
  {
    id: 'rev-2',
    product_id: 'prod-aether-pro',
    author_name: 'Elena Rostova',
    author_location: 'Berlin, DE',
    rating: 5,
    title: 'Planar clarity with real ANC — finally!',
    comment: 'Most planar headphones are open-back only. Having closed-back planar magnetics with genuinely quiet ANC is a game changer for deep coding sessions.',
    verified_purchase: 1,
    helpful_count: 19,
    created_at: '2026-10-24T09:15:00Z'
  },
  {
    id: 'rev-3',
    product_id: 'prod-chronos-key',
    author_name: 'Devon K.',
    author_location: 'London, UK',
    rating: 5,
    title: 'Rapid Trigger at 0.15mm feels instantaneous',
    comment: 'The CNC aluminum weight and acoustic foam give it a deep thocky sound profile straight out of the box. The web configurator and OLED screen are super slick.',
    verified_purchase: 1,
    helpful_count: 28,
    created_at: '2026-10-22T18:40:00Z'
  },
  {
    id: 'rev-4',
    product_id: 'prod-nova-book',
    author_name: 'Dr. Amara Okafor',
    author_location: 'Nairobi, KE',
    rating: 5,
    title: 'Runs local 70B quantized models smoothly with silent fans',
    comment: '64GB unified memory + Tandem OLED screen is unbeatable. Compiling large Rust and PyTorch workloads takes half the time of my old machine.',
    verified_purchase: 1,
    helpful_count: 45,
    created_at: '2026-10-25T11:05:00Z'
  },
  {
    id: 'rev-5',
    product_id: 'prod-volt-gan',
    author_name: 'Liam Chen',
    author_location: 'Singapore, SG',
    rating: 5,
    title: 'Replaced four separate power bricks on my desk',
    comment: 'Seeing the exact wattage draw per port on the OLED screen is surprisingly useful for debugging USB-C PD devices. Runs cool even at 200W load.',
    verified_purchase: 1,
    helpful_count: 51,
    created_at: '2026-10-20T07:30:00Z'
  },
  {
    id: 'rev-6',
    product_id: 'prod-solaris-watch',
    author_name: 'Sofia Lindqvist',
    author_location: 'Stockholm, SE',
    rating: 5,
    title: 'Charged once three weeks ago and still at 41%',
    comment: 'Dual-band GPS lock takes under 3 seconds between tall buildings. The raw titanium bezel shrugs off scratches completely.',
    verified_purchase: 1,
    helpful_count: 23,
    created_at: '2026-10-26T16:12:00Z'
  },
  {
    id: 'rev-7',
    product_id: 'prod-lumina-cam',
    author_name: 'Tariq Al-Mansoor',
    author_location: 'Dubai, AE',
    rating: 5,
    title: 'Zero rolling shutter skew in fast whip-pans',
    comment: 'Global shutter in a body this compact with internal 16-bit RAW is a dream for gimbal and car-rig commercial shoots.',
    verified_purchase: 1,
    helpful_count: 31,
    created_at: '2026-10-23T20:50:00Z'
  }
];

export const SEED_ORDERS = [
  {
    id: 'ord-1001',
    order_number: 'NEX-8941',
    customer_name: 'Amara Okafor',
    customer_email: 'amara.okafor@neural-labs.io',
    customer_phone: '+254 712 345 678',
    shipping_address: '14 Riverside Drive, Westlands',
    shipping_city: 'Nairobi',
    shipping_country: 'Kenya',
    shipping_method: 'NEX Express Air (1-2 Days)',
    payment_method: 'Card •••• 4242',
    subtotal: 2628.00,
    discount_amount: 150.00,
    shipping_cost: 0.00,
    tax_amount: 198.24,
    total: 2676.24,
    coupon_code: 'STUDIO150',
    status: 'delivered',
    tracking_number: 'TRK-NEX-9920148',
    estimated_delivery: '2026-10-26',
    notes: 'Leave with building concierge at reception.',
    created_at: '2026-10-24T09:30:00Z',
    updated_at: '2026-10-26T14:15:00Z',
    items: [
      {
        id: 'oi-1',
        product_id: 'prod-nova-book',
        product_name: 'NovaBook Pro 16 OLED Workstation',
        product_sku: 'NEX-CMP-003',
        product_image: '/api/product-art/prod-nova-book.svg',
        selected_color: 'Midnight Carbon',
        quantity: 1,
        unit_price: 2399.00,
        line_total: 2399.00
      },
      {
        id: 'oi-2',
        product_id: 'prod-chronos-key',
        product_name: 'Chronos 75 Hall-Effect Keyboard',
        product_sku: 'NEX-PER-002',
        product_image: '/api/product-art/prod-chronos-key.svg',
        selected_color: 'Space Grey',
        quantity: 1,
        unit_price: 229.00,
        line_total: 229.00
      }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'NEX-8942',
    customer_name: 'Marcus Vance',
    customer_email: 'mvance@soundcraft.studio',
    customer_phone: '+254 799 881 220',
    shipping_address: '88 Kilimani Road, Suite 4B',
    shipping_city: 'Nairobi',
    shipping_country: 'Kenya',
    shipping_method: 'NEX Same-Day Courier',
    payment_method: 'M-Pesa Express / Instant Pay',
    subtotal: 598.00,
    discount_amount: 75.00,
    shipping_cost: 15.00,
    tax_amount: 41.84,
    total: 579.84,
    coupon_code: 'FLASH75',
    status: 'shipped',
    tracking_number: 'TRK-NEX-9920319',
    estimated_delivery: '2026-10-27',
    notes: 'Call upon arrival at gate.',
    created_at: '2026-10-26T16:45:00Z',
    updated_at: '2026-10-27T08:10:00Z',
    items: [
      {
        id: 'oi-3',
        product_id: 'prod-aether-pro',
        product_name: 'Aether Pro X1 Planar Headphones',
        product_sku: 'NEX-AUD-001',
        product_image: '/api/product-art/prod-aether-pro.svg',
        selected_color: 'Obsidian Black',
        quantity: 1,
        unit_price: 449.00,
        line_total: 449.00
      },
      {
        id: 'oi-4',
        product_id: 'prod-volt-gan',
        product_name: 'VoltMatrix 240W GaN Desktop Hub',
        product_sku: 'NEX-PWR-005',
        product_image: '/api/product-art/prod-volt-gan.svg',
        selected_color: 'Graphite Matte',
        quantity: 1,
        unit_price: 149.00,
        line_total: 149.00
      }
    ]
  },
  {
    id: 'ord-1003',
    order_number: 'NEX-8943',
    customer_name: 'Chloe Takahashi',
    customer_email: 'chloe@spatialdesign.co',
    customer_phone: '+44 20 7946 0921',
    shipping_address: '42 Shoreditch High St',
    shipping_city: 'London',
    shipping_country: 'United Kingdom',
    shipping_method: 'NEX Priority Global',
    payment_method: 'Apple Pay •••• 8819',
    subtotal: 658.00,
    discount_amount: 131.60,
    shipping_cost: 0.00,
    tax_amount: 42.11,
    total: 568.51,
    coupon_code: 'NEX20',
    status: 'processing',
    tracking_number: 'TRK-NEX-9920554',
    estimated_delivery: '2026-10-29',
    notes: '',
    created_at: '2026-10-27T07:20:00Z',
    updated_at: '2026-10-27T09:00:00Z',
    items: [
      {
        id: 'oi-5',
        product_id: 'prod-vision-air',
        product_name: 'VisionAir Pro Micro-OLED Spatial Glasses',
        product_sku: 'NEX-WRB-008',
        product_image: '/api/product-art/prod-vision-air.svg',
        selected_color: 'Obsidian Tint',
        quantity: 1,
        unit_price: 499.00,
        line_total: 499.00
      },
      {
        id: 'oi-6',
        product_id: 'prod-spectre-mouse',
        product_name: 'Spectre Carbon 39g Wireless Mouse',
        product_sku: 'NEX-PER-007',
        product_image: '/api/product-art/prod-spectre-mouse.svg',
        selected_color: 'Forged Carbon',
        quantity: 1,
        unit_price: 159.00,
        line_total: 159.00
      }
    ]
  }
];
