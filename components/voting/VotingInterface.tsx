import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import { Meeting, Vote, Nominee } from "@/types/voting";

interface VotingInterfaceProps {
  meeting: Meeting;
  onVoteSubmitted: (votes: Omit<Vote, "id" | "timestamp">[]) => void;
  userId: string;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  meeting,
  onVoteSubmitted,
  userId,
}) => {
  const [selectedVotes, setSelectedVotes] = useState<Record<string, Nominee>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVoteSelection = (roleId: string, nominee: Nominee) => {
    setSelectedVotes(prev => ({
      ...prev,
      [roleId]: nominee
    }));
  };

  const submitVotes = async () => {
    if (Object.keys(selectedVotes).length === 0) return;
    
    setIsSubmitting(true);
    
    const votes: Omit<Vote, "id" | "timestamp">[] = Object.entries(selectedVotes).map(([roleId, nominee]) => ({
      meetingId: meeting.id,
      roleId,
      nominee,
      voterId: userId
    }));

    try {
      await onVoteSubmitted(votes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVoteComplete = meeting.roles.every(role => selectedVotes[role.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{meeting.name}</h2>
          <p className="text-gray-600">Cast your votes for the following categories</p>
          <p className="text-sm text-gray-500 mt-1">
            Meeting Date: {new Date(meeting.date).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-800 text-sm">
              Your votes are anonymous. You can only vote once per meeting.
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {meeting.roles.map((role, roleIndex) => (
          <Card key={role.id}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {role.name}
              {selectedVotes[role.id] && (
                <span className="ml-2 text-sm text-green-600">✓ Voted</span>
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {role.nominees.map((nominee, nomineeIndex) => (
                <button
                  key={`${nominee.name}-${nominee.prefix}-${nomineeIndex}`}
                  onClick={() => handleVoteSelection(role.id, nominee)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedVotes[role.id]?.name === nominee.name && selectedVotes[role.id]?.prefix === nominee.prefix
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedVotes[role.id]?.name === nominee.name && selectedVotes[role.id]?.prefix === nominee.prefix
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}>
                      {selectedVotes[role.id]?.name === nominee.name && selectedVotes[role.id]?.prefix === nominee.prefix && (
                        <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{nominee.prefix} {nominee.name}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Votes cast: {Object.keys(selectedVotes).length} of {meeting.roles.length}
            </p>
            {!isVoteComplete && (
              <p className="text-xs text-orange-600 mt-1">
                Please vote in all categories before submitting
              </p>
            )}
          </div>
          
          <Button
            onClick={submitVotes}
            disabled={!isVoteComplete || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? "Submitting..." : "Submit Votes"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VotingInterface;