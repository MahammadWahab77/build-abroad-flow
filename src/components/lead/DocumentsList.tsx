import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Link as LinkIcon } from 'lucide-react';
import type { DocumentData } from '@/types/lead';

interface DocumentsListProps {
  leadId: string;
}

const DOCUMENT_TYPES = [
  'Passport',
  'Academic Transcripts',
  'English Test Score',
  'CV/Resume',
  'SOP',
  'LOR',
  'Financial Documents',
  'Other'
];

export const DocumentsList: React.FC<DocumentsListProps> = ({ leadId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    documentType: '',
    documentUrl: '',
    remarks: ''
  });

  const leadIdNum = Number(leadId);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', leadIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('lead_id', leadIdNum)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Map database fields to DocumentData type
      return (data || []).map(doc => ({
        id: doc.id,
        leadId: doc.lead_id,
        documentType: doc.document_type,
        documentUrl: doc.document_url || '',
        remarks: doc.remarks,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      })) as DocumentData[];
    },
    enabled: Number.isFinite(leadIdNum)
  });

  // Add document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (newDoc: Partial<DocumentData>) => {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          lead_id: leadIdNum,
          document_type: newDoc.documentType || '',
          document_url: newDoc.documentUrl || '',
          remarks: newDoc.remarks || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', leadIdNum] });
      toast({
        title: 'Success',
        description: 'Document added successfully'
      });
      setIsDialogOpen(false);
      setFormData({ documentType: '', documentUrl: '', remarks: '' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add document',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.documentType || !formData.documentUrl) {
      toast({
        title: 'Validation Error',
        description: 'Document type and URL are required',
        variant: 'destructive'
      });
      return;
    }

    addDocumentMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Documents</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Document Type</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, documentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Document URL</Label>
                <Input
                  placeholder="https://..."
                  value={formData.documentUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, documentUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Remarks (Optional)</Label>
                <Textarea
                  placeholder="Add any notes..."
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Add Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No documents uploaded yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{doc.documentType}</p>
                    {doc.remarks && (
                      <p className="text-sm text-muted-foreground">{doc.remarks}</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
