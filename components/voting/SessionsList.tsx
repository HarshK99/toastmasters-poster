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
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);

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

  const handleCopyLink = async (session: Meeting) => {
    if (!session.slug) return;
    
    try {
      const url = `${window.location.origin}/voting/${session.slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedSlug(session.slug);
      setTimeout(() => setCopiedSlug(null), 2000); // Clear after 2 seconds
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for browsers that don't support clipboard API
      alert('Voting URL copied to clipboard!');
    }
  };

  const toggleSessionStatus = async (session: Meeting) => {
    if (!session.slug) return;
    
    try {
      setUpdatingSlug(session.slug);
      const response = await fetch('/api/meetings/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: session.slug,
          isActive: !session.isActive,
        }),
      });

      if (response.ok) {
        // Update the session in local state
        setSessions(prev => prev.map(s => 
          s.slug === session.slug 
            ? { ...s, isActive: !s.isActive }
            : s
        ));
      } else {
        console.error('Failed to update session status');
        alert('Failed to update session status');
      }
    } catch (error) {
      console.error('Error updating session status:', error);
      alert('Failed to update session status');
    } finally {
      setUpdatingSlug(null);
    }
  };

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
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {session.isActive ? "Active" : "Ended"}
                        </span>
                        {session.slug && (
                          <button
                            onClick={() => toggleSessionStatus(session)}
                            disabled={updatingSlug === session.slug}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              session.isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            } ${updatingSlug === session.slug ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            title={session.isActive ? "End Session" : "Activate Session"}
                          >
                            {updatingSlug === session.slug ? "..." : (session.isActive ? "End" : "Start")}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Meeting Code: {session.slug || 'N/A'}
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
                  {session.slug && (
                    <>
                      <Button
                        onClick={() => {
                          window.open(`/results/${session.slug}`, '_blank');
                        }}
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      >
                        🎭 View Results
                      </Button>
                      <Button
                        onClick={() => handleCopyLink(session)}
                        variant="ghost"
                        size="sm"
                        className={`w-full sm:w-auto text-xs sm:text-sm transition-all duration-200 ${
                          copiedSlug === session.slug 
                            ? "bg-green-100 text-green-700 border-green-300" 
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {copiedSlug === session.slug ? "✅ Copied!" : "📋 Copy Link"}
                      </Button>
                    </>
                  )}
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