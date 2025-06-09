// import { Key, useEffect, useState } from "react";
// import { RadialBarChart, RadialBar } from "recharts";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartConfig,
// } from "@/components/ui/chart";
// import useGetHealthScore from "@/features/api/healthDashboard/getHealthScore";

// const chartConfig = {
//   value: {
//     label: "Usage",
//     color: "#22c55e",
//   },
// } satisfies ChartConfig;

// function valueToAngle(value: number) {
//   return 180 - (value * 180) / 100;
// }
// function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
//   const angleRad = (Math.PI * angleDeg) / 180;
//   return {
//     x: cx + r * Math.cos(angleRad),
//     y: cy - r * Math.sin(angleRad),
//   };
// }
// export default function Graph() {
//   const { data } = useGetHealthScore();
//   const companyResult = data?.data?.companyResult || {};
//   const individualResult = data?.data?.individualResult || [];

//   // Animation for company chart
//   const companyPercent = companyResult.healthPercentage ?? 0;
//   const [animatedCompany, setAnimatedCompany] = useState(0);
//   const [companyChartData, setCompanyChartData] = useState([
//     { name: "Usage", value: 0 },
//   ]);

//   useEffect(() => {
//     let start = 0;
//     const end = companyPercent;
//     const duration = 600;
//     const increment = Math.ceil(end / (duration / 16)) || 1;

//     const step = () => {
//       start = Math.min(start + increment, end);
//       setAnimatedCompany(start);
//       setCompanyChartData([{ name: "Usage", value: start }]);
//       if (start < end) {
//         requestAnimationFrame(step);
//       }
//     };
//     step();
//   }, [companyPercent]);

//   // Animation for each core parameter
//   const [animatedCores, setAnimatedCores] = useState<number[]>([]);
//   const [coreChartData, setCoreChartData] = useState<
//     { name: string; value: number }[][]
//   >([]);

//   useEffect(() => {
//     const newAnimated: number[] = [];
//     const newChartData: { name: string; value: number }[][] = [];

//     individualResult.forEach(
//       (core: { healthPercentage: number }, idx: number) => {
//         let start = 0;
//         const end = core.healthPercentage ?? 0;
//         const duration = 600;
//         const increment = Math.ceil(end / (duration / 16)) || 1;

//         const animate = () => {
//           start = Math.min(start + increment, end);
//           newAnimated[idx] = start;
//           newChartData[idx] = [{ name: "Usage", value: start }];
//           setAnimatedCores((prev) => {
//             const arr = [...prev];
//             arr[idx] = start;
//             return arr;
//           });
//           setCoreChartData((prev) => {
//             const arr = [...prev];
//             arr[idx] = [{ name: "Usage", value: start }];
//             return arr;
//           });
//           if (start < end) {
//             requestAnimationFrame(animate);
//           }
//         };
//         animate();
//       },
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(individualResult)]);

//   // Increase chart size
//   const width = 380;
//   const height = 260;
//   const cx = 190;
//   const cy = 190;
//   const innerRadius = 160;
//   const outerRadius = 190;
//   const needleLength = outerRadius - 19;

//   const companyScore = companyResult.totalScore ?? 0;
//   const companyWeight = companyResult.totalWeightage ?? 0;
//   const companyAngle = valueToAngle(animatedCompany);
//   const companyNeedle = polarToCartesian(cx, cy, needleLength, companyAngle);

//   return (
//     <div className="flex flex-col items-center gap-10">
//       {/* Company Chart */}
//       {/* <div className="w-full flex"> */}
//       <Card className="w-full h-auto items-center justify-center p-12 rounded-xl">
//         <CardContent className="flex flex-col items-center justify-center">
//           <div className="mb-2 text-xl font-semibold text-primary">
//             Overall Health Score
//           </div>
//           <ChartContainer
//             config={chartConfig}
//             className="w-full h-auto items-center justify-center"
//             style={{ height }}
//           >
//             <div style={{ width, height }}>
//               <div className="ml-10 mb-0">
//                 <RadialBarChart
//                   width={width}
//                   height={height}
//                   startAngle={180}
//                   endAngle={0}
//                   innerRadius={innerRadius}
//                   outerRadius={outerRadius}
//                   cx={cx}
//                   cy={cy}
//                   data={companyChartData}
//                 >
//                   <defs>
//                     <linearGradient
//                       id="usageGradient"
//                       x1="0"
//                       y1="0"
//                       x2="1"
//                       y2="1"
//                     >
//                       <stop offset="0%" stopColor="#4ade80" />
//                       <stop offset="100%" stopColor="#22c55e" />
//                     </linearGradient>
//                     <filter
//                       id="needleShadow"
//                       x="0"
//                       y="0"
//                       width="200%"
//                       height="100%"
//                     >
//                       <feDropShadow
//                         dx="0"
//                         dy="2"
//                         stdDeviation="3"
//                         floodColor="#000"
//                         floodOpacity="0.3"
//                       />
//                     </filter>
//                   </defs>
//                   <RadialBar
//                     dataKey="dummy"
//                     clockWise
//                     data={[{ name: "BG", dummy: 100 }]}
//                     fill="#eee"
//                     isAnimationActive={false}
//                   />
//                   <RadialBar
//                     dataKey="value"
//                     // clockWise
//                     fill="url(#usageGradient)"
//                     cornerRadius={4}
//                     isAnimationActive={false}
//                   />
//                   <g filter="url(#needleShadow)">
//                     <line
//                       x1={cx}
//                       y1={cy}
//                       x2={companyNeedle.x}
//                       y2={companyNeedle.y}
//                       stroke="#1f2937"
//                       strokeWidth={4}
//                       strokeLinecap="round"
//                     />
//                     <circle cx={cx} cy={cy} r={6} fill="#1f2937" />
//                     <circle
//                       cx={cx}
//                       cy={cy}
//                       r={10}
//                       fill="url(#usageGradient)"
//                       opacity="0.3"
//                     />
//                     <text
//                       x={companyNeedle.x - 22}
//                       y={companyNeedle.y - 12}
//                       fontSize="19"
//                     >
//                       {animatedCompany}%
//                     </text>
//                   </g>
//                   <ChartTooltip
//                     cursor={false}
//                     content={<ChartTooltipContent hideLabel />}
//                   />
//                 </RadialBarChart>
//               </div>
//               <div className="flex flex-col items-center justify-center text-gray-500">
//                 <span className="text-2xl">
//                   {companyScore} / {companyWeight}
//                 </span>
//               </div>
//             </div>
//           </ChartContainer>
//         </CardContent>
//       </Card>
//       {/* </div> */}

//       <Card className="w-full rounded-xl">
//         <CardContent className="flex flex-col items-center justify-center p-6">
//           <div className="mb-6 text-xl font-semibold text-primary">
//             Core Parameter wise Health Score
//           </div>
//           <div className="flex flex-row flex-wrap gap-x-16 gap-y-12 w-full justify-start">
//             {individualResult.map(
//               (
//                 core: {
//                   totalScoreCP: number;
//                   totalWeightageCP: number;
//                   coreParameterId: Key | null | undefined;
//                   coreParameterName: string;
//                 },
//                 idx: number,
//               ) => {
//                 const indScore = core.totalScoreCP ?? 0;
//                 const indWeight = core.totalWeightageCP ?? 0;
//                 const animated = animatedCores[idx] || 0;
//                 const indAngle = valueToAngle(animated);
//                 const indNeedle = polarToCartesian(
//                   cx,
//                   cy,
//                   needleLength,
//                   indAngle,
//                 );

//                 return (
//                   <div key={core.coreParameterId} className="w-[380px]">
//                     <div className=" text-lg font-semibold  text-center">
//                       {core.coreParameterName || "Core Parameter"}
//                     </div>
//                     <ChartContainer
//                       config={chartConfig}
//                       className="w-full"
//                       style={{ height }}
//                     >
//                       <div style={{ width, height }}>
//                         <RadialBarChart
//                           width={width}
//                           height={height}
//                           startAngle={180}
//                           endAngle={0}
//                           innerRadius={innerRadius}
//                           outerRadius={outerRadius}
//                           cx={cx}
//                           cy={cy}
//                           data={
//                             coreChartData[idx] || [{ name: "Usage", value: 0 }]
//                           }
//                         >
//                           <defs>
//                             <linearGradient
//                               id="usageGradient2"
//                               x1="0"
//                               y1="0"
//                               x2="1"
//                               y2="1"
//                             >
//                               <stop offset="0%" stopColor="#60a5fa" />
//                               <stop offset="100%" stopColor="#2563eb" />
//                             </linearGradient>
//                             <filter
//                               id="needleShadow2"
//                               x="0"
//                               y="0"
//                               width="200%"
//                               height="100%"
//                             >
//                               <feDropShadow
//                                 dx="0"
//                                 dy="2"
//                                 stdDeviation="3"
//                                 floodColor="#000"
//                                 floodOpacity="0.3"
//                               />
//                             </filter>
//                           </defs>
//                           <RadialBar
//                             dataKey="dummy"
//                             clockWise
//                             data={[{ name: "BG", dummy: 100 }]}
//                             fill="#eee"
//                             isAnimationActive={false}
//                           />
//                           <RadialBar
//                             dataKey="value"
//                             // clockWise
//                             fill="url(#usageGradient2)"
//                             cornerRadius={4}
//                             isAnimationActive={false}
//                           />
//                           <g filter="url(#needleShadow2)">
//                             <line
//                               x1={cx}
//                               y1={cy}
//                               x2={indNeedle.x}
//                               y2={indNeedle.y}
//                               stroke="#1f2937"
//                               strokeWidth={4}
//                               strokeLinecap="round"
//                             />
//                             <circle cx={cx} cy={cy} r={6} fill="#1f2937" />
//                             <circle
//                               cx={cx}
//                               cy={cy}
//                               r={10}
//                               fill="url(#usageGradient2)"
//                               opacity="0.3"
//                             />
//                             <text
//                               x={indNeedle.x - 20}
//                               y={indNeedle.y - 12}
//                               fontSize="19"
//                             >
//                               {animated}%
//                             </text>
//                           </g>
//                           <ChartTooltip
//                             cursor={false}
//                             content={<ChartTooltipContent hideLabel />}
//                           />
//                         </RadialBarChart>
//                         <div className="flex flex-col items-center justify-center text-gray-500">
//                           <span className="text-2xl ">
//                             {indScore} / {indWeight}
//                           </span>
//                         </div>
//                       </div>
//                     </ChartContainer>
//                   </div>
//                 );
//               },
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
