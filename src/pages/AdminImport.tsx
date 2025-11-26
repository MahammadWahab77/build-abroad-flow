import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
interface ParsedLead {
  uid?: string;
  leadCreatedDate?: string;
  studentName: string;
  intake?: string;
  country?: string;
  source?: string;
  mobileNumber?: string;
  currentStage: string;
  remarks?: string;
  counsellors?: string;
  passportStatus?: string;
  errors?: string[];
  warnings?: string[];
  duplicateGroup?: number;
  isDuplicate?: boolean;
}
const REQUIRED_HEADERS = ["UID", "Lead Created Date", "Student Name", "Intake", "Country", "Source", "MobileNumber", "Current Stage", "Remarks", "Counsellors", "Passport Status"];
const COUNTRY_MAP: Record<string, string> = {
  "united states": "US",
  "usa": "US",
  "united kingdom": "UK",
  "uk": "UK",
  "canada": "CA",
  "australia": "AU",
  "germany": "DE",
  "france": "FR",
  "spain": "ES",
  "italy": "IT",
  "netherlands": "NL",
  "ireland": "IE",
  "new zealand": "NZ",
  "singapore": "SG",
  "india": "IN"
};
export default function AdminImport() {
  const [leads, setLeads] = useState<ParsedLead[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [importComplete, setImportComplete] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [bypassValidation, setBypassValidation] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();

  // Special bypass configuration - no validation for this account
  const SPECIAL_BYPASS_EMAIL = "gundluru.mahammadwahab@nxtwave.co.in";

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentUserEmail(user.email);
      }
    };
    getCurrentUser();
  }, []);
  const normalizeCountry = (country: string): string => {
    if (!country) return "";
    const normalized = COUNTRY_MAP[country.toLowerCase()];
    return normalized || country;
  };
  const normalizeIntake = (intake: string): string => {
    if (!intake) return "";
    const yearMatch = intake.match(/20\d{2}/);
    const seasonMatch = intake.match(/(spring|summer|fall|winter)/i);
    if (yearMatch && seasonMatch) {
      const season = seasonMatch[0].charAt(0).toUpperCase() + seasonMatch[0].slice(1).toLowerCase();
      return `${yearMatch[0]}-${season}`;
    }
    return intake;
  };
  const normalizePhone = (phone: string): string => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };
  const detectDuplicates = (leads: ParsedLead[]): ParsedLead[] => {
    const phoneMap = new Map<string, ParsedLead[]>();
    leads.forEach(lead => {
      const phone = lead.mobileNumber;
      if (phone) {
        if (!phoneMap.has(phone)) {
          phoneMap.set(phone, []);
        }
        phoneMap.get(phone)!.push(lead);
      }
    });
    let duplicateGroupId = 1;
    phoneMap.forEach(group => {
      if (group.length > 1) {
        group.forEach((lead, index) => {
          lead.duplicateGroup = duplicateGroupId;
          lead.isDuplicate = true;
          if (!lead.warnings) lead.warnings = [];
          lead.warnings.push(`Duplicate phone number (${group.length} instances)`);
        });
        duplicateGroupId++;
      }
    });
    return leads;
  };
  const validateAndNormalizeLead = (row: any, rowIndex: number): ParsedLead => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!row["Student Name"]?.trim()) {
      errors.push("Student Name is required");
    }
    if (!row["Current Stage"]?.trim()) {
      errors.push("Current Stage is required");
    }

    // Normalize and validate date
    let leadCreatedDate = row["Lead Created Date"];
    if (!leadCreatedDate) {
      warnings.push("Lead Created Date is blank, using current date");
      leadCreatedDate = new Date().toISOString();
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(row["MobileNumber"]);
    if (normalizedPhone && normalizedPhone.length < 7) {
      errors.push("Mobile number must be at least 7 digits");
    }
    return {
      uid: row["UID"],
      leadCreatedDate,
      studentName: row["Student Name"]?.trim(),
      intake: normalizeIntake(row["Intake"]),
      country: normalizeCountry(row["Country"]),
      source: row["Source"],
      mobileNumber: normalizedPhone,
      currentStage: row["Current Stage"]?.trim() || "Yet to Assign",
      remarks: row["Remarks"],
      counsellors: row["Counsellors"],
      passportStatus: row["Passport Status"],
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setValidationError("");
    setImportComplete(false);
    
    // Check for special bypass account FIRST (before any validation)
    if (currentUserEmail === SPECIAL_BYPASS_EMAIL) {
      setBypassValidation(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          const totalLeads = results.data.length;
          // Skip all validation for special account
          const rawLeads = results.data.map((row: any) => ({
            uid: row["UID"],
            leadCreatedDate: row["Lead Created Date"] || new Date().toISOString(),
            studentName: row["Student Name"]?.trim() || "",
            intake: row["Intake"],
            country: row["Country"],
            source: row["Source"],
            mobileNumber: row["MobileNumber"],
            currentStage: row["Current Stage"]?.trim() || "Yet to Assign",
            remarks: row["Remarks"],
            counsellors: row["Counsellors"],
            passportStatus: row["Passport Status"]
          }));
          setLeads(rawLeads);
          toast({
            title: "Bypass Mode Activated",
            description: `Loaded ${totalLeads} leads without validation (Special Account)`,
            variant: "default"
          });
        }
      });
      return;
    }
    
    // Normal validation flow for other accounts
    setBypassValidation(false);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const totalLeads = results.data.length;

        // Normal validation flow
        const headers = results.meta.fields || [];
        const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
        const extraHeaders = headers.filter(h => !REQUIRED_HEADERS.includes(h));
        if (missingHeaders.length > 0 || extraHeaders.length > 0) {
          let errorMsg = "Header validation failed:\n";
          if (missingHeaders.length > 0) {
            errorMsg += `Missing: ${missingHeaders.join(", ")}\n`;
          }
          if (extraHeaders.length > 0) {
            errorMsg += `Extra: ${extraHeaders.join(", ")}`;
          }
          setValidationError(errorMsg);
          return;
        }

        // Validate and normalize data
        const validatedLeads = results.data.map((row: any, index: number) => validateAndNormalizeLead(row, index));

        // Detect duplicates
        const leadsWithDuplicates = detectDuplicates(validatedLeads);
        setLeads(leadsWithDuplicates);
        toast({
          title: "CSV Parsed Successfully",
          description: `Loaded ${leadsWithDuplicates.length} leads`
        });
      },
      error: error => {
        setValidationError(`Failed to parse CSV: ${error.message}`);
        toast({
          title: "Parse Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };
  const handleImport = async () => {
    if (leads.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first",
        variant: "destructive"
      });
      return;
    }
    
    setImporting(true);
    setImportProgress({ current: 0, total: leads.length });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Process in batches of 100 leads
      const BATCH_SIZE = 100;
      const totalBatches = Math.ceil(leads.length / BATCH_SIZE);
      let totalImported = 0;
      let allErrors: string[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, leads.length);
        const batch = leads.slice(start, end);

        setImportProgress({ current: end, total: leads.length });

        const response = await supabase.functions.invoke('import-leads', {
          body: {
            leads: batch,
            bypassValidation
          }
        });

        if (response.error) {
          throw response.error;
        }

        if (response.data) {
          totalImported += response.data.imported || 0;
          if (response.data.errors && response.data.errors.length > 0) {
            allErrors = [...allErrors, ...response.data.errors];
          }
        }

        // Small delay between batches to avoid rate limiting
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setImportResults({
        imported: totalImported,
        errors: allErrors,
        total: leads.length
      });
      setImportComplete(true);
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${totalImported} of ${leads.length} leads${allErrors.length > 0 ? ` (${allErrors.length} errors)` : ''}`
      });
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };
  const handleDownloadTemplate = () => {
    const csv = Papa.unparse([REQUIRED_HEADERS]);
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const stats = {
    total: leads.length,
    valid: leads.filter(l => !l.errors || l.errors.length === 0).length,
    errors: leads.filter(l => l.errors && l.errors.length > 0).length,
    warnings: leads.filter(l => l.warnings && l.warnings.length > 0).length,
    duplicates: leads.filter(l => l.isDuplicate).length,
    duplicateGroups: new Set(leads.filter(l => l.duplicateGroup).map(l => l.duplicateGroup)).size
  };
  const LeadRow = ({
    lead
  }: {
    lead: ParsedLead;
  }) => {
    const hasErrors = lead.errors && lead.errors.length > 0;
    const hasWarnings = lead.warnings && lead.warnings.length > 0;
    const isDuplicate = lead.isDuplicate;
    return <div className="px-4 py-3 border-b hover:bg-muted/50">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{lead.studentName || "(No name)"}</span>
              {hasErrors && <Badge variant="destructive">Error</Badge>}
              {hasWarnings && <Badge variant="secondary">Warning</Badge>}
              {isDuplicate && <Badge variant="outline">Duplicate</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              {lead.mobileNumber} • {lead.country} • {lead.currentStage}
            </div>
            {hasErrors && <div className="text-sm text-destructive mt-1">
                {lead.errors?.join(", ")}
              </div>}
            {hasWarnings && <div className="text-sm text-yellow-600 mt-1">
                {lead.warnings?.join(", ")}
              </div>}
            {lead.remarks && <div className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Remarks:</span> {lead.remarks}
              </div>}
          </div>
        </div>
      </div>;
  };
  return <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Leads</h1>
          <p className="text-muted-foreground">Bulk import leads from CSV files</p>
        </div>

        {!importComplete && <>
            {/* Import Options */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <FileUp className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Standard Import</CardTitle>
                  <CardDescription>Upload CSV file with lead data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
                    Upload CSV
                  </Button>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Download className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Download Template</CardTitle>
                  <CardDescription>Get the CSV template file</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary" onClick={handleDownloadTemplate}>
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Upload className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Import Status</CardTitle>
                  <CardDescription>
                    {fileName || "No file selected"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleImport} disabled={leads.length === 0 || importing || (!bypassValidation && stats.errors > 0)}>
                    {importing ? `Importing... (${importProgress.current}/${importProgress.total})` : bypassValidation ? "Import All (No Validation)" : "Import Leads"}
                  </Button>
                  {importing && importProgress.total > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground text-center mb-1">
                        {Math.round((importProgress.current / importProgress.total) * 100)}% complete
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Validation Error */}
            {validationError && <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">
                  {validationError}
                </AlertDescription>
              </Alert>}

            {/* Validation Summary */}
            {leads.length > 0 && !validationError && <Card>
                <CardHeader>
                  <CardTitle>Validation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <div className="text-sm text-muted-foreground">Total Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
                      <div className="text-sm text-muted-foreground">Valid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
                      <div className="text-sm text-muted-foreground">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.duplicates} / {stats.duplicateGroups}
                      </div>
                      <div className="text-sm text-muted-foreground">Duplicates / Groups</div>
                    </div>
                  </div>
                </CardContent>
              </Card>}

            {/* Data Preview */}
            {leads.length > 0 && !validationError && <Card>
                <CardHeader>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>
                    Showing {leads.length} leads. Review before importing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] border rounded-lg">
                    {leads.map((lead, index) => <LeadRow key={index} lead={lead} />)}
                  </ScrollArea>
                </CardContent>
              </Card>}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Import Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Required Fields:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Student Name (required)</li>
                    <li>Current Stage (required)</li>
                    <li>MobileNumber (minimum 10 digits)</li>
                  </ul>
                  <p className="mt-4"><strong>Optional Fields:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>UID, Email, Country, Course, Intake, Source</li>
                    <li>Passport Status, Counsellors, Remarks</li>
                  </ul>
                  <Separator className="my-4" />
                  <p><strong>Smart Assignment:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    
                    <li>Otherwise, assigns to default counselor (Angu Priya)</li>
                    <li>Manager automatically assigned to all leads</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>}

        {/* Import Results */}
        {importComplete && importResults && <Card>
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Import Complete</CardTitle>
              <CardDescription>
                Successfully imported {importResults.imported} out of {stats.total} leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {importResults.errors && importResults.errors.length > 0 && <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      {importResults.errors.length} errors occurred:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {importResults.errors.slice(0, 10).map((error: string, i: number) => <li key={i}>{error}</li>)}
                      {importResults.errors.length > 10 && <li>... and {importResults.errors.length - 10} more errors</li>}
                    </ul>
                  </AlertDescription>
                </Alert>}
              <Button onClick={() => window.location.reload()}>
                Import More Leads
              </Button>
            </CardContent>
          </Card>}
      </div>
    </Layout>;
}