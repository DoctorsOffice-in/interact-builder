import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  value: string; // discount code, offer text, etc.
  type: "discount" | "offer" | "freebie" | "custom";
}

interface SpinWheelProps {
  segments: WheelSegment[];
  title?: string;
  onResult?: (segment: WheelSegment) => void;
}

export const SpinWheel = ({ segments, title = "Spin to Win!", onResult }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const segmentAngle = 360 / segments.length;

  const spin = () => {
    if (spinning || segments.length === 0) return;
    setSpinning(true);
    setResult(null);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + extraSpins * 360 + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const winningIndex = Math.floor(normalizedAngle / segmentAngle) % segments.length;
      const winner = segments[winningIndex];
      setResult(winner);
      setSpinning(false);
      onResult?.(winner);
    }, 4000);
  };

  const defaultColors = [
    "hsl(217 91% 60%)", "hsl(270 95% 75%)", "hsl(142 76% 36%)",
    "hsl(38 92% 50%)", "hsl(0 84% 60%)", "hsl(200 80% 50%)",
    "hsl(280 70% 55%)", "hsl(160 60% 45%)", "hsl(30 90% 55%)",
    "hsl(320 70% 60%)",
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        <svg
          ref={wheelRef}
          viewBox="0 0 300 300"
          className="w-72 h-72 md:w-80 md:h-80 drop-shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
        >
          {segments.map((seg, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            const startRad = (Math.PI / 180) * (startAngle - 90);
            const endRad = (Math.PI / 180) * (endAngle - 90);
            const x1 = 150 + 140 * Math.cos(startRad);
            const y1 = 150 + 140 * Math.sin(startRad);
            const x2 = 150 + 140 * Math.cos(endRad);
            const y2 = 150 + 140 * Math.sin(endRad);
            const largeArc = segmentAngle > 180 ? 1 : 0;
            const midAngle = (startAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
            const textX = 150 + 90 * Math.cos(midAngle);
            const textY = 150 + 90 * Math.sin(midAngle);
            const textRotation = startAngle + segmentAngle / 2;
            const color = seg.color || defaultColors[i % defaultColors.length];

            return (
              <g key={seg.id}>
                <path
                  d={`M150,150 L${x1},${y1} A140,140 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize={segments.length > 8 ? "8" : "10"}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                >
                  {seg.label.length > 12 ? seg.label.slice(0, 12) + "…" : seg.label}
                </text>
              </g>
            );
          })}
          <circle cx="150" cy="150" r="20" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
          <circle cx="150" cy="150" r="8" fill="hsl(var(--primary))" />
        </svg>
      </div>

      <Button
        size="lg"
        className="bg-gradient-primary hover:opacity-90 text-lg px-8 shadow-glow"
        onClick={spin}
        disabled={spinning || segments.length === 0}
      >
        {spinning ? "Spinning..." : "🎰 SPIN NOW!"}
      </Button>

      {result && (
        <Card className="w-full max-w-sm border-primary bg-primary/5 animate-in fade-in zoom-in-95">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-primary mb-1">Congratulations!</h3>
            <p className="text-lg font-semibold">{result.label}</p>
            {result.value && (
              <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Your reward:</p>
                <p className="text-lg font-bold text-primary">{result.value}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
