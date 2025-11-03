import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, Globe, BookOpen, Calendar, FileCheck } from 'lucide-react';
import type { LeadData } from '@/types/lead';
import { DocumentsList } from './DocumentsList';

interface LeadDataCardProps {
  lead: LeadData;
}

export const LeadDataCard: React.FC<LeadDataCardProps> = ({ lead }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [docsSubmitted, setDocsSubmitted] = useState(lead.passportStatus === 'Submitted');

  const updateDocsMutation = useMutation({
    mutationFn: async (submitted: boolean) => {
      const { error } = await supabase
        .from('leads')
        .update({ passport_status: submitted ? 'Submitted' : 'Pending' })
        .eq('id', lead.id);

      if (error) throw error;
    },
    onSuccess: (_, submitted) => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      toast({
        title: 'Success',
        description: `Documents marked as ${submitted ? 'submitted' : 'not submitted'}`
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update document status',
        variant: 'destructive'
      });
    }
  });

  const handleDocsToggle = (checked: boolean) => {
    setDocsSubmitted(checked);
    updateDocsMutation.mutate(checked);
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Lead Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <InfoRow icon={User} label="Name" value={lead.name} />
          <InfoRow icon={Mail} label="Email" value={lead.email} />
          <InfoRow icon={Phone} label="Phone" value={lead.phone} />
          <InfoRow icon={Globe} label="Country" value={lead.country} />
          <InfoRow icon={BookOpen} label="Course" value={lead.course} />
          <InfoRow icon={Calendar} label="Intake" value={lead.intake} />
          <InfoRow icon={User} label="Counselor" value={lead.counselorName} />

          <div className="pt-4 border-t border-border mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="docs-submitted" className="text-sm font-medium text-foreground cursor-pointer">
                  Documents Submitted
                </Label>
              </div>
              <Switch
                id="docs-submitted"
                checked={docsSubmitted}
                onCheckedChange={handleDocsToggle}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentsList leadId={String(lead.id)} />
        </CardContent>
      </Card>
    </div>
  );
};
