export type Verdict =
    | 'Real'
    | 'Authentic'
    | 'Suspicious / Inconclusive'
    | 'AI-Generated'
    | 'Inconclusive'
    | 'Error';

export interface LayerScores {
    metadata?: number;
    biology_rppg?: number;
    math_forensics?: number;
    ai_model?: number;
    physics?: number;
    early_signature?: number;
    ela?: number;
    [key: string]: number | undefined;
}

export interface PulseBandInfo {
    method?: string;
    peak_hz?: number | null;
    snr?: number | null;
    estimated_bpm?: number | null;
    detected?: boolean;
}

export interface BiologyDetails {
    frames_read?: number;
    face_frames?: number;
    signal_std_dev?: number;
    pulse_band?: PulseBandInfo;
    waveform?: number[];
    note?: string;
    anomalies?: string[];
    [key: string]: unknown;
}

export interface MathDetails {
    fft_score?: number;
    dct_score?: number;
    cfa_absence_score?: number;
    noise_variance?: number;
    anomalies?: string[];
    note?: string;
    [key: string]: unknown;
}

export interface AIModelDetails {
    method?: 'pretrained' | 'heuristic' | string;
    model_name?: string;
    blur_score?: number;
    entropy_score?: number;
    color_anomaly_score?: number;
    score?: number | null;
    anomalies?: string[];
    [key: string]: unknown;
}

export interface PhysicsDetails {
    lighting?: {
        direction_variance?: number;
        score?: number | null;
        quadrants?: {
            top_left?: number;
            top_right?: number;
            bottom_left?: number;
            bottom_right?: number;
        };
    };
    eye_glint?: {
        checked?: boolean;
        symmetry_error?: number;
        score?: number | null;
        left_glint?: [number, number];
        right_glint?: [number, number];
    };
    anomalies?: string[];
    [key: string]: unknown;
}

export interface EarlySignatureDetails {
    fft_peaks?: number;
    fft_high_freq_mean?: number;
    spectral_energy_ratio?: number;
    anomalies?: string[];
    [key: string]: unknown;
}

export interface ElaDetails {
    score?: number | null;
    avg_ela_brightness?: number;
    ela_brightness_std?: number;
    anomalies?: string[];
    details?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface MetadataDetails {
    mime_type?: string;
    exif_count?: number;
    camera_make?: string;
    camera_model?: string;
    software?: string;
    iso?: string | number;
    focal_length?: string;
    tamper_flags?: string[];
    anomalies?: string[];
    provenance_verified?: boolean;
    c2pa?: C2paData;
    [key: string]: unknown;
}

export interface C2paData {
    verified?: boolean;
    issuer?: string | null;
    title?: string | null;
    signature_date?: string | null;
    validation_state?: string | null;
    cert_serial?: string | null;
    algorithm?: string | null;
    claim_generator?: string | null;
    error?: string;
}

export interface AnalysisDetails {
    metadata?: MetadataDetails;
    biology?: BiologyDetails;
    math?: MathDetails;
    ai_model?: AIModelDetails;
    physics?: PhysicsDetails;
    early_signature?: EarlySignatureDetails;
    ela?: ElaDetails;
    [key: string]: unknown;
}

export interface AnalysisResult {
    verdict: Verdict | string;
    confidence: number;
    layer_scores: LayerScores;
    explanation: string;
    details: AnalysisDetails;
    ela_url?: string | null;
    is_verified: boolean;
    c2pa_data: C2paData;
    file_name?: string;
    stored_file?: string;
    media_type?: 'image' | 'video';
    previewUrl?: string;
    file_size_bytes?: number;
    sha256_hash?: string;
    timestamp?: string;
}

export interface HistoryRecord {
    id: number;
    filename: string;
    media_type?: string;
    verdict?: string;
    confidence?: number;
    timestamp?: string;
    layer_scores?: LayerScores;
}

export interface SampleScenario {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    mediaType: 'image' | 'video';
    previewUrl: string;
    elaUrl?: string;
    result: AnalysisResult;
}
