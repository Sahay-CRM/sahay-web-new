// import { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import clsx from "clsx";
// import { kpiMockData } from "./mockData";

// type LabelInfo = { label: string; year: number };

// const generateLabels = (period: string): LabelInfo[] => {
//   const labels: LabelInfo[] = [];
//   const now = new Date(2025, 4);

//   if (period === "Monthly") {
//     for (let i = 0; i < 15; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 2 - i);
//       labels.push({
//         label: date.toLocaleString("default", {
//           month: "short",
//         }),
//         year: date.getFullYear(),
//       });
//     }
//   } else if (period === "Quarterly") {
//     for (let i = 0; i < 15; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 6 - i * 3);
//       const quarter = Math.floor(date.getMonth() / 3) + 1;
//       labels.push({
//         label: `Q${quarter}`,
//         year: date.getFullYear(),
//       });
//     }
//   }

//   return labels;
// };

// export default function KPITable({ period }: { period: string }) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const filteredData = kpiMockData.filter((item) => item.period == period);
//   const headerLabels = generateLabels(period);

//   return (
//     <div className="overflow-x-auto border rounded-lg">
//       <Table className="min-w-full text-sm text-left">
//         <TableHeader className="text-gray-700">
//           <TableRow className="border-b">
//             <TableHead
//               className={clsx(
//                 "transition-all duration-300 sticky",
//                 isCollapsed ? "w-[40px]" : "w-[60px] px-3 py-2"
//               )}
//             ></TableHead>
//             <TableHead
//               className={clsx("sticky", isCollapsed ? "w-[80px]" : "px-3 py-2")}
//             >
//               KPI
//             </TableHead>
//             <TableHead
//               className={clsx(
//                 "sticky",
//                 isCollapsed ? "w-0 p-0 opacity-0" : "px-3 py-2 w-[80px]"
//               )}
//             >
//               Goal
//             </TableHead>
//             <TableHead
//               className={clsx(
//                 isCollapsed ? "w-0 p-0 opacity-0" : "px-3 py-2 w-[80px]"
//               )}
//             >
//               Sum
//             </TableHead>
//             <TableHead
//               className={clsx(
//                 "sticky",
//                 isCollapsed ? "w-0 p-0 opacity-0" : "px-3 py-2 w-[80px]"
//               )}
//             >
//               Avg
//             </TableHead>
//             <TableHead className="w-[40px] px-1 py-2">
//               <button
//                 onClick={() => setIsCollapsed((prev) => !prev)}
//                 className="hover:bg-gray-200 rounded-full p-1 bg-white text-black"
//               >
//                 {isCollapsed ? (
//                   <ChevronLeft size={16} />
//                 ) : (
//                   <ChevronRight size={16} />
//                 )}
//               </button>
//             </TableHead>

//             {headerLabels.map((label, i) => {
//               const now = new Date();
//               const isCurrent = (() => {
//                 if (period === "Monthly") {
//                   const currentMonth = now.toLocaleString("default", {
//                     month: "short",
//                   });
//                   const currentYear = now.getFullYear();
//                   if (
//                     currentMonth == label?.label &&
//                     currentYear == label?.year
//                   ) {
//                     return true;
//                   }
//                 } else if (period === "Quarterly") {
//                   const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
//                   const currentYear = now.getFullYear();
//                   const currentLabel = `Q${currentQuarter}`;
//                   if (
//                     currentLabel == label?.label &&
//                     currentYear == label?.year
//                   ) {
//                     return true;
//                   }
//                 }
//                 return false;
//               })();

//               return (
//                 <TableHead
//                   key={i}
//                   className={clsx(
//                     "px-3 py-2 w-[100px] text-center whitespace-nowrap",
//                     isCurrent
//                       ? "bg-gray-100 text-primary font-semibold"
//                       : "bg-white text-primary"
//                   )}
//                 >
//                   <div className="flex flex-col items-center leading-tight">
//                     <span>{label.label}</span>
//                     <span className="text-xs text-muted-foreground">
//                       {label.year}
//                     </span>
//                   </div>
//                 </TableHead>
//               );
//             })}
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {filteredData.map((item) => (
//             <TableRow
//               key={item.id}
//               className="border-b bg-gray-200 hover:bg-gray-50"
//             >
//               <TableCell
//                 className={clsx(
//                   "sticky",
//                   isCollapsed ? "w-[40px]" : "px-3 py-2 w-[60px]"
//                 )}
//               >
//                 <Avatar className="h-8 w-8">
//                   <AvatarImage src={item.profileUrl} alt="User" />
//                   <AvatarFallback>UE</AvatarFallback>
//                 </Avatar>
//               </TableCell>
//               <TableCell
//                 className={clsx(
//                   "sticky",
//                   isCollapsed ? "w-[80px]" : "px-3 py-2"
//                 )}
//               >
//                 {item.kpi}
//               </TableCell>
//               <TableCell
//                 className={clsx(
//                   "sticky",
//                   isCollapsed ? "w-0 p-0 opacity-0" : "px-3 py-2 w-[80px]"
//                 )}
//               >
//                 {item.goal}
//               </TableCell>
//               <TableCell
//                 className={clsx(
//                   "sticky",
//                   isCollapsed ? "w-0 p-0 opacity-0" : "px-3 py-2 w-[80px]"
//                 )}
//               >
//                 {item.sum}
//               </TableCell>
//               <TableCell
//                 className={clsx(
//                   "sticky",
//                   isCollapsed ? "w-0 p-0 opacity-0" : "px-3 py-2 w-[80px]"
//                 )}
//               >
//                 {item.avg}
//               </TableCell>
//               <TableCell className="w-[40px]" />
//               {headerLabels.map((_, i) => (
//                 <TableCell
//                   key={i}
//                   className={`px-3 py-2 bg-white ${i == 2 && "bg-gray-100"}`}
//                 >
//                   <input
//                     type="text"
//                     className={`border border-gray-300 rounded-sm text-sm ${i === 2 ? "bg-white" : "bg-white"}`}
//                     style={{ width: "80px", height: "40px" }}
//                     placeholder=""
//                   />
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

// import { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import clsx from "clsx";
// import { kpiMockData } from "./mockData";

// type LabelInfo = { label: string; year: number };

// const generateLabels = (period: string): LabelInfo[] => {
//   const labels: LabelInfo[] = [];
//   const now = new Date(2025, 4); // May 2025

//   if (period === "Monthly") {
//     for (let i = 0; i < 15; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 2 - i);
//       labels.push({
//         label: date.toLocaleString("default", { month: "short" }),
//         year: date.getFullYear(),
//       });
//     }
//   } else if (period === "Quarterly") {
//     for (let i = 0; i < 15; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 6 - i * 3);
//       const quarter = Math.floor(date.getMonth() / 3) + 1;
//       labels.push({
//         label: `Q${quarter}`,
//         year: date.getFullYear(),
//       });
//     }
//   }

//   return labels;
// };

// export default function KPITable({ period }: { period: string }) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const filteredData = kpiMockData.filter((item) => item.period === period);
//   const headerLabels = generateLabels(period);

//   return (
//     <div className="overflow-x-auto border rounded-lg max-w-full">
//       <Table className="min-w-[1400px] text-sm text-left">
//         <TableHeader className="text-gray-700">
//           <TableRow className="border-b bg-white">
//             <TableHead className="sticky left-0 z-10 bg-white w-[60px] px-3 py-2" />
//             <TableHead className="sticky left-[60px] z-10 bg-white px-3 py-2 w-[140px]">
//               KPI
//             </TableHead>
//             <TableHead className="sticky left-[200px] z-10 bg-white px-3 py-2 w-[80px]">
//               Goal
//             </TableHead>
//             <TableHead className="sticky left-[280px] z-10 bg-white px-3 py-2 w-[80px]">
//               Sum
//             </TableHead>
//             <TableHead className="sticky left-[360px] z-10 bg-white px-3 py-2 w-[80px]">
//               Avg
//             </TableHead>
//             <TableHead className="sticky left-[440px] z-10 bg-white w-[40px] px-1 py-2">
//               <button
//                 onClick={() => setIsCollapsed((prev) => !prev)}
//                 className="hover:bg-gray-200 rounded-full p-1 bg-white text-black"
//               >
//                 {isCollapsed ? (
//                   <ChevronLeft size={16} />
//                 ) : (
//                   <ChevronRight size={16} />
//                 )}
//               </button>
//             </TableHead>

//             {headerLabels.map((label, i) => {
//               const now = new Date();
//               const isCurrent = (() => {
//                 if (period === "Monthly") {
//                   const currentMonth = now.toLocaleString("default", {
//                     month: "short",
//                   });
//                   const currentYear = now.getFullYear();
//                   return (
//                     currentMonth === label.label && currentYear === label.year
//                   );
//                 } else if (period === "Quarterly") {
//                   const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
//                   const currentYear = now.getFullYear();
//                   const currentLabel = `Q${currentQuarter}`;
//                   return (
//                     currentLabel === label.label && currentYear === label.year
//                   );
//                 }
//                 return false;
//               })();

//               return (
//                 <TableHead
//                   key={i}
//                   className={clsx(
//                     "px-3 py-2 w-[100px] text-center whitespace-nowrap",
//                     isCurrent
//                       ? "bg-gray-100 text-primary font-semibold"
//                       : "bg-white text-primary"
//                   )}
//                 >
//                   <div className="flex flex-col items-center leading-tight">
//                     <span>{label.label}</span>
//                     <span className="text-xs text-muted-foreground">
//                       {label.year}
//                     </span>
//                   </div>
//                 </TableHead>
//               );
//             })}
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {filteredData.map((item) => (
//             <TableRow key={item.id} className="border-b bg-gray-100">
//               <TableCell className="sticky left-0 z-10 bg-gray-100 w-[60px] px-3 py-2">
//                 <Avatar className="h-8 w-8">
//                   <AvatarImage src={item.profileUrl} alt="User" />
//                   <AvatarFallback>UE</AvatarFallback>
//                 </Avatar>
//               </TableCell>
//               <TableCell className="sticky left-[60px] z-10 bg-gray-100 px-3 py-2 w-[140px]">
//                 {item.kpi}
//               </TableCell>
//               <TableCell className="sticky left-[200px] z-10 bg-gray-100 px-3 py-2 w-[80px]">
//                 {item.goal}
//               </TableCell>
//               <TableCell className="sticky left-[280px] z-10 bg-gray-100 px-3 py-2 w-[80px]">
//                 {item.sum}
//               </TableCell>
//               <TableCell className="sticky left-[360px] z-10 bg-gray-100 px-3 py-2 w-[80px]">
//                 {item.avg}
//               </TableCell>
//               <TableCell className="sticky left-[440px] z-10 bg-gray-100 w-[40px]" />

//               {headerLabels.map((_, i) => (
//                 <TableCell key={i} className="px-3 py-2 bg-white">
//                   <input
//                     type="text"
//                     className="border border-gray-300 rounded-sm text-sm bg-white"
//                     style={{ width: "80px", height: "40px" }}
//                     placeholder=""
//                   />
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

// ===================================================================================Separate Divs

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { kpiMockData } from "./mockData";

type LabelInfo = { label: string; year: number };
// const generateLabels = (period: string): LabelInfo[] => {
//   const labels: LabelInfo[] = [];
//   const now = new Date(2025, 4); // May 2025

//   if (period === "Monthly") {
//     for (let i = 0; i < 15; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 2 - i);
//       labels.push({
//         label: date.toLocaleString("default", { month: "short" }),
//         year: date.getFullYear(),
//       });
//     }
//   } else if (period === "Quarterly") {
//     for (let i = 0; i < 15; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 6 - i * 3);
//       const quarter = Math.floor(date.getMonth() / 3) + 1;
//       labels.push({
//         label: `Q${quarter}`,
//         year: date.getFullYear(),
//       });
//     }
//   } else if (period === "Half-Yearly") {
//     for (let i = 0; i < 10; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 12 - i * 6); // step back by 6 months
//       const month = date.getMonth();
//       let label = "";
//       let year = 0;

//       if (month >= 3 && month <= 8) {
//         // April to September => H1
//         label = "H1";
//         year = date.getFullYear();
//       } else {
//         // October to March => H2
//         label = "H2";
//         year = month <= 2 ? date.getFullYear() - 1 : date.getFullYear();
//       }

//       labels.push({ label, year });
//     }
//   } else if (period === "Yearly") {
//     for (let i = 0; i < 10; i++) {
//       const year = now.getFullYear() - i + 1; // financial year ending
//       labels.push({
//         label: `${year - 1}-${year.toString().slice(-2)}`, // e.g., 2023–24
//         year: year - 1,
//       });
//     }
//   }

//   return labels;
// };

const generateLabels = (period: string): LabelInfo[] => {
  const labels: LabelInfo[] = [];
  const now = new Date(2025, 4); // May 2025

  if (period === "Monthly") {
    for (let i = 0; i < 15; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() + 2 - i);
      labels.push({
        label: date.toLocaleString("default", { month: "short" }),
        year: date.getFullYear(),
      });
    }
  } else if (period === "Quarterly") {
    for (let i = 0; i < 15; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() + 6 - i * 3);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      labels.push({
        label: `Q${quarter}`,
        year: date.getFullYear(),
      });
    }
  } else if (period === "Half-Yearly") {
    for (let i = 0; i < 10; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() + 12 - i * 6);
      const month = date.getMonth();
      let label = "";
      let year = 0;

      if (month >= 3 && month <= 8) {
        label = "H1";
        year = date.getFullYear();
      } else {
        label = "H2";
        year = month <= 2 ? date.getFullYear() - 1 : date.getFullYear();
      }

      labels.push({ label, year });
    }
  } else if (period === "Yearly") {
    for (let i = 0; i < 10; i++) {
      const year = now.getFullYear() - i + 1;
      labels.push({
        label: `${year - 1}-${year.toString().slice(-2)}`,
        year: year - 1,
      });
    }
  } else if (period === "Daily") {
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      labels.push({
        label: date.toLocaleDateString("default", {
          day: "2-digit",
          month: "short",
        }),
        year: date.getFullYear(),
      });
    }
  } else if (period === "Weekly") {
    // const weeks: LabelInfo[] = [];
    const startFrom = new Date(now);
    startFrom.setMonth(3); // April
    startFrom.setDate(1); // April 1
    startFrom.setHours(0, 0, 0, 0);

    // Find the first Saturday on or after April 1
    const firstWeekEnd = new Date(startFrom);
    const day = firstWeekEnd.getDay();
    const daysToSaturday = (6 - day + 7) % 7;
    firstWeekEnd.setDate(firstWeekEnd.getDate() + daysToSaturday);

    const weekRanges: { start: Date; end: Date }[] = [];

    // First week: Apr 1 – first Saturday
    weekRanges.push({
      start: new Date(startFrom),
      end: new Date(firstWeekEnd),
    });

    // Continue adding weeks till current date (backwards)
    let currentEnd = new Date(firstWeekEnd);

    while (currentEnd < now) {
      const start = new Date(currentEnd);
      start.setDate(start.getDate() + 1);

      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Sunday–Saturday week

      if (end > now) end.setTime(now.getTime());

      weekRanges.push({ start, end });

      currentEnd = new Date(end);
    }

    // Pick last 10 weeks (reverse to show recent first)
    const lastWeeks = weekRanges.slice(-10).reverse();

    for (const week of lastWeeks) {
      const label = `${week.start.getDate().toString().padStart(2, "0")} ${week.start.toLocaleString("default", { month: "short" })} - ${week.end.getDate().toString().padStart(2, "0")} ${week.end.toLocaleString("default", { month: "short" })}`;
      labels.push({
        label,
        year: week.start.getFullYear(),
      });
    }
  }

  return labels;
};

export default function KPITable({ period }: { period: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const filteredData = kpiMockData.filter((item) => item.period == period);
  const headerLabels = generateLabels(period);

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <div className="bg-white sticky left-0 z-10 border-r">
          <Table className="min-w-fit text-sm text-left rounded-none">
            <TableHeader>
              <TableRow className="h-[50px]">
                <TableHead
                  className={clsx(
                    "bg-primary",
                    isCollapsed ? "w-[40px]" : "w-[60px] px-3 py-2",
                  )}
                ></TableHead>
                <TableHead
                  className={clsx(isCollapsed ? "w-[80px]" : "px-3 py-2")}
                >
                  KPI
                </TableHead>
                {!isCollapsed && (
                  <>
                    <TableHead className="px-3 py-2 w-[80px]">Goal</TableHead>
                    <TableHead className="px-3 py-2 w-[80px]">Sum</TableHead>
                    <TableHead className="px-3 py-2 w-[80px]">Avg</TableHead>
                  </>
                )}
                <TableHead className="w-[40px] px-1 py-2">
                  <button
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="hover:bg-gray-200 rounded-full p-1 bg-white text-black"
                  >
                    {isCollapsed ? (
                      <ChevronLeft size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b bg-gray-100 hover:bg-gray-50 h-[57px]"
                >
                  <TableCell
                    className={clsx(
                      isCollapsed ? "w-[40px]" : "px-3 py-2 w-[60px]",
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.profileUrl} alt="User" />
                      <AvatarFallback>UE</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell
                    className={clsx(isCollapsed ? "w-[80px]" : "px-3 py-2")}
                  >
                    {item.kpi}
                  </TableCell>
                  {!isCollapsed && (
                    <>
                      <TableCell className="px-3 py-2 w-[80px]">
                        {item.goal}
                      </TableCell>
                      <TableCell className="px-3 py-2 w-[80px]">
                        {item.sum}
                      </TableCell>
                      <TableCell className="px-3 py-2 w-[80px]">
                        {item.avg}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="w-[40px]" />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Scrollable right columns */}
        <div className="overflow-x-auto w-full scroll-thin">
          <Table className="min-w-max text-sm text-center">
            <TableHeader>
              <TableRow>
                {headerLabels.map((label, i) => {
                  const now = new Date();
                  const isCurrent = (() => {
                    if (period === "Monthly") {
                      const currentMonth = now.toLocaleString("default", {
                        month: "short",
                      });
                      return (
                        currentMonth === label.label &&
                        now.getFullYear() === label.year
                      );
                    } else {
                      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
                      return (
                        `Q${currentQuarter}` === label.label &&
                        now.getFullYear() === label.year
                      );
                    }
                  })();

                  return (
                    <TableHead
                      key={i}
                      className={clsx(
                        "px-3 py-2 w-[100px] whitespace-nowrap",
                        isCurrent
                          ? "bg-gray-100 text-primary font-semibold"
                          : "bg-white text-primary",
                      )}
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span>{label.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {label.year}
                        </span>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item, idx) => (
                <TableRow key={idx} className="bg-white border-b">
                  {headerLabels.map((_, i) => (
                    <TableCell
                      key={i}
                      className={`px-3 py-2 ${i === 2 ? "bg-gray-100" : ""}`}
                    >
                      <input
                        type="text"
                        className={`border p-2 border-gray-300 rounded-sm text-sm w-[80px] h-[40px] ${i === 2 ? "bg-white" : ""}`}
                        placeholder=""
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------MATCH VALUE OF CELL

// import { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import clsx from "clsx";
// import { parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
// import { kpiMockData } from "./mockData";

// type LabelInfo = { label: string; year: number; month: number };

// const generateLabels = (period: string): LabelInfo[] => {
//   const labels: LabelInfo[] = [];
//   const now = new Date(2025, 4); // May 2025

//   if (period === "Monthly") {
//     for (let i = 0; i < 15; i++) {
//       const date = new Date(now);
//       date.setMonth(now.getMonth() + 2 - i);
//       labels.push({
//         label: date.toLocaleString("default", { month: "short" }),
//         year: date.getFullYear(),
//         month: date.getMonth(),
//       });
//     }
//   }

//   return labels;
// };

// export default function KPITable({ period }: { period: string }) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const filteredData = kpiMockData.filter((item) => item.period === period);
//   const headerLabels = generateLabels(period);

//   return (
//     <div className="relative w-full">
//       <div className="flex w-full">
//         {/* Left side fixed section */}
//         <div className="bg-white sticky left-0 z-10 border-r">
//           <Table className="min-w-fit text-sm text-left rounded-none">
//             <TableHeader>
//               <TableRow className="h-[50px]">
//                 <TableHead
//                   className={clsx(
//                     "bg-primary",
//                     isCollapsed ? "w-[40px]" : "w-[60px] px-3 py-2"
//                   )}
//                 ></TableHead>
//                 <TableHead
//                   className={clsx(isCollapsed ? "w-[80px]" : "px-3 py-2")}
//                 >
//                   KPI
//                 </TableHead>
//                 {!isCollapsed && (
//                   <>
//                     <TableHead className="px-3 py-2 w-[80px]">Goal</TableHead>
//                     <TableHead className="px-3 py-2 w-[80px]">Sum</TableHead>
//                     <TableHead className="px-3 py-2 w-[80px]">Avg</TableHead>
//                   </>
//                 )}
//                 <TableHead className="w-[40px] px-1 py-2">
//                   <button
//                     onClick={() => setIsCollapsed((prev) => !prev)}
//                     className="hover:bg-gray-200 rounded-full p-1 bg-white text-black"
//                   >
//                     {isCollapsed ? (
//                       <ChevronLeft size={16} />
//                     ) : (
//                       <ChevronRight size={16} />
//                     )}
//                   </button>
//                 </TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {filteredData.map((item) => (
//                 <TableRow
//                   key={item.id}
//                   className="border-b bg-gray-100 hover:bg-gray-50 h-[57px]"
//                 >
//                   <TableCell
//                     className={clsx(
//                       isCollapsed ? "w-[40px]" : "px-3 py-2 w-[60px]"
//                     )}
//                   >
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage src={item.profileUrl} alt="User" />
//                       <AvatarFallback>UE</AvatarFallback>
//                     </Avatar>
//                   </TableCell>
//                   <TableCell
//                     className={clsx(isCollapsed ? "w-[80px]" : "px-3 py-2")}
//                   >
//                     {item.kpi}
//                   </TableCell>
//                   {!isCollapsed && (
//                     <>
//                       <TableCell className="px-3 py-2 w-[80px]">
//                         {item.goal}
//                       </TableCell>
//                       <TableCell className="px-3 py-2 w-[80px]">
//                         {item.sum}
//                       </TableCell>
//                       <TableCell className="px-3 py-2 w-[80px]">
//                         {item.avg}
//                       </TableCell>
//                     </>
//                   )}
//                   <TableCell className="w-[40px]" />
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Right scrollable section */}
//         <div className="overflow-x-auto w-full scroll-thin">
//           <Table className="min-w-max text-sm text-center">
//             <TableHeader>
//               <TableRow>
//                 {headerLabels.map((label, i) => {
//                   const now = new Date();
//                   const isCurrent =
//                     label.month === now.getMonth() &&
//                     label.year === now.getFullYear();

//                   return (
//                     <TableHead
//                       key={i}
//                       className={clsx(
//                         "px-3 py-2 w-[100px] whitespace-nowrap",
//                         isCurrent
//                           ? "bg-gray-100 text-primary font-semibold"
//                           : "bg-white text-primary"
//                       )}
//                     >
//                       <div className="flex flex-col items-center leading-tight">
//                         <span>{label.label}</span>
//                         <span className="text-xs text-muted-foreground">
//                           {label.year}
//                         </span>
//                       </div>
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {filteredData.map((item, idx) => (
//                 <TableRow key={idx} className="bg-white border-b">
//                   {headerLabels.map((label, i) => {
//                     const matchedCell = item.cells?.find((cell) => {
//                       if (!cell.startDate || !cell.endDate) return false;
//                       const start = parseISO(cell.startDate);
//                       const end = parseISO(cell.endDate);
//                       console.log(
//                         startOfMonth(new Date(label.year, label.month)),
//                         "<===== "
//                       );
//                       return (
//                         isWithinInterval(start, {
//                           start: startOfMonth(
//                             new Date(label.year, label.month)
//                           ),
//                           end: endOfMonth(new Date(label.year, label.month)),
//                         }) ||
//                         isWithinInterval(end, {
//                           start: startOfMonth(
//                             new Date(label.year, label.month)
//                           ),
//                           end: endOfMonth(new Date(label.year, label.month)),
//                         })
//                       );
//                     });

//                     return (
//                       <TableCell key={i} className="px-3 py-2">
//                         <input
//                           type="text"
//                           className="border p-2 border-gray-300 rounded-sm text-sm w-[80px] h-[40px]"
//                           value={matchedCell?.amount ?? ""}
//                           placeholder=""
//                           readOnly
//                         />
//                       </TableCell>
//                     );
//                   })}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// }
