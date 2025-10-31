import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
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
import { Link } from "react-router-dom";
import { Search, Filter, Eye } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads", search, selectedStage],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select(`
          *,
          users!leads_counselor_id_users_id_fk(name)
        `)
        .order("updated_at", { ascending: false });

      if (selectedStage) {
        query = query.eq("current_stage", selectedStage);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getStageColor = (stage: string) => {
    if (["Commission Received", "Tuition Fee Paid"].includes(stage)) return "bg-success";
    if (["Not Interested", "Irrelevant Lead"].includes(stage)) return "bg-destructive";
    if (["Yet to Assign", "Yet to Contact"].includes(stage)) return "bg-warning";
    return "bg-primary";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Leads</h1>
            <p className="text-muted-foreground">Manage all student leads</p>
          </div>
          <Button>Import Leads</Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-64">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedStage || ""}
                  onChange={(e) => setSelectedStage(e.target.value || null)}
                >
                  <option value="">All Stages</option>
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
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
                    <TableHead>Country/Course</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Counselor</TableHead>
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
                          <div>{lead.country || "-"}</div>
                          <div className="text-muted-foreground">{lead.course || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(lead.current_stage)}>
                          {lead.current_stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.users?.name || "Unassigned"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(lead.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/lead/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
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
