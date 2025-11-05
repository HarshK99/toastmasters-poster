import React from "react";
import Card from "@/components/ui/Card";
import { Meeting } from "@/types/voting";

interface SuccessMessageProps {
  meeting: Meeting;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ meeting }) => {
  return (
    <Card>
      <div className="text-center py-4">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-bold text-green-600 mb-1">
          Voting Session Created Successfully!
        </h2>
       
      </div>
    </Card>
  );
};

export default SuccessMessage;