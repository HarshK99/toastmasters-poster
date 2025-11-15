import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import Loading from '@/components/ui/Loading'
import { Meeting } from "@/types/voting";

interface ResultsViewerProps {
  meeting: Meeting;
  onBack: () => void;
}

interface VoteResult {
  roleId: string;
  roleName: string;
  totalVotes: number;
  results: { nominee: string; count: number }[];
  voters: { name: string; email: string }[];
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ meeting, onBack }) => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/votes/results?slug=${meeting.slug}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [meeting.slug]);

  if (isLoading) {
    return <Loading message="Loading results..." variant="card" />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          ← Back to Sessions
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">{meeting.name}</h2>
        <p className="text-gray-600">{meeting.clubName} • {new Date(meeting.date).toLocaleDateString()}</p>
      </div>

      {results.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">No votes have been cast yet for this session.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <Card key={result.roleId}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{result.roleName}</h3>
              
              {result.results.length === 0 ? (
                <p className="text-gray-600">No votes cast for this role</p>
              ) : (
                <div className="space-y-3">
                  {result.results.map((nominee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{nominee.nominee}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{nominee.count} vote(s)</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(nominee.count / result.totalVotes) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Total votes: {result.totalVotes} • Voters: {result.voters.length}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsViewer;