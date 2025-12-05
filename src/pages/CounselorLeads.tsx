import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Link } from "react-router-dom";
import { Search, Eye, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const COUNTRIES = [
  'USA', 'UK', 'Australia', 'Germany - Public', 'Ireland', 'Sweden', 'France', 
  'Italy', 'Canada', 'China', 'Japan', 'Singapore', 'Dubai', 'Yet to decide', 
  'Switzerland', 'Austria', 'Finland', 'Newzealand', 'Germany - Private', 'Netherlands'
];

const INTAKES = [
  'Spring 2025', 'Summer 2025', 'Fall 2025', 'Winter 2025',
  'Spring 2026', 'Summer 2026', 'Fall 2026', 'Winter 2026',
  'Spring 2027', 'Summer 2027', 'Fall 2027', 'Winter 2027',
  'Spring 2028', 'Summer 2028', 'Fall 2028', 'Winter 2028',
  'Spring 2029', 'Summer 2029', 'Fall 2029', 'Winter 2029',
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

export default function CounselorLeads() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [intakeFilter, setIntakeFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  // Fetch unique sources from leads
  const { data: sources = [] } = useQuery({
    queryKey: ["counselor-lead-sources", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("source")
        .eq("counselor_uuid", profile?.id)
        .not("source", "is", null);

      if (error) throw error;
      const uniqueSources = [...new Set(data?.map(d => d.source).filter(Boolean))];
      return uniqueSources as string[];
    },
    enabled: !!profile?.id,
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ["counselor-leads", profile?.id, debouncedSearch, stageFilter, countryFilter, intakeFilter, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .eq("counselor_uuid", profile?.id)
        .order("updated_at", { ascending: false });

      if (stageFilter && stageFilter !== "all-stages") {
        query = query.eq("current_stage", stageFilter);
      }

      if (countryFilter && countryFilter !== "all-countries") {
        query = query.eq("country", countryFilter);
      }

      if (intakeFilter && intakeFilter !== "all-intakes") {
        query = query.eq("intake", intakeFilter);
      }

      if (sourceFilter && sourceFilter !== "all-sources") {
        query = query.eq("source", sourceFilter);
      }

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const getStageColor = (stage: string) => {
    if (["Commission Received", "Tuition Fee Paid"].includes(stage)) return "bg-success";
    if (["Not Interested", "Irrelevant Lead"].includes(stage)) return "bg-destructive";
    if (["Yet to Assign", "Yet to Contact"].includes(stage)) return "bg-warning";
    return "bg-primary";
  };

  const hasActiveFilters = stageFilter || countryFilter || intakeFilter || sourceFilter;

  const clearFilters = () => {
    setStageFilter("");
    setCountryFilter("");
    setIntakeFilter("");
    setSourceFilter("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Leads</h1>
          <p className="text-muted-foreground">Manage your assigned leads</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              {/* Stage Filter */}
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-stages">All Stages</SelectItem>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Country Filter */}
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-countries">All Countries</SelectItem>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Intake Filter */}
              <Select value={intakeFilter} onValueChange={setIntakeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Intakes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-intakes">All Intakes</SelectItem>
                  {INTAKES.map((intake) => (
                    <SelectItem key={intake} value={intake}>
                      {intake.replace(' ', ' - ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Source Filter */}
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px]">
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

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {leads?.length || 0} Lead{leads?.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads?.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{lead.email || "-"}</div>
                          <div className="text-muted-foreground">{lead.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{lead.country || "-"}</div>
                          <div className="text-muted-foreground text-xs">{lead.course || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.intake ? lead.intake.replace(' ', ' - ') : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(lead.current_stage)}>
                          {lead.current_stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(lead.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/lead/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
