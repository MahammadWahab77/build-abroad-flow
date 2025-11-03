import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { calculateStageProgress, getStageIndex, PIPELINE_STAGES } from '@/lib/business-logic';

interface StageProgressProps {
  currentStage: string;
}

export const StageProgress: React.FC<StageProgressProps> = ({ currentStage }) => {
  const progress = calculateStageProgress(currentStage);
  const stageIndex = getStageIndex(currentStage);
  const totalStages = PIPELINE_STAGES.length;
  
  const getProgressColor = () => {
    if (progress >= 75) return 'bg-success';
    if (progress >= 50) return 'bg-primary';
    if (progress >= 25) return 'bg-accent';
    return 'bg-muted-foreground';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">
              Stage {stageIndex + 1}/{totalStages} - {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
