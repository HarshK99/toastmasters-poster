import React from "react";
import Card from "@/components/ui/Card";
import { VoteResults } from "@/types/voting";

interface ResultsSummaryProps {
  results: VoteResults[];
  revealedCount: number;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ results, revealedCount }) => {
  if (revealedCount === 0) return null;

  const totalVotes = results.reduce((sum, r) => sum + r.totalVotes, 0);

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Meeting Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {results.length}
          </div>
          <div className="text-sm text-gray-600">Total Categories</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {totalVotes}
          </div>
          <div className="text-sm text-gray-600">Total Votes Cast</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {revealedCount}
          </div>
          <div className="text-sm text-gray-600">Results Revealed</div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsSummary;