import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Table } from "lucide-react";

export default function AdminImport() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Leads</h1>
          <p className="text-muted-foreground">Bulk import leads from CSV files</p>
        </div>

        {/* Import Options */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <FileUp className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Standard Import</CardTitle>
              <CardDescription>Upload CSV file with lead data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Upload CSV</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Table className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Bulk Import</CardTitle>
              <CardDescription>Paste large datasets directly</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Start Bulk Import</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Download Template</CardTitle>
              <CardDescription>Get the CSV template file</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">Download</Button>
            </CardContent>
          </Card>
        </div>

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
                <li>Phone (required)</li>
                <li>Current Stage (required)</li>
              </ul>
              <p className="mt-4"><strong>Optional Fields:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Email, Country, Course, Intake, Source</li>
                <li>Passport Status, Previous Consultancy</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for upload area */}
        <Card>
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Drag and drop your CSV file here</h3>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button>Select File</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
