import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

const initialValue = 66; // usage percent

const chartConfig = {
  value: {
    label: "Usage",
    color: "#22c55e",
  },
} satisfies ChartConfig;

// Converts value (0-100%) to angle for needle (180° to 0°)
function valueToAngle(value: number) {
  return 180 - (value * 180) / 100;
}

// Converts polar coords to cartesian x,y for needle end point
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (Math.PI * angleDeg) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy - r * Math.sin(angleRad),
  };
}

export default function Graph() {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [data, setData] = useState([{ name: "Usage", value: 0 }]);

  useEffect(() => {
    let start = 0;
    const end = initialValue;
    const duration = 600;
    const increment = Math.ceil(end / (duration / 16));

    const step = () => {
      start = Math.min(start + increment, end);
      setAnimatedValue(start);
      setData([{ name: "Usage", value: start }]);

      if (start < end) {
        requestAnimationFrame(step);
      }
    };

    step();
  }, []);

  const width = 200;
  const height = 200;
  const cx = width / 2 + 100;
  const cy = 190;
  const innerRadius = 150;
  const outerRadius = 200;
  const needleLength = outerRadius - 33;

  const angle = valueToAngle(animatedValue);
  const needleCoord = polarToCartesian(cx, cy, needleLength, angle);

  return (
    <Card className="flex flex-col w-full h-full shadow-xl border-none rounded-xl">
      <CardContent className="flex flex-col items-center pb-0">
        <div className="">
          <ChartContainer
            config={chartConfig}
            className="mx-auto mt-5  w-full max-w-[1000px] h-full"
            style={{ height }}
          >
            <RadialBarChart
              width={width}
              height={height}
              startAngle={180}
              endAngle={0}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              cx={cx}
              cy={cy}
              data={data}
            >
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>

                <filter
                  id="needleShadow"
                  x="0"
                  y="0"
                  width="200%"
                  height="100%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodColor="#000"
                    floodOpacity="0.3"
                  />
                </filter>
              </defs>

              {/* Background arc */}
              <RadialBar
                dataKey="dummy"
                clockWise
                data={[{ name: "BG", dummy: 100 }]}
                fill="#eee"
                isAnimationActive={false}
              />

              {/* Usage fill arc */}
              <RadialBar
                dataKey="value"
                clockWise
                fill="url(#usageGradient)"
                cornerRadius={4}
                isAnimationActive={false}
              />

              {/* Needle + Percentage label */}
              <g filter="url(#needleShadow)">
                <line
                  x1={cx}
                  y1={cy}
                  x2={needleCoord.x}
                  y2={needleCoord.y}
                  stroke="#1f2937"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
                <circle cx={cx} cy={cy} r={6} fill="#1f2937" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill="url(#usageGradient)"
                  opacity="0.3"
                />

                {/* ✅ Percentage label above needle tip */}
                <text
                  x={needleCoord.x - 22}
                  y={needleCoord.y - 12}
                  //   textAnchor="middle"
                  //   dominantBaseline="middle"
                  fontSize="19"
                  //   fontWeight="bold"
                  //   fill="#1f2937"
                >
                  {animatedValue}%
                </text>
              </g>

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </RadialBarChart>

            {/* Label below chart */}
            <div className="flex flex-col items-center justify-center mt-4">
              <span className="text-2xl font-bold text-foreground">
                {animatedValue} / 100
              </span>
            </div>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
