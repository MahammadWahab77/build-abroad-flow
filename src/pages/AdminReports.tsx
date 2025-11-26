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
      const yetToContactLeads = leadsRes.data?.filter(
        (l) => l.current_stage === "Yet to Contact"
      ).length || 0;
      const applicationInProgressLeads = leadsRes.data?.filter(
        (l) => l.current_stage === "Application in Progress"
      ).length || 0;
      const commissionReceivedLeads = leadsRes.data?.filter(
        (l) => l.current_stage === "Commission Received"
      ).length || 0;

      // Conversion 1: Yet to Contact to Application in Progress
      const totalEligibleForFirstConversion = yetToContactLeads + applicationInProgressLeads + commissionReceivedLeads;
      const firstConversionRate = totalEligibleForFirstConversion > 0 
        ? Math.round(((applicationInProgressLeads + commissionReceivedLeads) / totalEligibleForFirstConversion) * 100) 
        : 0;

      // Conversion 2: Application in Progress to Commission Received
      const totalEligibleForSecondConversion = applicationInProgressLeads + commissionReceivedLeads;
      const secondConversionRate = totalEligibleForSecondConversion > 0
        ? Math.round((commissionReceivedLeads / totalEligibleForSecondConversion) * 100)
        : 0;

      return {
        totalLeads,
        yetToContactLeads,
        applicationInProgressLeads,
        commissionReceivedLeads,
        firstConversionRate,
        secondConversionRate,
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
      title: "Yet to Contact → App in Progress",
      value: `${stats?.firstConversionRate || 0}%`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "App in Progress → Commission",
      value: `${stats?.secondConversionRate || 0}%`,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Commission Received",
      value: stats?.commissionReceivedLeads || 0,
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
