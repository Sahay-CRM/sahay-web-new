// "use client";

// import {
//   Sidebar,
//   SidebarHeader,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarFooter,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import {
//   Tooltip,
//   TooltipTrigger,
//   TooltipContent,
// } from "@/components/ui/tooltip";
// import { cn } from "@/lib/utils";
// import { Home, Settings, User } from "lucide-react";

// const navItems = [
//   { title: "Home", url: "/home", icon: Home },
//   { title: "Profile", url: "/profile", icon: User },
//   { title: "Settings", url: "/settings", icon: Settings },
// ];

// export default function CustomSidebar() {
// //   const isCollapsed = state === "collapsed";

//   return (
//     <Sidebar collapsible="icon">
//       <SidebarHeader className="bg-black flex items-center justify-center py-4">
//         <span className={cn("text-white text-xl", isCollapsed && "text-sm")}>
//           {isCollapsed ? "UX" : "UserEx"}
//         </span>
//       </SidebarHeader>

//       <SidebarContent className="overflow-y-auto">
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {navItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <Tooltip key={isCollapsed ? "collapsed" : "expanded"}>
//                     <TooltipTrigger asChild>
//                       <SidebarMenuButton asChild>
//                         <a
//                           href={item.url}
//                           className="flex h-12 items-center gap-2 text-white hover:text-black"
//                         >
//                           <item.icon className="h-5 w-5" />
//                           <span className="truncate">{item.title}</span>
//                         </a>
//                       </SidebarMenuButton>
//                     </TooltipTrigger>
//                     {isCollapsed && (
//                       <TooltipContent side="right">{item.title}</TooltipContent>
//                     )}
//                   </Tooltip>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="bg-black text-white p-4">
//         {/* Add your user footer like <NavUser /> here */}
//         <div className="flex items-center gap-2">
//           <User className="h-6 w-6" />
//           {!isCollapsed && (
//             <div className="text-sm">
//               <p className="font-semibold">John Doe</p>
//               <p className="text-xs">Admin</p>
//             </div>
//           )}
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }
