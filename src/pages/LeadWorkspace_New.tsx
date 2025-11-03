import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LeadHeader } from '@/components/lead/LeadHeader';
import { StageProgress } from '@/components/lead/StageProgress';
import { LeadDataCard } from '@/components/lead/LeadDataCard';
import { CreateTaskCard } from '@/components/lead/CreateTaskCard';
import type { LeadData, TaskData, RemarkData, StageHistoryData, UniversityAppData } from '@/types/lead';
import { ClipboardList, MessageSquare, History, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const LeadWorkspaceNew = () => {
  const { id } = useParams<{ id: string }>();
  const leadId = id ?? '';
  const leadIdNum = Number(leadId);

  // Check for invalid ID
  if (!Number.isFinite(leadIdNum)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-destructive mb-4">Invalid Lead ID</p>
            <p className="text-muted-foreground">The lead ID in the URL is not valid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch lead data
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', leadIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadIdNum)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        course: data.course,
        intake: data.intake,
        source: data.source,
        passportStatus: data.passport_status,
        currentStage: data.current_stage,
        counselorName: data.counsellors,
        createdAt: data.created_at
      } as LeadData;
    },
    enabled: Number.isFinite(leadIdNum)
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', leadIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('lead_id', leadIdNum)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(task => ({
        id: task.id,
        taskType: task.task_type,
        remarks: task.remarks,
        createdAt: task.created_at,
        userId: task.user_id
      })) as TaskData[];
    },
    enabled: Number.isFinite(leadIdNum)
  });

  // Fetch remarks
  const { data: remarks = [] } = useQuery({
    queryKey: ['remarks', leadIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remarks')
        .select('*')
        .eq('lead_id', leadIdNum)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(remark => ({
        id: remark.id,
        content: remark.content,
        userId: remark.user_id,
        createdAt: remark.created_at
      })) as RemarkData[];
    },
    enabled: Number.isFinite(leadIdNum)
  });

  // Fetch stage history
  const { data: stageHistory = [] } = useQuery({
    queryKey: ['stage_history', leadIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stage_history')
        .select('*')
        .eq('lead_id', leadIdNum)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(history => ({
        id: history.id,
        fromStage: history.from_stage,
        toStage: history.to_stage,
        userId: history.user_id,
        reason: history.reason,
        createdAt: history.created_at
      })) as StageHistoryData[];
    },
    enabled: Number.isFinite(leadIdNum)
  });

  // Fetch university applications
  const { data: universities = [] } = useQuery({
    queryKey: ['universities', leadIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('university_applications')
        .select('*')
        .eq('lead_id', leadIdNum)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(uni => ({
        id: uni.id,
        universityName: uni.university_name,
        universityUrl: uni.university_url,
        username: uni.username,
        password: uni.password,
        status: uni.status,
        createdAt: uni.created_at
      })) as UniversityAppData[];
    },
    enabled: Number.isFinite(leadIdNum)
  });

  if (leadLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading lead data...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-destructive mb-4">Lead Not Found</p>
            <p className="text-muted-foreground">The lead you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateTask = () => {
    // TODO: Open task creation modal
    console.log('Create task clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <LeadHeader lead={lead} />

        {/* Stage Progress */}
        <StageProgress currentStage={lead.currentStage} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Data */}
          <div className="space-y-6">
            <LeadDataCard lead={lead} />
            <CreateTaskCard onCreateTask={handleCreateTask} />
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Tasks
                  <Badge variant="secondary" className="ml-1">{tasks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="remarks" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Remarks
                  <Badge variant="secondary" className="ml-1">{remarks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                  <Badge variant="secondary" className="ml-1">{stageHistory.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="universities" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Universities
                  <Badge variant="secondary" className="ml-1">{universities.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="mt-6">
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No tasks yet. Create your first task to get started.
                      </CardContent>
                    </Card>
                  ) : (
                    tasks.map((task) => (
                      <Card key={task.id}>
                        <CardContent className="py-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline">{task.taskType}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {task.createdAt && format(new Date(task.createdAt), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mt-2">{task.remarks}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="remarks" className="mt-6">
                <div className="space-y-4">
                  {remarks.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No remarks yet.
                      </CardContent>
                    </Card>
                  ) : (
                    remarks.map((remark) => (
                      <Card key={remark.id}>
                        <CardContent className="py-4">
                          <p className="text-sm text-foreground">{remark.content}</p>
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {format(new Date(remark.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <div className="space-y-4">
                  {stageHistory.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No stage changes yet.
                      </CardContent>
                    </Card>
                  ) : (
                    stageHistory.map((history) => (
                      <Card key={history.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{history.fromStage || 'Initial'}</span>
                            <span>→</span>
                            <span className="font-medium text-foreground">{history.toStage}</span>
                          </div>
                          {history.reason && (
                            <p className="text-sm text-muted-foreground mt-2">{history.reason}</p>
                          )}
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {format(new Date(history.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="universities" className="mt-6">
                <div className="space-y-4">
                  {universities.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No university applications yet.
                      </CardContent>
                    </Card>
                  ) : (
                    universities.map((uni) => (
                      <Card key={uni.id}>
                        <CardContent className="py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-foreground">{uni.universityName}</h4>
                              {uni.universityUrl && (
                                <a
                                  href={uni.universityUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  Visit Website
                                </a>
                              )}
                            </div>
                            <Badge variant={uni.status === 'Offer Received' ? 'default' : 'secondary'}>
                              {uni.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadWorkspaceNew;
