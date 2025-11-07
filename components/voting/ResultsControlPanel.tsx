import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import { Meeting } from "@/types/voting";

interface ResultsControlPanelProps {
  meeting: Meeting;
  onResetReveal: () => void;
  onRevealAll: () => void;
  onCopyResults: () => void;
}

const ResultsControlPanel: React.FC<ResultsControlPanelProps> = ({
  meeting,
  onResetReveal,
  onRevealAll,
  onCopyResults,
}) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{meeting.name}</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Meeting Date: {formatDate(meeting.date)}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={onResetReveal} variant="secondary" size="sm" className="w-full sm:w-auto">
            Reset Reveals
          </Button>
          
          <Button onClick={onRevealAll} variant="ghost" size="sm" className="w-full sm:w-auto">
            Reveal All
          </Button>
          
          <Button onClick={onCopyResults} variant="secondary" size="sm" className="w-full sm:w-auto">
            📋 Copy Results
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResultsControlPanel;