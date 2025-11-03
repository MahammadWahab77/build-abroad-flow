import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import type { LeadData } from '@/types/lead';

interface LeadHeaderProps {
  lead: LeadData;
}

export const LeadHeader: React.FC<LeadHeaderProps> = ({ lead }) => {
  const navigate = useNavigate();
  
  const getStageColor = (stage: string) => {
    if (stage.includes('Commission') || stage.includes('Tuition')) return 'bg-success text-success-foreground';
    if (stage.includes('Visa') || stage.includes('Offer')) return 'bg-primary text-primary-foreground';
    if (stage.includes('Application') || stage.includes('Shortlisted')) return 'bg-accent text-accent-foreground';
    if (stage.includes('Not Interested') || stage.includes('Irrelevant')) return 'bg-destructive text-destructive-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{lead.email}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{lead.phone}</span>
          </div>
        </div>
      </div>
      <Badge className={getStageColor(lead.currentStage)}>
        {lead.currentStage}
      </Badge>
    </div>
  );
};
