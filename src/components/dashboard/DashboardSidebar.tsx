
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Briefcase, 
  Settings, 
  PenTool,
  BrainCircuit,
  BookOpen,
  GraduationCap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const mainItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Resume/CV", url: "/documents", icon: FileText },
    { title: "Cover Letters", url: "/cover-letters", icon: PenTool },
    { title: "Assessments", url: "/assessments", icon: BrainCircuit },
    { title: "LinkedIn Profile", url: "/linkedin", icon: Briefcase },
  ];

  const resourceItems = [
    { title: "Guides", url: "/guides", icon: BookOpen },
    { title: "Courses", url: "/courses", icon: GraduationCap },
  ];

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive 
        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    );
  };

  return (
    <Sidebar 
      className={cn(
        "border-r border-border",
        collapsed ? "w-[68px]" : "w-64"
      )}
      collapsible="icon"
    >
      <div className={cn(
        "flex h-14 items-center border-b px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <span className="text-xl font-semibold tracking-tight">CareerAI</span>
        )}
        <SidebarTrigger />
      </div>

      <SidebarContent className="p-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass}
                      end={item.url === "/"}
                    >
                      <item.icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          {!collapsed && <SidebarGroupLabel>Resources</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass}
                    >
                      <item.icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarGroup className="mt-4">
            {!collapsed && <SidebarGroupLabel>User</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/profile"
                      className={getNavClass}
                    >
                      <User className={cn("h-5 w-5", collapsed && "mx-auto")} />
                      {!collapsed && <span>Profile</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/settings"
                      className={getNavClass}
                    >
                      <Settings className={cn("h-5 w-5", collapsed && "mx-auto")} />
                      {!collapsed && <span>Settings</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
