import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import { VoteResults, Meeting } from "@/types/voting";

interface ResultsDisplayProps {
  meeting: Meeting;
  results: VoteResults[];
  onClose: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  meeting,
  results,
  onClose,
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
    const date = new Date(meeting.date).toLocaleDateString();
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
      {/* Control Panel */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{meeting.name} - Results</h2>
            <p className="text-sm sm:text-base text-gray-600">Meeting Date: {new Date(meeting.date).toLocaleDateString()}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={resetReveal} variant="secondary" size="sm" className="w-full sm:w-auto">
              Reset Reveals
            </Button>
            
            <Button onClick={revealAll} variant="ghost" size="sm" className="w-full sm:w-auto">
              Reveal All
            </Button>
            
            <Button onClick={copyResults} variant="secondary" size="sm" className="w-full sm:w-auto">
              📋 Copy Results
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((roleResult) => {
          const isRevealed = revealedRoles.has(roleResult.roleId);
          const winners = getWinners(roleResult);
          
          return (
            <Card key={roleResult.roleId} className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {roleResult.roleName}
                </h3>
                
                {!isRevealed && (
                  <Button
                    onClick={() => revealRole(roleResult.roleId)}
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
                    {/* Winner Announcement */}
                    {winners.length > 0 ? (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <div className="text-2xl mr-3">🏆</div>
                          <div className="flex-1">
                            <div className="text-lg text-yellow-800 mb-2">
                              {winners.length === 1 ? 'Winner:' : `Winners:`}
                            </div>
                            {winners.map((winner, index) => (
                              <div key={`${winner.nominee.name}-${winner.nominee.prefix}`} className="mb-1 last:mb-0">
                                <div className="font-semibold text-yellow-800">
                                  {winner.nominee.prefix} {winner.nominee.name}
                                </div>
                                <div className="text-sm text-yellow-700">
                                  {winner.votes} votes ({(winner.percentage || 0).toFixed(1)}%)
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                        <div className="text-center text-gray-600">
                          No votes recorded for this role
                        </div>
                      </div>
                    )}

                    {/* Detailed Results */}
                    {roleResult.results && roleResult.results.length > 0 ? (
                      <div className="space-y-2">
                        {roleResult.results
                          .sort((a, b) => b.votes - a.votes)
                          .map((result, index) => {
                            const isWinner = winners.some(w => w.nominee.name === result.nominee.name && w.nominee.prefix === result.nominee.prefix);
                            
                            return (
                              <div
                                key={`${result.nominee.name}-${result.nominee.prefix}`}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  isWinner 
                                    ? "bg-yellow-100 border border-yellow-300" 
                                    : "bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                                    isWinner 
                                      ? "bg-yellow-500 text-white" 
                                      : "bg-gray-300 text-gray-700"
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <span className="font-medium">{result.nominee.prefix} {result.nominee.name}</span>
                                </div>
                                
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                    <div
                                      className={`h-2 rounded-full ${
                                        isWinner ? "bg-yellow-500" : "bg-blue-500"
                                      }`}
                                      style={{ width: `${result.percentage || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium w-12 text-right">
                                    {result.votes}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No detailed results available
                      </div>
                    )}

                    <div className="pt-2 border-t text-sm text-gray-600 text-center">
                      Total Votes: {roleResult.totalVotes}
                    </div>
                  </>
                ) : (
                  <div 
                    className="h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => revealRole(roleResult.roleId)}
                  >
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🎭</div>
                      <p>Results Hidden</p>
                      <p className="text-xs">Click here or &ldquo;Reveal Winner&rdquo; to show</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      {revealedRoles.size > 0 && (
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
                {results.reduce((sum, r) => sum + r.totalVotes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Votes Cast</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {revealedRoles.size}
              </div>
              <div className="text-sm text-gray-600">Results Revealed</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultsDisplay;