import { SampleScenario } from '../types';

// High quality embedded SVG data URIs for instant standalone preview without network lag
const svgMidjourneyPreview = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#1e1b4b"/>
      <stop offset="50%" stopColor="#312e81"/>
      <stop offset="100%" stopColor="#4c1d95"/>
    </linearGradient>
    <radialGradient id="faceGlow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#f97316" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="transparent"/>
    </radialGradient>
    <filter id="synthNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0"/>
      <feComposite in2="SourceGraphic" in="glitch" operator="in"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="300" cy="270" r="180" fill="url(#faceGlow)"/>
  <ellipse cx="300" cy="290" rx="110" ry="140" fill="#fcd34d" opacity="0.8"/>
  <ellipse cx="250" cy="260" rx="20" ry="12" fill="#0f172a"/>
  <ellipse cx="350" cy="260" rx="20" ry="12" fill="#0f172a"/>
  <circle cx="252" cy="258" r="4" fill="#38bdf8"/>
  <circle cx="348" cy="258" r="7" fill="#f43f5e"/>
  <path d="M 285 320 Q 300 340 315 320" stroke="#b45309" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M 250 350 Q 300 380 350 350" stroke="#dc2626" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- Synthetic grid overlay overlaying AI artifacts -->
  <g opacity="0.25" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4 8">
    <line x1="0" y1="150" x2="600" y2="150"/>
    <line x1="0" y1="300" x2="600" y2="300"/>
    <line x1="0" y1="450" x2="600" y2="450"/>
    <line x1="150" y1="0" x2="150" y2="600"/>
    <line x1="300" y1="0" x2="300" y2="600"/>
    <line x1="450" y1="0" x2="450" y2="600"/>
  </g>
  <text x="300" y="540" fill="#cbd5e1" font-family="monospace" font-size="16" text-anchor="middle" letter-spacing="2">SYNTHETIC ARTIFACT SUBJECT #084</text>
</svg>
`)}`;

const svgMidjourneyEla = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <radialGradient id="elaHeat" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85"/>
      <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.65"/>
      <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.3"/>
      <stop offset="100%" stopColor="#030712"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="#030712"/>
  <circle cx="300" cy="270" r="190" fill="url(#elaHeat)"/>
  <!-- Glowing high-frequency residual hotspots -->
  <circle cx="250" cy="260" r="35" fill="#f43f5e" opacity="0.6"/>
  <circle cx="350" cy="260" r="45" fill="#f43f5e" opacity="0.8"/>
  <circle cx="300" cy="350" r="40" fill="#fbbf24" opacity="0.7"/>
  <text x="300" y="540" fill="#f43f5e" font-family="monospace" font-size="15" text-anchor="middle" font-weight="bold" letter-spacing="2">ELA X-RAY: HIGH COMPRESSION MISMATCH (0.84 STD)</text>
</svg>
`)}`;

const svgAuthenticPreview = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="photoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#064e3b"/>
      <stop offset="50%" stopColor="#047857"/>
      <stop offset="100%" stopColor="#0f766e"/>
    </linearGradient>
    <radialGradient id="portraitGlow" cx="50%" cy="45%" r="35%">
      <stop offset="0%" stopColor="#fed7aa"/>
      <stop offset="70%" stopColor="#d97706" stopOpacity="0.5"/>
      <stop offset="100%" stopColor="transparent"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#photoGrad)"/>
  <circle cx="300" cy="270" r="170" fill="url(#portraitGlow)"/>
  <ellipse cx="300" cy="290" rx="95" ry="125" fill="#ffedd5"/>
  <ellipse cx="260" cy="270" rx="14" ry="9" fill="#1e293b"/>
  <ellipse cx="340" cy="270" rx="14" ry="9" fill="#1e293b"/>
  <circle cx="262" cy="268" r="3" fill="#ffffff"/>
  <circle cx="342" cy="268" r="3" fill="#ffffff"/>
  <path d="M 270 340 Q 300 365 330 340" stroke="#9a3412" stroke-width="4" fill="none" stroke-linecap="round"/>
  <text x="300" y="540" fill="#a7f3d0" font-family="monospace" font-size="15" text-anchor="middle" letter-spacing="2">AUTHENTIC OPTICAL SENSOR RAW #492</text>
</svg>
`)}`;

const svgAuthenticEla = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#050811"/>
  <!-- Uniform low-level noise floor characteristic of unaltered RAW/JPEG -->
  <rect width="600" height="600" fill="#0284c7" opacity="0.08"/>
  <text x="300" y="540" fill="#38bdf8" font-family="monospace" font-size="15" text-anchor="middle" letter-spacing="2">ELA X-RAY: UNIFORM NOISE FLOOR (0.08 STD)</text>
</svg>
`)}`;

export const SAMPLE_SCENARIOS: SampleScenario[] = [
    {
        id: 'midjourney-v6-portrait',
        title: 'Midjourney v6 Synthetic Portrait',
        subtitle: 'Diffusion model generation with characteristic spectral & Bayer absence traces',
        badge: 'AI-Generated',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        mediaType: 'image',
        previewUrl: svgMidjourneyPreview,
        elaUrl: svgMidjourneyEla,
        result: {
            verdict: 'AI-Generated',
            confidence: 0.942,
            file_name: 'midjourney_v6_hyperreal_portrait.png',
            stored_file: 'sample_mj_01.png',
            media_type: 'image',
            is_verified: false,
            c2pa_data: {
                verified: false,
                validation_state: 'No C2PA Manifest Found',
            },
            explanation:
                'Flagged as AI-Generated due to: Strong periodic artifacts in FFT (Grid patterns); Abnormal DCT coefficient distribution; Absence of CFA / Bayer camera sensor trace; 14 anomalous spectral peaks in high-frequency spectrum; ELA compression variance anomaly.',
            layer_scores: {
                metadata: 0.85,
                biology_rppg: 0.78,
                math_forensics: 0.96,
                ai_model: 0.95,
                physics: 0.82,
                early_signature: 0.98,
                ela: 0.88,
            },
            details: {
                metadata: {
                    mime_type: 'image/png',
                    exif_count: 0,
                    software: 'Midjourney Diffusion Engine v6',
                    anomalies: [
                        'Zero EXIF metadata tags recovered',
                        'PNG chunk contains AI generation prompt metadata',
                    ],
                },
                biology: {
                    face_frames: 1,
                    signal_std_dev: 0.02,
                    note: 'Static image rPPG baseline indicates skin chrominance inconsistency',
                    pulse_band: {
                        detected: false,
                        estimated_bpm: null,
                        snr: -8.4,
                    },
                },
                math: {
                    fft_score: 0.95,
                    dct_score: 0.92,
                    cfa_absence_score: 0.98,
                    anomalies: [
                        'Strong periodic grid pattern in FFT magnitude spectrum',
                        'High-frequency DCT coefficients concentrated in unnatural sub-bands',
                        'Complete absence of camera CFA / Bayer demosaicing noise',
                    ],
                },
                ai_model: {
                    method: 'pretrained',
                    model_name: 'umm-maybe/AI-image-detector',
                    blur_score: 0.89,
                    entropy_score: 0.94,
                    color_anomaly_score: 0.91,
                    score: 0.95,
                },
                physics: {
                    lighting: {
                        direction_variance: 0.82,
                        score: 0.82,
                        quadrants: {
                            top_left: 0.88,
                            top_right: 0.42,
                            bottom_left: 0.74,
                            bottom_right: 0.31,
                        },
                    },
                    eye_glint: {
                        checked: true,
                        symmetry_error: 0.86,
                        score: 0.86,
                        left_glint: [252, 258],
                        right_glint: [348, 258],
                    },
                    anomalies: [
                        'Asymmetric corneal reflection catchlights (left: top-lit, right: side-lit)',
                        'Illumination gradient discrepancy across facial quadrants',
                    ],
                },
                early_signature: {
                    fft_peaks: 14,
                    fft_high_freq_mean: 0.92,
                    spectral_energy_ratio: 3.84,
                    anomalies: [
                        '14 distinct spectral spikes matching ConvTranspose2d upsampler fingerprints',
                    ],
                },
                ela: {
                    score: 0.88,
                    avg_ela_brightness: 42.6,
                    ela_brightness_std: 0.84,
                    anomalies: [
                        'High compression error level variance across facial feature boundaries',
                    ],
                },
            },
            sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            timestamp: new Date().toISOString(),
        },
    },
    {
        id: 'deepfake-video-faceswap',
        title: 'Deepfake Video Face-Swap (Roop / SimSwap)',
        subtitle: 'Video sequence with complete loss of physiological cardiac pulse and boundary tampering',
        badge: 'AI-Generated',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        mediaType: 'video',
        previewUrl: svgMidjourneyPreview,
        result: {
            verdict: 'AI-Generated',
            confidence: 0.895,
            file_name: 'interview_faceswap_deepfake.mp4',
            stored_file: 'sample_deepfake_02.mp4',
            media_type: 'video',
            is_verified: false,
            c2pa_data: {
                verified: false,
                validation_state: 'Unsigned Media',
            },
            explanation:
                'Flagged as AI-Generated due to: Complete absence of physiological blood volume pulse in cardiac band (0.0 BPM); Facial boundary lighting vector mismatch; Periodic DCT recompression blocks.',
            layer_scores: {
                metadata: 0.45,
                biology_rppg: 0.96,
                math_forensics: 0.84,
                ai_model: 0.88,
                physics: 0.89,
                early_signature: 0.85,
            },
            details: {
                metadata: {
                    mime_type: 'video/mp4',
                    exif_count: 2,
                    software: 'FFmpeg synthetic encoder',
                    anomalies: ['Stripped camera metadata and encoder profile tags'],
                },
                biology: {
                    frames_read: 120,
                    face_frames: 118,
                    signal_std_dev: 0.008,
                    waveform: [
                        0.51, 0.49, 0.52, 0.5, 0.48, 0.51, 0.5, 0.49, 0.52, 0.5, 0.49,
                        0.51, 0.48, 0.52, 0.5, 0.51, 0.49, 0.5, 0.52, 0.49, 0.51, 0.5,
                        0.48, 0.52, 0.5, 0.49, 0.51, 0.5, 0.49, 0.52, 0.5, 0.48,
                    ],
                    pulse_band: {
                        method: 'CHROM rPPG + Cardiac FFT (0.7–4.0 Hz)',
                        peak_hz: 0.12,
                        snr: -6.8,
                        estimated_bpm: null,
                        detected: false,
                    },
                    anomalies: [
                        'No cardiac band pulse peak detected in facial skin chrominance channel (0.7–4.0 Hz)',
                        'Flatline physiological signal across 118 analyzed frames',
                    ],
                },
                math: {
                    fft_score: 0.82,
                    dct_score: 0.85,
                    cfa_absence_score: 0.86,
                    anomalies: [
                        'Abnormal DCT block boundary energy along face-swap mask contour',
                    ],
                },
                ai_model: {
                    method: 'pretrained',
                    model_name: 'umm-maybe/AI-image-detector',
                    score: 0.88,
                },
                physics: {
                    lighting: {
                        direction_variance: 0.89,
                        score: 0.89,
                    },
                    eye_glint: {
                        checked: true,
                        symmetry_error: 0.85,
                        score: 0.85,
                    },
                    anomalies: [
                        'Face lighting vector diverges 48° from torso and scene ambient light',
                    ],
                },
                early_signature: {
                    fft_peaks: 9,
                    fft_high_freq_mean: 0.84,
                },
            },
            sha256_hash: '3a4f8910b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789a',
            timestamp: new Date().toISOString(),
        },
    },
    {
        id: 'authentic-canon-raw',
        title: 'Authentic Canon 5D Mark IV Photo',
        subtitle: 'Clean photographic capture with verified Bayer CFA sensor pattern and full EXIF audit trail',
        badge: 'Authentic',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        mediaType: 'image',
        previewUrl: svgAuthenticPreview,
        elaUrl: svgAuthenticEla,
        result: {
            verdict: 'Authentic',
            confidence: 0.074,
            file_name: 'IMG_4920_Canon5D_Studio.jpg',
            stored_file: 'sample_authentic_03.jpg',
            media_type: 'image',
            is_verified: false,
            c2pa_data: {
                verified: false,
                validation_state: 'Standard EXIF Provenance',
            },
            explanation:
                'No significant artifacts found. Content appears authentic based on 7 forensic layers: rich camera sensor metadata, natural Bayer filter noise traces, uniform ELA compression floor, and physically coherent lighting.',
            layer_scores: {
                metadata: 0.05,
                biology_rppg: 0.12,
                math_forensics: 0.08,
                ai_model: 0.06,
                physics: 0.09,
                early_signature: 0.04,
                ela: 0.07,
            },
            details: {
                metadata: {
                    mime_type: 'image/jpeg',
                    exif_count: 48,
                    camera_make: 'Canon',
                    camera_model: 'Canon EOS 5D Mark IV',
                    software: 'Digital Photo Professional 4.14',
                    iso: '100',
                    focal_length: '85.0 mm f/1.4',
                    tamper_flags: [],
                    anomalies: [],
                },
                biology: {
                    face_frames: 1,
                    signal_std_dev: 0.18,
                    note: 'Skin texture exhibits natural sub-surface scattering and microvascular variance',
                },
                math: {
                    fft_score: 0.06,
                    dct_score: 0.09,
                    cfa_absence_score: 0.04,
                    anomalies: [],
                    note: 'Authentic Bayer RGGB sensor mosaic noise pattern strongly detected',
                },
                ai_model: {
                    method: 'pretrained',
                    model_name: 'umm-maybe/AI-image-detector',
                    blur_score: 0.08,
                    entropy_score: 0.05,
                    score: 0.06,
                },
                physics: {
                    lighting: {
                        direction_variance: 0.08,
                        score: 0.08,
                        quadrants: {
                            top_left: 0.52,
                            top_right: 0.51,
                            bottom_left: 0.49,
                            bottom_right: 0.48,
                        },
                    },
                    eye_glint: {
                        checked: true,
                        symmetry_error: 0.04,
                        score: 0.04,
                    },
                    anomalies: [],
                },
                early_signature: {
                    fft_peaks: 0,
                    fft_high_freq_mean: 0.04,
                    anomalies: [],
                },
                ela: {
                    score: 0.07,
                    avg_ela_brightness: 5.2,
                    ela_brightness_std: 0.08,
                    anomalies: [],
                },
            },
            sha256_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            timestamp: new Date().toISOString(),
        },
    },
    {
        id: 'c2pa-verified-media',
        title: 'C2PA Cryptographically Verified Press Media',
        subtitle: 'Signed content credentials from certified publisher with cryptographic chain of custody',
        badge: 'C2PA Verified',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        mediaType: 'image',
        previewUrl: svgAuthenticPreview,
        elaUrl: svgAuthenticEla,
        result: {
            verdict: 'Authentic',
            confidence: 0.041,
            file_name: 'press_wire_reuters_c2pa_signed.jpg',
            stored_file: 'sample_c2pa_04.jpg',
            media_type: 'image',
            is_verified: true,
            c2pa_data: {
                verified: true,
                issuer: 'Reuters News Agency / CAI Trust Root',
                title: 'Global Economic Summit Press Wire',
                signature_date: '2026-08-28T14:22:00Z',
                validation_state: 'Valid C2PA Manifest (SHA-256 Verified)',
                cert_serial: 'CAI-ROOT-X509-883921-EU',
                algorithm: 'Ed25519 / RSA-PSS-SHA256',
                claim_generator: 'Sony A9 III In-Camera Hardware Authenticator v2.1',
            },
            explanation:
                'Valid C2PA provenance credentials confirmed. The asset contains a tamper-proof cryptographic manifest issued by Reuters News Agency with hardware-level camera signing.',
            layer_scores: {
                metadata: 0.02,
                biology_rppg: 0.05,
                math_forensics: 0.04,
                ai_model: 0.03,
                physics: 0.05,
                early_signature: 0.02,
                ela: 0.04,
            },
            details: {
                metadata: {
                    mime_type: 'image/jpeg',
                    exif_count: 52,
                    provenance_verified: true,
                    c2pa: {
                        verified: true,
                        issuer: 'Reuters News Agency',
                    },
                },
                biology: {
                    signal_std_dev: 0.22,
                },
                math: {
                    fft_score: 0.03,
                    dct_score: 0.04,
                    cfa_absence_score: 0.02,
                },
                ai_model: {
                    score: 0.03,
                },
                physics: {
                    lighting: { score: 0.05 },
                    eye_glint: { score: 0.03 },
                },
                early_signature: {
                    fft_peaks: 0,
                },
                ela: {
                    score: 0.04,
                },
            },
            sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            timestamp: new Date().toISOString(),
        },
    },
    {
        id: 'photoshop-spliced-anomaly',
        title: 'Spliced Composite & Retouching Anomaly',
        subtitle: 'Altered image with localized compression level discrepancy and eye glint asymmetry',
        badge: 'Suspicious',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        mediaType: 'image',
        previewUrl: svgMidjourneyPreview,
        elaUrl: svgMidjourneyEla,
        result: {
            verdict: 'Suspicious / Inconclusive',
            confidence: 0.628,
            file_name: 'tampered_press_evidence.jpg',
            stored_file: 'sample_spliced_05.jpg',
            media_type: 'image',
            is_verified: false,
            c2pa_data: {
                verified: false,
                validation_state: 'Manifest Absent / Edited Software Tag Detected',
            },
            explanation:
                'Flagged as Suspicious due to: Adobe Photoshop editing signature in metadata; Localized ELA compression boundary glow; Subtle catchlight reflection angle discrepancy between eyes.',
            layer_scores: {
                metadata: 0.65,
                math_forensics: 0.58,
                ai_model: 0.42,
                physics: 0.74,
                early_signature: 0.38,
                ela: 0.79,
            },
            details: {
                metadata: {
                    mime_type: 'image/jpeg',
                    exif_count: 14,
                    software: 'Adobe Photoshop 2024 (Windows)',
                    anomalies: [
                        'Edited with Adobe Photoshop',
                        'Camera EXIF serial numbers stripped during re-export',
                    ],
                },
                math: {
                    fft_score: 0.45,
                    dct_score: 0.68,
                    anomalies: [
                        'Dual-compression DCT ghost coefficients detected in central region',
                    ],
                },
                ai_model: {
                    score: 0.42,
                    blur_score: 0.51,
                },
                physics: {
                    lighting: { score: 0.62 },
                    eye_glint: {
                        checked: true,
                        symmetry_error: 0.76,
                        score: 0.76,
                    },
                    anomalies: [
                        'Right eye catchlight position deviates by 34° from left eye specular highlight',
                    ],
                },
                early_signature: {
                    fft_peaks: 3,
                },
                ela: {
                    score: 0.79,
                    avg_ela_brightness: 31.4,
                    ela_brightness_std: 0.62,
                    anomalies: [
                        'Significant brightness delta between subject bounding box and background',
                    ],
                },
            },
            sha256_hash: '7d1a2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
            timestamp: new Date().toISOString(),
        },
    },
];
