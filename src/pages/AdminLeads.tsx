import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Search, Filter, UserPlus, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STAGES = [
  "Yet to Assign",
  "Yet to Contact",
  "Contact Again",
  "Not Interested",
  "Planning Later",
  "Yet to Decide",
  "Irrelevant Lead",
  "Registered for Session",
  "Session Completed",
  "Docs Submitted",
  "Shortlisted Univ.",
  "Application in Progress",
  "Offer Letter Received",
  "Deposit Paid",
  "Visa Received",
  "Flight and Accommodation Booked",
  "Tuition Fee Paid",
  "Commission Received",
];

export default function AdminLeads() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  
  // Dynamic filter states
  const [countryFilter, setCountryFilter] = useState("");
  const [intakeFilter, setIntakeFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [counselorFilter, setCounselorFilter] = useState("");

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          profiles:counselor_uuid(name)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data.map((lead: any) => ({
        ...lead,
        counselorName: lead.profiles?.name || null
      })) || [];
    },
  });

  // Fetch counselors
  const { data: counselors = [] } = useQuery({
    queryKey: ["counselors"],
    queryFn: async () => {
      // Step 1: get counselor user IDs from user_roles (no FK join available)
      const { data: roleRows, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'counselor');
      if (rolesError) throw rolesError;

      const ids = (roleRows || []).map((r: any) => r.user_id);
      if (ids.length === 0) return [] as any[];

      // Step 2: fetch active profiles for those IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids)
        .eq('is_active', true);

      if (profilesError) throw profilesError;
      return profiles || [];
    },
  });

  // Get unique filter values from leads data
  const countries = Array.from(new Set(leads.map((lead: any) => lead.country).filter(Boolean))) as string[];
  const intakes = Array.from(new Set(leads.map((lead: any) => lead.intake).filter(Boolean))) as string[];
  const sources = Array.from(new Set(leads.map((lead: any) => lead.source).filter(Boolean))) as string[];

  // Enhanced filtering with multiple criteria
  const filteredLeads = leads.filter((lead: any) => {
    const matchesStage = selectedStages.length === 0 || selectedStages.includes(lead.current_stage);
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (lead.phone && lead.phone.includes(searchTerm));
    const matchesCountry = !countryFilter || countryFilter === "all-countries" || lead.country === countryFilter;
    const matchesIntake = !intakeFilter || intakeFilter === "all-intakes" || lead.intake === intakeFilter;
    const matchesSource = !sourceFilter || sourceFilter === "all-sources" || lead.source === sourceFilter;
    const matchesCounselor = !counselorFilter || counselorFilter === "all-counselors" || 
      (lead.counselor_uuid && lead.counselor_uuid === counselorFilter) ||
      (counselorFilter === "unassigned" && !lead.counselor_uuid);
    
    return matchesStage && matchesSearch && matchesCountry && matchesIntake && matchesSource && matchesCounselor;
  });

  const bulkAssignMutation = useMutation({
    mutationFn: async ({ leadIds, counselorId }: { leadIds: number[], counselorId: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ counselor_uuid: counselorId })
        .in("id", leadIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast({ title: "Success", description: "Leads assigned successfully" });
      setSelectedLeads([]);
      setSelectedCounselor("");
      setShowBulkAssign(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign leads", variant: "destructive" });
    }
  });

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead: any) => lead.id));
    }
  };

  const handleBulkAssign = () => {
    if (selectedLeads.length > 0 && selectedCounselor) {
      bulkAssignMutation.mutate({ leadIds: selectedLeads, counselorId: selectedCounselor });
    }
  };

  const handleViewLead = (leadId: number) => {
    navigate(`/lead/${leadId}`);
  };

  const getStageColor = (stage: string) => {
    const stageIndex = STAGES.indexOf(stage);
    if (stageIndex <= 1) return "bg-destructive/10 text-destructive";
    if (stageIndex <= 5) return "bg-warning/10 text-warning";
    if (stageIndex <= 10) return "bg-primary/10 text-primary";
    if (stageIndex <= 14) return "bg-purple-500/10 text-purple-700";
    return "bg-success/10 text-success";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Leads</h1>
            <p className="text-muted-foreground">Manage all student leads</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Multi-Stage Filter */}
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      {selectedStages.length === 0 
                        ? "All Stages" 
                        : selectedStages.length === 1 
                        ? selectedStages[0]
                        : `${selectedStages.length} stages selected`
                      }
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search stages..." className="h-9" />
                    <CommandEmpty>No stage found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => setSelectedStages([])}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={selectedStages.length === 0}
                            className="mr-2"
                          />
                          <span>All Stages</span>
                        </CommandItem>
                        {STAGES.map((stage) => (
                          <CommandItem
                            key={stage}
                            onSelect={() => {
                              setSelectedStages(prev => 
                                prev.includes(stage)
                                  ? prev.filter(s => s !== stage)
                                  : [...prev, stage]
                              );
                            }}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={selectedStages.includes(stage)}
                              className="mr-2"
                            />
                            <span>{stage}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
              <Button 
                onClick={() => setShowBulkAssign(true)}
                className="whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Selected ({selectedLeads.length})
              </Button>
            )}
          </div>

          {/* Additional Filters Row */}
          <div className="flex gap-4 items-center flex-wrap">
            {/* Country Filter */}
            <div className="flex-shrink-0 w-40">
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-countries">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Intake Filter */}
            <div className="flex-shrink-0 w-40">
              <Select value={intakeFilter} onValueChange={setIntakeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Intakes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-intakes">All Intakes</SelectItem>
                  {intakes.map((intake) => (
                    <SelectItem key={intake} value={intake}>
                      {intake}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Filter */}
            <div className="flex-shrink-0 w-40">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-sources">All Sources</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Counselor Filter */}
            <div className="flex-shrink-0 w-40">
              <Select value={counselorFilter} onValueChange={setCounselorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Counselors" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-counselors">All Counselors</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {counselors.map((counselor: any) => (
                      <SelectItem key={counselor.id} value={counselor.id}>
                        {counselor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(countryFilter || intakeFilter || sourceFilter || counselorFilter) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setCountryFilter("");
                  setIntakeFilter("");
                  setSourceFilter("");
                  setCounselorFilter("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredLeads.length} of {leads.length} leads
          {selectedStages.length > 0 && ` in ${selectedStages.length} stage${selectedStages.length > 1 ? 's' : ''}`}
        </div>

        {/* Bulk Assignment Card */}
        {showBulkAssign && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Bulk Assignment</CardTitle>
              <CardDescription>
                Assign {selectedLeads.length} selected leads to a counselor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select counselor..." />
                    </SelectTrigger>
                  <SelectContent>
                      {counselors.map((counselor: any) => (
                        <SelectItem key={counselor.id} value={counselor.id}>
                          {counselor.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleBulkAssign} 
                  disabled={!selectedCounselor || bulkAssignMutation.isPending}
                >
                  {bulkAssignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign Leads
                </Button>
                <Button variant="outline" onClick={() => setShowBulkAssign(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Counselor</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <div>Loading leads...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No leads found matching your filters
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => handleSelectLead(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email || "-"}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.country || "-"}</TableCell>
                      <TableCell>{lead.course || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStageColor(lead.current_stage)}>
                          {lead.current_stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.counselorName || "Unassigned"}</TableCell>
                      <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewLead(lead.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
