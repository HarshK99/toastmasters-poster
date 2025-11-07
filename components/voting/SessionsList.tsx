import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";
import { Meeting } from "@/types/voting";

interface SessionsListProps {
  adminEmail: string;
}

const SessionsList: React.FC<SessionsListProps> = ({
  adminEmail,
}) => {
  const router = useRouter();
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
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Voting Sessions</h2>
        <p className="text-sm sm:text-base text-gray-600">Manage your voting sessions and view results</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No voting sessions found</p>
            <Button onClick={() => router.push('/voting/admin/create')}>Create Your First Session</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex justify-between items-start w-full sm:flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{session.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${
                        session.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {session.isActive ? "Active" : "Ended"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Meeting Code: {session.slug}
                    </p>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-600 ml-4">
                    {new Date(session.date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:ml-4">
                  <Button
                    onClick={() => {
                      window.open(`/results/${session.slug}`, '_blank');
                    }}
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm"
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
                    className="w-full sm:w-auto text-xs sm:text-sm"
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