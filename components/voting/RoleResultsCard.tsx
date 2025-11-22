import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import WinnerAnnouncement from "./WinnerAnnouncement";
import VoteResultItem from "./VoteResultItem";
import { VoteResults } from "@/types/voting";

interface Winner {
  nominee: {
    name: string;
    prefix: string;
    suffix?: string;
  };
  votes: number;
  percentage?: number;
}

interface RoleResultsCardProps {
  roleResult: VoteResults;
  isRevealed: boolean;
  winners: Winner[];
  onRevealRole: (roleId: string) => void;
}

const RoleResultsCard: React.FC<RoleResultsCardProps> = ({
  roleResult,
  isRevealed,
  winners,
  onRevealRole,
}) => {
  const HiddenResults = () => (
    <div 
      className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => onRevealRole(roleResult.roleId)}
    >
      <div className="text-center text-gray-500 dark:text-gray-300">
        <div className="text-4xl mb-2">🎭</div>
        <p>Results Hidden</p>
        <p className="text-xs">Click here or &ldquo;Reveal Winner&rdquo; to show</p>
      </div>
    </div>
  );

  const DetailedResults = () => {
    if (!roleResult.results || roleResult.results.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-300 py-4">
          No detailed results available
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {roleResult.results
          .sort((a, b) => b.votes - a.votes)
          .map((result, index) => {
            const isWinner = winners.some(w => 
              w.nominee.name === result.nominee.name && 
              w.nominee.prefix === result.nominee.prefix &&
              (w.nominee.suffix || '') === (result.nominee.suffix || '')
            );
            
            return (
              <VoteResultItem
                key={`${result.nominee.name}-${result.nominee.prefix}-${result.nominee.suffix || ''}`}
                result={result}
                position={index + 1}
                isWinner={isWinner}
              />
            );
          })}
      </div>
    );
  };

  return (
    <Card className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {roleResult.roleName}
        </h3>
        
        {!isRevealed && (
          <Button
            onClick={() => onRevealRole(roleResult.roleId)}
            size="sm"
            className="animate-pulse"
          >
            Reveal Winner
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isRevealed ? (
          <>
            <WinnerAnnouncement winners={winners} />
            <DetailedResults />
            <div className="pt-2 border-t text-sm text-gray-700 text-center">
              Total Votes: {roleResult.totalVotes}
            </div>
          </>
        ) : (
          <HiddenResults />
        )}
      </div>
    </Card>
  );
};

export default RoleResultsCard;