import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Globe, BookOpen, Calendar, User, ArrowLeft, Plus, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// 18 stages for the CRM pipeline
const LEAD_STAGES = [
  'Yet to Assign',
  'Yet to Contact',
  'Contact Again',
  'Not Interested',
  'Planning Later',
  'Yet to Decide',
  'Irrelevant Lead',
  'Registered for Session',
  'Session Completed',
  'Docs Submitted',
  'Shortlisted Univ.',
  'Application in Progress',
  'Offer Letter Received',
  'Deposit Paid',
  'Visa Received',
  'Flight and Accommodation Booked',
  'Tuition Fee Paid',
  'Commission Received'
];

export default function LeadWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();
  const leadId = id ? parseInt(id, 10) : undefined;
  
  const [newRemark, setNewRemark] = useState("");
  const [newStage, setNewStage] = useState("");
  const [stageChangeReason, setStageChangeReason] = useState("");

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

  const { data: stageHistory } = useQuery({
    queryKey: ["lead-stage-history", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("stage_history")
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

  const { data: universityApplications } = useQuery({
    queryKey: ["lead-university-apps", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("university_applications")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
  });

  const { data: documents } = useQuery({
    queryKey: ["lead-documents", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          uploader:users(name)
        `)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!leadId,
  });

  const addRemarkMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!leadId || !profile) throw new Error("Missing data");
      
      const { error } = await supabase
        .from("remarks")
        .insert({
          lead_id: leadId,
          user_id: profile.id,
          content,
          is_visible: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-remarks", leadId] });
      toast({ title: "Success", description: "Remark added successfully" });
      setNewRemark("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add remark", variant: "destructive" });
    }
  });

  const changeStageMapMutation = useMutation({
    mutationFn: async ({ stage, reason }: { stage: string, reason: string }) => {
      if (!leadId || !profile) throw new Error("Missing data");
      
      // Update lead stage
      const { error: updateError } = await supabase
        .from("leads")
        .update({ current_stage: stage })
        .eq("id", leadId);

      if (updateError) throw updateError;

      // Add stage history
      const { error: historyError } = await supabase
        .from("stage_history")
        .insert({
          lead_id: leadId,
          user_id: profile.id,
          from_stage: lead?.current_stage,
          to_stage: stage,
          reason: reason || null
        });

      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-stage-history", leadId] });
      toast({ title: "Success", description: "Stage updated successfully" });
      setNewStage("");
      setStageChangeReason("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update stage", variant: "destructive" });
    }
  });

  const handleAddRemark = () => {
    if (newRemark.trim()) {
      addRemarkMutation.mutate(newRemark);
    }
  };

  const handleChangeStage = () => {
    if (newStage && newStage !== lead?.current_stage) {
      changeStageMapMutation.mutate({ stage: newStage, reason: stageChangeReason });
    }
  };

  const getStageColor = (stage: string) => {
    const stageIndex = LEAD_STAGES.indexOf(stage);
    if (stageIndex <= 1) return 'bg-destructive/10 text-destructive';
    if (stageIndex <= 5) return 'bg-warning/10 text-warning';
    if (stageIndex <= 10) return 'bg-primary/10 text-primary';
    if (stageIndex <= 14) return 'bg-secondary/10 text-secondary';
    return 'bg-success/10 text-success';
  };

  const getTaskStatusIcon = (task: any) => {
    if (task.call_status === 'Connected') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (task.call_status === 'Not Connected') return <XCircle className="h-4 w-4 text-destructive" />;
    if (task.session_status === 'Completed') return <CheckCircle2 className="h-4 w-4 text-success" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(profile?.role === 'admin' ? '/admin/leads' : '/counselor/leads')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              <p className="text-muted-foreground">Lead ID: {lead.id}</p>
            </div>
          </div>
          <Badge className={`text-sm ${getStageColor(lead.current_stage)}`}>
            {lead.current_stage}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Lead Overview */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
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

          {/* Stage Management */}
          <Card>
            <CardHeader>
              <CardTitle>Change Stage</CardTitle>
              <CardDescription>Update the lead's current stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Stage</label>
                <Select value={newStage} onValueChange={setNewStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason (Optional)</label>
                <Textarea
                  placeholder="Why is the stage being changed?"
                  value={stageChangeReason}
                  onChange={(e) => setStageChangeReason(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleChangeStage}
                disabled={!newStage || newStage === lead.current_stage || changeStageMapMutation.isPending}
                className="w-full"
              >
                Update Stage
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="remarks">Remarks ({remarks?.length || 0})</TabsTrigger>
            <TabsTrigger value="history">History ({stageHistory?.length || 0})</TabsTrigger>
            <TabsTrigger value="universities">Universities ({universityApplications?.length || 0})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
                <CardDescription>All tasks and activities for this lead</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTaskStatusIcon(task)}
                            <div>
                              <Badge variant="outline" className="mb-1">{task.task_type}</Badge>
                              {task.call_type && (
                                <Badge variant="secondary" className="ml-2">{task.call_type}</Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(task.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid gap-2 text-sm">
                          {task.call_status && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Call Status:</span>
                              <Badge variant="outline" className={
                                task.call_status === 'Connected' ? 'bg-success/10 text-success' : 
                                task.call_status === 'Not Connected' ? 'bg-destructive/10 text-destructive' : 
                                'bg-muted'
                              }>
                                {task.call_status}
                              </Badge>
                            </div>
                          )}
                          {task.session_status && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Session:</span>
                              <Badge variant="outline">{task.session_status}</Badge>
                            </div>
                          )}
                          {task.session_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {new Date(task.session_date).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {task.application_count && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Applications:</span>
                              <span className="font-medium">{task.application_count}</span>
                            </div>
                          )}
                          {task.remarks && (
                            <div className="mt-2 p-2 bg-muted rounded">
                              <p className="text-sm">{task.remarks}</p>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground mt-2">
                            By {task.user?.name}
                          </div>
                        </div>
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
            {/* Add Remark Form */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Remark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your remark or note..."
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={handleAddRemark}
                    disabled={!newRemark.trim() || addRemarkMutation.isPending}
                  >
                    Add Remark
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Remarks List */}
            <Card>
              <CardHeader>
                <CardTitle>Remarks & Notes</CardTitle>
                <CardDescription>All remarks and notes for this lead</CardDescription>
              </CardHeader>
              <CardContent>
                {remarks && remarks.length > 0 ? (
                  <div className="space-y-4">
                    {remarks.map((remark) => (
                      <div key={remark.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{remark.user?.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(remark.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{remark.content}</p>
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
                <CardDescription>Timeline of all stage changes for this lead</CardDescription>
              </CardHeader>
              <CardContent>
                {stageHistory && stageHistory.length > 0 ? (
                  <div className="space-y-4">
                    {stageHistory.map((history) => (
                      <div key={history.id} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {history.from_stage || 'New Lead'} → {history.to_stage}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(history.created_at).toLocaleString()}
                          </span>
                        </div>
                        {history.reason && (
                          <p className="text-sm text-muted-foreground mb-1">{history.reason}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Changed by {history.user?.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No stage changes recorded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universities">
            <Card>
              <CardHeader>
                <CardTitle>University Applications</CardTitle>
                <CardDescription>Track university applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {universityApplications && universityApplications.length > 0 ? (
                  <div className="space-y-4">
                    {universityApplications.map((app) => (
                      <div key={app.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{app.university_name}</h3>
                          </div>
                          <Badge variant="outline" className={
                            app.status === 'Accepted' ? 'bg-success/10 text-success' :
                            app.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                          }>
                            {app.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          {app.university_url && (
                            <div>
                              <span className="text-muted-foreground">Portal: </span>
                              <a href={app.university_url} target="_blank" rel="noopener noreferrer" 
                                className="text-primary hover:underline">
                                {app.university_url}
                              </a>
                            </div>
                          )}
                          {app.username && (
                            <div>
                              <span className="text-muted-foreground">Username: </span>
                              <span className="font-medium">{app.username}</span>
                            </div>
                          )}
                          <div className="text-muted-foreground text-xs">
                            Created: {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No university applications yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>All documents uploaded for this lead</CardDescription>
              </CardHeader>
              <CardContent>
                {documents && documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">{doc.document_type}</h4>
                            {doc.remarks && (
                              <p className="text-sm text-muted-foreground">{doc.remarks}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {doc.document_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
