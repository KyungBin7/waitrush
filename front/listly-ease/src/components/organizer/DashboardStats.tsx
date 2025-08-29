import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, List, TrendingUp, Mail } from "lucide-react";

interface DashboardStatsProps {
  totalServices: number;
  totalParticipants: number;
  activeWaitlists: number;
  recentSignups: number;
}

export function DashboardStats({ 
  totalServices, 
  totalParticipants, 
  activeWaitlists, 
  recentSignups 
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Services",
      value: totalServices,
      icon: List,
      description: "Services created",
      color: "text-blue-600"
    },
    {
      title: "Total Participants",
      value: totalParticipants,
      icon: Users,
      description: "Gamers in queues",
      color: "text-green-600"
    },
    {
      title: "Active Waitlists",
      value: activeWaitlists,
      icon: TrendingUp,
      description: "Currently accepting",
      color: "text-purple-600"
    },
    {
      title: "Recent Signups",
      value: recentSignups,
      icon: Mail,
      description: "This week",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="glass shadow-card-premium animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}