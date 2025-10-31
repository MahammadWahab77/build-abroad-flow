import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-5xl font-bold">Build Abroad CRM</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Comprehensive lead management system for educational counseling
        </p>
        <Link to="/auth">
          <Button size="lg" className="mt-4">
            Sign In to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
