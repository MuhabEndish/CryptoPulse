import React from 'react';

interface FearGreedGaugeProps {
  value: number;
  classification: string;
}

export default function FearGreedGauge({ value, classification }: FearGreedGaugeProps) {
  // Calculate the rotation angle for the needle (0-180 degrees for semi-circle)
  const needleRotation = (value / 100) * 180;

  // Determine color based on value
  const getColor = () => {
    if (value <= 25) return '#ef4444'; // red-500 - Extreme Fear
    if (value <= 45) return '#fb923c'; // orange-400 - Fear
    if (value <= 55) return '#fbbf24'; // yellow-400 - Neutral
    if (value <= 75) return '#4ade80'; // green-400 - Greed
    return '#22c55e'; // green-500 - Extreme Greed
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Semi-circle gauge */}
      <div className="relative w-full" style={{ height: '120px' }}>
        <svg
          viewBox="0 0 200 110"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Background arc segments with gradient colors */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
              <stop offset="25%" style={{ stopColor: '#fb923c', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
              <stop offset="75%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Background track (dark) */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1f2937"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Center circle */}
          <circle cx="100" cy="100" r="8" fill="#0f172a" />

          {/* Needle */}
          <g
            transform={`rotate(${needleRotation - 90}, 100, 100)`}
            style={{ transition: 'transform 1s ease-out' }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill={color} />
          </g>

          {/* Tick marks and labels */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 180 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + Math.cos(rad) * 72;
            const y1 = 100 + Math.sin(rad) * 72;
            const x2 = 100 + Math.cos(rad) * 78;
            const y2 = 100 + Math.sin(rad) * 78;

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4b5563"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>

      {/* Value display below the gauge */}
      <div className="mt-1 text-center">
        <div className="text-3xl font-bold" style={{ color }}>
          {value}
        </div>
      </div>

      {/* Classification label */}
      <div className="mt-1 text-center">
        <div className="text-sm font-medium" style={{ color }}>
          {classification}
        </div>
      </div>
    </div>
  );
}
