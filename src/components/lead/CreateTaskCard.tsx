import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ClipboardList } from 'lucide-react';

interface CreateTaskCardProps {
  onCreateTask: () => void;
}

export const CreateTaskCard: React.FC<CreateTaskCardProps> = ({ onCreateTask }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <ClipboardList className="mr-2 h-5 w-5" />
          Create Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreateTask} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </CardContent>
    </Card>
  );
};
