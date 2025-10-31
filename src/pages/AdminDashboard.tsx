import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Users, UserCheck, TrendingUp, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [leadsRes, usersRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact" }),
        supabase.from("users").select("*").eq("role", "counselor"),
      ]);

      const totalLeads = leadsRes.count || 0;
      const activeLeads = leadsRes.data?.filter(
        (l) => !["Not Interested", "Irrelevant Lead", "Commission Received"].includes(l.current_stage)
      ).length || 0;
      const counselors = usersRes.data?.length || 0;
      const completionRate = totalLeads > 0 ? Math.round((activeLeads / totalLeads) * 100) : 0;

      return { totalLeads, activeLeads, counselors, completionRate };
    },
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["recent-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, current_stage, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      return data || [];
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
      title: "Counselors",
      value: stats?.counselors || 0,
      icon: UserCheck,
      color: "text-warning",
    },
    {
      title: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your CRM system</p>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads?.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.current_stage}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(lead.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
