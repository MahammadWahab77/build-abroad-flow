import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Users, TrendingUp, Clock, AlertCircle } from "lucide-react";

export default function CounselorDashboard() {
  const { profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["counselor-stats", profile?.id],
    queryFn: async () => {
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("counselor_id", profile?.id);

      const totalLeads = leads?.length || 0;
      const activeLeads = leads?.filter(
        (l) => !["Not Interested", "Irrelevant Lead", "Commission Received"].includes(l.current_stage)
      ).length || 0;
      const recentLeads = leads?.filter(
        (l) => {
          const daysSince = (Date.now() - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 7;
        }
      ).length || 0;

      return { totalLeads, activeLeads, recentLeads };
    },
  });

  const { data: myLeads } = useQuery({
    queryKey: ["my-leads", profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("counselor_id", profile?.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const kpiCards = [
    {
      title: "Total Assigned",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Applications",
      value: stats?.activeLeads || 0,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Recent Leads",
      value: stats?.recentLeads || 0,
      icon: Clock,
      color: "text-warning",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Counselor Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned leads</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
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

        {/* My Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>My Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myLeads?.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.country} • {lead.current_stage}
                    </p>
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
