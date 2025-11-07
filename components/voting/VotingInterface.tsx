import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import { Meeting, Nominee } from "@/types/voting";

interface VotingInterfaceProps {
  meeting: Meeting;
  onVoteSubmitted: () => Promise<void>;
  userId: string;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  meeting,
  onVoteSubmitted,
  userId,
}) => {
  const [selectedVotes, setSelectedVotes] = useState<Record<string, Nominee>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingVotes, setExistingVotes] = useState<Record<string, Nominee>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing votes in localStorage when component loads
  useEffect(() => {
    const checkExistingVotes = () => {
      try {
        const cacheKey = `votes_${meeting.slug}_${userId}`;
        const cachedVotes = localStorage.getItem(cacheKey);
        
        if (cachedVotes) {
          const votedRoles = JSON.parse(cachedVotes);
          setExistingVotes(votedRoles);
          
          // If user has voted for all roles, show success screen
          if (Object.keys(votedRoles).length === meeting.roles.length) {
            setSelectedVotes(votedRoles);
            setIsSubmitted(true);
          }
        }
      } catch (error) {
        console.error('Error checking cached votes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingVotes();
  }, [meeting.slug, userId, meeting.roles.length]);

  const handleVoteSelection = (roleId: string, nominee: Nominee) => {
    setSelectedVotes(prev => ({
      ...prev,
      [roleId]: nominee
    }));
  };

  const submitVotes = async () => {
    if (Object.keys(selectedVotes).length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Filter out votes for roles already voted on (local cache check)
      const newVotes = Object.entries(selectedVotes)
        .filter(([roleId]) => !existingVotes[roleId])
        .map(([roleId, nominee]) => ({
          roleId,
          nominee
        }));

      if (newVotes.length === 0) {
        // All votes already submitted
        setIsSubmitted(true);
        return;
      }

      // Submit all votes in a single API call
      const response = await fetch('/api/votes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingSlug: meeting.slug,
          votes: newVotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to submit votes: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('Bulk vote submission result:', result);
      
      // Store votes in localStorage for future checks
      const cacheKey = `votes_${meeting.slug}_${userId}`;
      const allVotes = { ...existingVotes, ...selectedVotes };
      localStorage.setItem(cacheKey, JSON.stringify(allVotes));
      
      setIsSubmitted(true);
      await onVoteSubmitted();  // Trigger parent update
    } catch (error) {
      console.error('Vote submission error:', error);
      alert(`Failed to submit votes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVoteComplete = meeting.roles.every(role => selectedVotes[role.id] || existingVotes[role.id]);

  // Show loading state while checking existing votes
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your voting session...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isSubmitted ? (
        /* Success Message */
        <Card>
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Votes Submitted Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Thank you for participating in the voting session.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Votes:</h4>
              <div className="space-y-2">
                {Object.entries(selectedVotes).map(([roleId, nominee]) => {
                  const role = meeting.roles.find(r => r.id === roleId);
                  return (
                    <div key={roleId} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{role?.name}</span>
                      <span className="text-gray-900">{nominee.prefix} {nominee.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Voting Interface */
        <>
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
        {meeting.roles.map((role) => {
          const hasAlreadyVoted = existingVotes[role.id];
          const currentVote = selectedVotes[role.id] || existingVotes[role.id];
          
          return (
          <Card key={role.id}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {role.name}
              {hasAlreadyVoted && (
                <span className="ml-2 text-sm text-orange-600">✓ Already Voted</span>
              )}
              {selectedVotes[role.id] && !hasAlreadyVoted && (
                <span className="ml-2 text-sm text-green-600">✓ Selected</span>
              )}
            </h3>
            
            {hasAlreadyVoted ? (
              // Show existing vote with no interaction
              <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-3"></div>
                  <div>
                    <span className="font-medium text-orange-900">
                      {currentVote.prefix} {currentVote.name}
                    </span>
                    <p className="text-sm text-orange-700 mt-1">You have already voted for this role</p>
                  </div>
                </div>
              </div>
            ) : (
              // Show voting options
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
            )}
          </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Votes cast: {Object.keys(existingVotes).length + Object.keys(selectedVotes).length} of {meeting.roles.length}
              {Object.keys(existingVotes).length > 0 && (
                <span className="text-orange-600"> ({Object.keys(existingVotes).length} already submitted)</span>
              )}
            </p>
            {!isVoteComplete && Object.keys(selectedVotes).length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Ready to submit {Object.keys(selectedVotes).length} new vote(s)
              </p>
            )}
            {Object.keys(selectedVotes).length === 0 && Object.keys(existingVotes).length === meeting.roles.length && (
              <p className="text-xs text-orange-600 mt-1">
                You have already voted for all roles
              </p>
            )}
          </div>
          
          <Button
            onClick={submitVotes}
            disabled={Object.keys(selectedVotes).length === 0 || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? "Submitting..." : `Submit ${Object.keys(selectedVotes).length} Vote(s)`}
          </Button>
        </div>
      </Card>
        </>
      )}
    </div>
  );
};

export default VotingInterface;