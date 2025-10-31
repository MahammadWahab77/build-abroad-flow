import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, CheckCircle } from "lucide-react";

export default function AdminReports() {
  const { data: stats } = useQuery({
    queryKey: ["reports-stats"],
    queryFn: async () => {
      const [leadsRes, usersRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact" }),
        supabase.from("users").select("*").eq("role", "counselor"),
      ]);

      const totalLeads = leadsRes.count || 0;
      const activeLeads = leadsRes.data?.filter(
        (l) => !["Not Interested", "Irrelevant Lead", "Commission Received"].includes(l.current_stage)
      ).length || 0;
      const completedLeads = leadsRes.data?.filter((l) => l.current_stage === "Commission Received").length || 0;
      const conversionRate = totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0;

      return {
        totalLeads,
        activeLeads,
        completedLeads,
        conversionRate,
        counselorCount: usersRes.data?.length || 0,
      };
    },
  });

  const kpiCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Leads",
      value: stats?.activeLeads || 0,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Completed",
      value: stats?.completedLeads || 0,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      icon: BarChart3,
      color: "text-primary",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track your CRM performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Placeholder for charts */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Detailed analytics charts coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
