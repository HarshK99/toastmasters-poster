import React from "react";
import Card from "@/components/ui/Card";
import { VoteResults } from "@/types/voting";

interface ResultsSummaryProps {
  results: VoteResults[];
  revealedCount: number;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ results, revealedCount }) => {

  const totalVotes = results.reduce((sum, r) => sum + r.totalVotes, 0);
  // If API provides voter lists per role, count unique voters across roles
  const hasVoterLists = results.some(r => r.voters && Array.isArray(r.voters));
  const uniqueVoterCount = hasVoterLists
    ? (() => {
        const set = new Set<string>();
        results.forEach(r => {
          const voters = r.voters;
          if (Array.isArray(voters)) {
            voters.forEach((v) => {
              if (!v) return;
              if (typeof v === 'string') set.add(v);
              else if ('email' in v && v.email) set.add(String(v.email));
              else if ('name' in v && v.name) set.add(String(v.name));
            });
          }
        });
        return set.size;
      })()
    : totalVotes;

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
            {uniqueVoterCount}
          </div>
          <div className="text-sm text-gray-600">Total Voters</div>
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