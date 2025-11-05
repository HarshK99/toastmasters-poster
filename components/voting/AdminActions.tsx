import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";

interface AdminActionsProps {
  onViewResults: () => void;
  onEditSession: () => void;
  onBackToAdmin: () => void;
  onClearSession: () => void;
}

const AdminActions: React.FC<AdminActionsProps> = ({
  onViewResults,
  onEditSession,
  onBackToAdmin,
  onClearSession,
}) => {
  return (
    <Card className = "bg-yellow-50">
      <h3 className="text-xl font-semibold mb-4">🔧 Admin Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          onClick={onViewResults}
          className="flex-1"
          size="lg"
        >
          📊 View Live Results
        </Button>
        
        <Button
          onClick={onEditSession}
          variant="secondary"
          className="flex-1"
          size="lg"
        >
          ✏️ Edit Session
        </Button>
        
        <Button
          onClick={onBackToAdmin}
          variant="ghost"
          className="flex-1"
          size="lg"
        >
          ➕ New Session
        </Button>
      </div>
      
      <div className="mt-4">
        <Button
          onClick={onClearSession}
          variant="danger"
          className="w-full"
          size="sm"
        >
          🗑️ End Voting Session
        </Button>
      </div>
      
     
    </Card>
  );
};

export default AdminActions;