import { useCountUp } from '../../hooks/useCountUp';

const START_ANGLE = 150; // degrees; 240-degree sweep
const SWEEP = 240;
const RADIUS = 62;
const CENTER = 80;

function polar(angleDeg: number, radius: number): [number, number] {
    const rad = (angleDeg * Math.PI) / 180;
    return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function arcPath(fromDeg: number, toDeg: number, radius: number): string {
    const [x1, y1] = polar(fromDeg, radius);
    const [x2, y2] = polar(toDeg, radius);
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

interface ArcGaugeProps {
    value: number; // 0..1
    stroke: string;
    label?: string;
}

const ArcGauge = ({ value, stroke, label = 'fake prob.' }: ArcGaugeProps) => {
    const animated = useCountUp(value);
    const clamped = Math.max(0, Math.min(1, animated));
    const needleAngle = START_ANGLE + SWEEP * clamped;

    const ticks = Array.from({ length: 13 }, (_, i) => START_ANGLE + (SWEEP / 12) * i);

    return (
        <div className="relative h-44 w-44 shrink-0">
            <svg viewBox="0 0 160 160" className="h-full w-full">
                {/* tick marks */}
                {ticks.map((angle, i) => {
                    const major = i % 3 === 0;
                    const [x1, y1] = polar(angle, RADIUS + 8);
                    const [x2, y2] = polar(angle, RADIUS + (major ? 16 : 12));
                    const lit = angle <= needleAngle;
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={lit ? stroke : 'rgba(148,163,184,0.25)'}
                            strokeWidth={major ? 2 : 1}
                            strokeLinecap="round"
                            opacity={lit ? 0.9 : 0.6}
                        />
                    );
                })}

                {/* track */}
                <path
                    d={arcPath(START_ANGLE, START_ANGLE + SWEEP, RADIUS)}
                    fill="none"
                    stroke="rgba(148,163,184,0.14)"
                    strokeWidth="9"
                    strokeLinecap="round"
                />

                <defs>
                    <linearGradient id={`arcGrad-${stroke.replace('#', '')}`} x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={stroke} stopOpacity="0.55" />
                        <stop offset="100%" stopColor={stroke} />
                    </linearGradient>
                </defs>

                {/* progress arc */}
                {clamped > 0.005 && (
                    <path
                        d={arcPath(START_ANGLE, needleAngle, RADIUS)}
                        fill="none"
                        stroke={`url(#arcGrad-${stroke.replace('#', '')})`}
                        strokeWidth="9"
                        strokeLinecap="round"
                    />
                )}

                {/* needle dot */}
                <circle
                    cx={polar(needleAngle, RADIUS)[0]}
                    cy={polar(needleAngle, RADIUS)[1]}
                    r="4.5"
                    fill={stroke}
                    stroke="#030509"
                    strokeWidth="2"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
                <span className="font-mono text-3xl font-semibold tabular-nums text-slate-50">
                    {(clamped * 100).toFixed(0)}
                    <span className="text-base text-slate-500">%</span>
                </span>
                <span className="micro-label mt-1">{label}</span>
            </div>
        </div>
    );
};

export default ArcGauge;
