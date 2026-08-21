export type Verdict =
    | 'Real'
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
}

export interface C2paData {
    verified?: boolean;
    issuer?: string | null;
    title?: string | null;
    signature_date?: string | null;
    validation_state?: string | null;
    error?: string;
}

export interface AnalysisDetails {
    metadata?: Record<string, unknown>;
    biology?: BiologyDetails;
    math?: Record<string, unknown>;
    ai_model?: Record<string, unknown>;
    physics?: {
        lighting?: { direction_variance?: number; score?: number | null };
        eye_glint?: { checked?: boolean; symmetry_error?: number; score?: number | null };
    };
    early_signature?: { fft_peaks?: number; fft_high_freq_mean?: number };
    ela?: { avg_ela_brightness?: number; ela_brightness_std?: number };
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
}

export interface HistoryRecord {
    id: number;
    filename: string;
    media_type?: string;
    verdict?: string;
    confidence?: number;
    timestamp?: string;
}
