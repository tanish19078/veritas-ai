import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

const START_ANGLE = 145; // degrees; 250-degree sweep
const SWEEP = 250;
const RADIUS = 64;
const CENTER = 82;

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

export default function ArcGauge({ value, stroke, label = 'Fake Probability' }: ArcGaugeProps) {
    const animated = useCountUp(value, 1000);
    const clamped = Math.max(0, Math.min(1, animated));
    const needleAngle = START_ANGLE + SWEEP * clamped;

    const ticks = Array.from({ length: 15 }, (_, i) => START_ANGLE + (SWEEP / 14) * i);

    return (
        <div className="relative h-48 w-48 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 164 164" className="h-full w-full">
                {/* Radial background glow */}
                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS + 6}
                    fill="transparent"
                />

                {/* Tick marks */}
                {ticks.map((angle, i) => {
                    const major = i % 2 === 0;
                    const [x1, y1] = polar(angle, RADIUS + 8);
                    const [x2, y2] = polar(angle, RADIUS + (major ? 15 : 11));
                    const lit = angle <= needleAngle;
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={lit ? stroke : '#cbd5e1'}
                            strokeWidth={major ? 2 : 1}
                            strokeLinecap="round"
                            opacity={lit ? 0.95 : 0.6}
                        />
                    );
                })}

                {/* Outer track */}
                <path
                    d={arcPath(START_ANGLE, START_ANGLE + SWEEP, RADIUS)}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="9"
                    strokeLinecap="round"
                />

                <defs>
                    <linearGradient
                        id={`gaugeGrad-${stroke.replace(/[^a-zA-Z0-9]/g, '')}`}
                        x1="0%"
                        y1="100%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop offset="0%" stopColor={stroke} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={stroke} />
                    </linearGradient>
                </defs>

                {/* Progress arc */}
                {clamped > 0.005 && (
                    <path
                        d={arcPath(START_ANGLE, needleAngle, RADIUS)}
                        fill="none"
                        stroke={`url(#gaugeGrad-${stroke.replace(/[^a-zA-Z0-9]/g, '')})`}
                        strokeWidth="9"
                        strokeLinecap="round"
                        className="transition-all duration-75"
                    />
                )}

                {/* Needle Indicator */}
                <circle
                    cx={polar(needleAngle, RADIUS)[0]}
                    cy={polar(needleAngle, RADIUS)[1]}
                    r="4.5"
                    fill={stroke}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="shadow-md"
                />
            </svg>

            {/* Inner Metrics Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 text-center pointer-events-none">
                <span className="font-mono text-3xl font-extrabold tabular-nums text-slate-900 leading-none">
                    {(clamped * 100).toFixed(0)}
                    <span className="text-lg font-semibold text-slate-400 ml-0.5">%</span>
                </span>
                <span className="micro-label mt-1.5 !text-slate-500 font-medium">
                    {label}
                </span>
            </div>
        </div>
    );
}
