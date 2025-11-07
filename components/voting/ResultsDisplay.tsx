import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import ResultsControlPanel from "./ResultsControlPanel";
import RoleResultsCard from "./RoleResultsCard";
import ResultsSummary from "./ResultsSummary";
import { VoteResults, Meeting } from "@/types/voting";

interface ResultsDisplayProps {
  meeting: Meeting;
  results: VoteResults[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  meeting,
  results,
}) => {
  const [revealedRoles, setRevealedRoles] = useState<Set<string>>(new Set());

  const revealRole = (roleId: string) => {
    setRevealedRoles(prev => new Set([...prev, roleId]));
  };

  const revealAll = () => {
    const allRoleIds = results.map(r => r.roleId);
    setRevealedRoles(new Set(allRoleIds));
  };

  const resetReveal = () => {
    setRevealedRoles(new Set());
  };

  const getWinners = (roleResults: VoteResults) => {
    if (!roleResults.results || roleResults.results.length === 0) {
      return [];
    }
    
    const maxVotes = Math.max(...roleResults.results.map(r => r.votes));
    return roleResults.results.filter(r => r.votes === maxVotes);
  };

  const copyResults = () => {
    const date = new Date(meeting.date).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    let resultText = `Congratulations to the winners of the meeting on ${date}\n\n`;
    
    results.forEach(roleResult => {
      const winners = getWinners(roleResult);
      if (winners.length > 0) {
        const winnerNames = winners.map(w => `${w.nominee.prefix} ${w.nominee.name}`).join(', ');
        resultText += `${roleResult.roleName}: ${winnerNames}\n`;
      }
    });
    
    navigator.clipboard.writeText(resultText).then(() => {
      alert('Results copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy results to clipboard');
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageTitle title="Results" />
      
      <ResultsControlPanel
        meeting={meeting}
        onResetReveal={resetReveal}
        onRevealAll={revealAll}
        onCopyResults={copyResults}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((roleResult) => {
          const isRevealed = revealedRoles.has(roleResult.roleId);
          const winners = getWinners(roleResult);
          
          return (
            <RoleResultsCard
              key={roleResult.roleId}
              roleResult={roleResult}
              isRevealed={isRevealed}
              winners={winners}
              onRevealRole={revealRole}
            />
          );
        })}
      </div>

      <ResultsSummary 
        results={results} 
        revealedCount={revealedRoles.size} 
      />
    </div>
  );
};

export default ResultsDisplay;