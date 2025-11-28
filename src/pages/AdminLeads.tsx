import { useState, useEffect, useMemo } from "react";
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

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
  const [uidSearch, setUidSearch] = useState("");

  // Debounce search inputs for server-side search (300ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedUidSearch = useDebounce(uidSearch, 300);

  // Fetch leads with server-side filtering
  const { data: leadsData = { leads: [], totalCount: 0 }, isLoading: leadsLoading, isFetching } = useQuery({
    queryKey: [
      "admin-leads", 
      debouncedSearchTerm, 
      debouncedUidSearch, 
      selectedStages, 
      countryFilter, 
      intakeFilter, 
      sourceFilter, 
      counselorFilter
    ],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select(`
          *,
          profiles:counselor_uuid(name)
        `, { count: 'exact' });

      // Server-side search across name, email, phone
      if (debouncedSearchTerm) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`);
      }

      // Server-side UID search
      if (debouncedUidSearch) {
        query = query.ilike('uid', `%${debouncedUidSearch}%`);
      }

      // Server-side stage filter
      if (selectedStages.length > 0) {
        query = query.in('current_stage', selectedStages);
      }

      // Server-side country filter
      if (countryFilter && countryFilter !== "all-countries") {
        query = query.eq('country', countryFilter);
      }

      // Server-side intake filter
      if (intakeFilter && intakeFilter !== "all-intakes") {
        query = query.eq('intake', intakeFilter);
      }

      // Server-side source filter
      if (sourceFilter && sourceFilter !== "all-sources") {
        query = query.eq('source', sourceFilter);
      }

      // Server-side counselor filter
      if (counselorFilter && counselorFilter !== "all-counselors") {
        if (counselorFilter === "unassigned") {
          query = query.is('counselor_uuid', null);
        } else {
          query = query.eq('counselor_uuid', counselorFilter);
        }
      }

      const { data, error, count } = await query
        .order("updated_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      
      const mappedLeads = (data || []).map((lead: any) => ({
        ...lead,
        counselorName: lead.profiles?.name || null
      }));

      return { leads: mappedLeads, totalCount: count || 0 };
    },
  });

  const leads = leadsData.leads;
  const totalCount = leadsData.totalCount;

  // Fetch counselors
  const { data: counselors = [] } = useQuery({
    queryKey: ["counselors"],
    queryFn: async () => {
      const { data: roleRows, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'counselor');
      if (rolesError) throw rolesError;

      const ids = (roleRows || []).map((r: any) => r.user_id);
      if (ids.length === 0) return [] as any[];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids)
        .eq('is_active', true);

      if (profilesError) throw profilesError;
      return profiles || [];
    },
  });

  // Fetch filter options separately (all unique values from database)
  const { data: filterOptions = { countries: [], intakes: [], sources: [] } } = useQuery({
    queryKey: ["lead-filter-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("country, intake, source");
      
      if (error) throw error;
      
      const countries = Array.from(new Set((data || []).map((l: any) => l.country).filter(Boolean))) as string[];
      const intakes = Array.from(new Set((data || []).map((l: any) => l.intake).filter(Boolean))) as string[];
      const sources = Array.from(new Set((data || []).map((l: any) => l.source).filter(Boolean))) as string[];
      
      return { countries, intakes, sources };
    },
  });

  const { countries, intakes, sources } = filterOptions;

  // No client-side filtering needed - all filtering is server-side
  const filteredLeads = leads;

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
        <div>
          <h1 className="text-3xl font-bold">All Leads</h1>
          <p className="text-muted-foreground">Manage all student leads</p>
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
                placeholder="Search all leads (name, email, phone)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {isFetching && searchTerm && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* UID Search */}
            <div className="flex-1 relative">
              <Input
                placeholder="Search by External UID..."
                value={uidSearch}
                onChange={(e) => setUidSearch(e.target.value)}
              />
              {isFetching && uidSearch && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
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
            {(countryFilter || intakeFilter || sourceFilter || counselorFilter || uidSearch) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setCountryFilter("");
                  setIntakeFilter("");
                  setSourceFilter("");
                  setCounselorFilter("");
                  setUidSearch("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
          Showing {filteredLeads.length} of {totalCount.toLocaleString()} total leads
          {selectedStages.length > 0 && ` in ${selectedStages.length} stage${selectedStages.length > 1 ? 's' : ''}`}
          {(debouncedSearchTerm || debouncedUidSearch) && " (searching all records)"}
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
                  <TableHead>External UID</TableHead>
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
                    <TableCell colSpan={11} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <div>Loading leads...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
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
                      <TableCell className="text-xs text-muted-foreground">{lead.uid || "-"}</TableCell>
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
