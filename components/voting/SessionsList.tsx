import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import { Meeting } from "@/types/voting";

interface SessionsListProps {
  onBack: () => void;
  adminEmail: string;
}

const SessionsList: React.FC<SessionsListProps> = ({
  onBack,
  adminEmail,
}) => {
  const [sessions, setSessions] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/meetings/list?adminEmail=${encodeURIComponent(adminEmail)}`);
        
        if (response.ok) {
          const { meetings } = await response.json();
          setSessions(meetings || []);
        } else {
          console.error('Failed to fetch sessions:', response.statusText);
          setSessions([]);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [adminEmail]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          ← Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Voting Sessions</h2>
        <p className="text-gray-600">Manage your voting sessions and view results</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No voting sessions found</p>
            <Button onClick={onBack}>Create Your First Session</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {session.isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {session.clubName} • {new Date(session.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /voting/{session.slug}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      window.open(`/results/${session.slug}`, '_blank');
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    🎭 View Results
                  </Button>
                  <Button
                    onClick={() => {
                      const url = `${window.location.origin}/voting/${session.slug}`;
                      navigator.clipboard.writeText(url);
                      alert('Voting URL copied to clipboard!');
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    📋 Copy Link
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsList;