import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Globe, BookOpen, Calendar, User } from "lucide-react";

export default function LeadWorkspace() {
  const { id } = useParams<{ id: string }>();
  const leadId = id ? parseInt(id, 10) : undefined;

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) throw new Error("Invalid lead ID");
      
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          counselor:users!leads_counselor_id_users_id_fk(name, email),
          manager:users!leads_manager_id_users_id_fk(name, email)
        `)
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });

  const { data: tasks } = useQuery({
    queryKey: ["lead-tasks", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          user:users(name)
        `)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
  });

  const { data: remarks } = useQuery({
    queryKey: ["lead-remarks", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("remarks")
        .select(`
          *,
          user:users(name)
        `)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading lead...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!lead) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Lead not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{lead.name}</h1>
            <p className="text-muted-foreground">Lead ID: {lead.id}</p>
          </div>
          <Badge className="text-sm">{lead.current_stage}</Badge>
        </div>

        {/* Lead Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{lead.country || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{lead.course || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Intake</p>
                  <p className="font-medium">{lead.intake || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Counselor</p>
                  <p className="font-medium">{lead.counselor?.name || "Unassigned"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="remarks">Remarks ({remarks?.length || 0})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border-l-2 border-primary pl-4 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{task.task_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">By {task.user?.name}</p>
                        {task.remarks && (
                          <p className="text-sm mt-2">{task.remarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No tasks yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remarks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Remarks & Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {remarks && remarks.length > 0 ? (
                  <div className="space-y-4">
                    {remarks.map((remark) => (
                      <div key={remark.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{remark.user?.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(remark.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{remark.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No remarks yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Stage Change History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Stage history will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
