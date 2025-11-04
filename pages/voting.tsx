import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSetup from "@/components/voting/AdminSetup";
import AdminSuccess from "@/components/voting/AdminSuccess";
import VotingInterface from "@/components/voting/VotingInterface";
import ResultsDisplay from "@/components/voting/ResultsDisplay";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";
import { Meeting, Vote, VoteResults, User } from "@/types/voting";

// Move LoginView component outside to prevent re-creation on every render
interface LoginViewProps {
  loginForm: { name: string; email: string };
  setLoginForm: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>;
  handleLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ loginForm, setLoginForm, handleLogin }) => (
  <div className="max-w-md mx-auto">
    <Card>
      <h2 className="text-xl font-semibold mb-4 text-center">Join Voting Session</h2>
      <div className="space-y-4">
        <Input
          label="Full Name"
          value={loginForm.name}
          onChange={(value) => setLoginForm(prev => ({ ...prev, name: value }))}
          placeholder="Enter your full name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={loginForm.email}
          onChange={(value) => setLoginForm(prev => ({ ...prev, email: value }))}
          placeholder="Enter your email (use 'admin' for admin access)"
          required
        />
        <Button 
          onClick={handleLogin}
          disabled={!loginForm.name || !loginForm.email}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </Card>
  </div>
);

const VotingPage: NextPage = () => {
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [view, setView] = useState<"login" | "admin" | "voting" | "results" | "admin-success">("login");
  const [loginForm, setLoginForm] = useState({ name: "", email: "" });
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);

  // Load persisted meeting and votes on component mount
  useEffect(() => {
    const savedMeeting = localStorage.getItem('currentMeeting');
    const savedVotes = localStorage.getItem('votes');
    
    if (savedMeeting) {
      setCurrentMeeting(JSON.parse(savedMeeting));
    }
    
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
  }, []);

  // Persist meeting and votes to localStorage when they change
  useEffect(() => {
    if (currentMeeting) {
      localStorage.setItem('currentMeeting', JSON.stringify(currentMeeting));
    }
  }, [currentMeeting]);

  useEffect(() => {
    if (votes.length > 0) {
      localStorage.setItem('votes', JSON.stringify(votes));
    }
  }, [votes]);

  // Simple login simulation
  const handleLogin = () => {
    if (!loginForm.name || !loginForm.email) return;
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: loginForm.name,
      email: loginForm.email,
      isAdmin: loginForm.email.includes("admin") // Simple admin check
    };
    
    setUser(newUser);
    // If there's an active meeting and user is not admin, go to voting
    // If user is admin, go to admin panel (or admin-success if meeting exists)
    if (newUser.isAdmin) {
      setView(currentMeeting ? "admin-success" : "admin");
    } else {
      setView("voting");
    }
  };

  const handleMeetingCreated = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setIsEditingMeeting(false); // Reset edit mode
    // Admin goes to success page, non-admin goes to voting
    setView(user?.isAdmin ? "admin-success" : "voting");
  };

  const handleVoteSubmitted = async (newVotes: Omit<Vote, "id" | "timestamp">[]) => {
    // In a real app, this would call an API
    const votesWithIds = newVotes.map(vote => ({
      ...vote,
      id: `vote-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString()
    }));
    
    setVotes(prev => [...prev, ...votesWithIds]);
    alert("Votes submitted successfully!");
  };

  const handleClearSession = () => {
    setCurrentMeeting(null);
    setVotes([]);
    localStorage.removeItem('currentMeeting');
    localStorage.removeItem('votes');
    setView("admin");
  };

  const handleEditSession = () => {
    setIsEditingMeeting(true);
    setView("admin");
  };

  const calculateResults = (): VoteResults[] => {
    if (!currentMeeting) return [];
    
    return currentMeeting.roles.map(role => {
      const roleVotes = votes.filter(vote => vote.roleId === role.id);
      const voteCounts: Record<string, number> = {};
      
      // Count votes for each nominee using a composite key
      roleVotes.forEach(vote => {
        const key = `${vote.nominee.prefix}-${vote.nominee.name}`;
        voteCounts[key] = (voteCounts[key] || 0) + 1;
      });
      
      // Calculate results
      const results = role.nominees.map(nominee => {
        const key = `${nominee.prefix}-${nominee.name}`;
        const voteCount = voteCounts[key] || 0;
        const percentage = roleVotes.length > 0 ? (voteCount / roleVotes.length) * 100 : 0;
        
        return {
          nominee,
          votes: voteCount,
          percentage
        };
      });
      
      return {
        roleId: role.id,
        roleName: role.name,
        results,
        totalVotes: roleVotes.length
      };
    });
  };

  const hasUserVoted = (userId: string, meetingId: string): boolean => {
    return votes.some(vote => vote.voterId === userId && vote.meetingId === meetingId);
  };

  const NavigationBar = () => (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600">
                Welcome, {user.name} {user.isAdmin && "(Admin)"}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {user?.isAdmin && (
              <>
                <Button
                  variant={view === "admin" || view === "admin-success" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setView("admin")}
                >
                  Setup
                </Button>
                <Button
                  variant={view === "results" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setView("results")}
                  disabled={!currentMeeting || votes.length === 0}
                >
                  Results
                </Button>
              </>
            )}
            
            {currentMeeting && !user?.isAdmin && (
              <Button
                variant={view === "voting" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("voting")}
              >
                Voting
              </Button>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setUser(null);
                setView("login");
                setCurrentMeeting(null);
                setVotes([]);
                localStorage.removeItem('currentMeeting');
                localStorage.removeItem('votes');
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {user && <NavigationBar />}
      
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {view === "login" && (
            <LoginView 
              loginForm={loginForm}
              setLoginForm={setLoginForm}
              handleLogin={handleLogin}
            />
          )}
          
          {view === "admin" && user?.isAdmin && (
            <AdminSetup 
              onMeetingCreated={handleMeetingCreated}
              existingMeeting={isEditingMeeting ? currentMeeting : null}
            />
          )}
          
          {view === "admin-success" && user?.isAdmin && currentMeeting && (
            <AdminSuccess 
              meeting={currentMeeting}
              onViewResults={() => setView("results")}
              onBackToAdmin={() => {
                setIsEditingMeeting(false);
                setView("admin");
              }}
              onEditSession={handleEditSession}
              onClearSession={handleClearSession}
            />
          )}
          
          {view === "voting" && user && !user.isAdmin && (
            <>
              {currentMeeting ? (
                <>
                  {hasUserVoted(user.id, currentMeeting.id) ? (
                    <Card>
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">✅</div>
                        <h2 className="text-xl font-semibold mb-2">Thank you for voting!</h2>
                        <p className="text-gray-600">
                          Your votes have been submitted for {currentMeeting.name}.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Results will be announced during the meeting.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <VotingInterface
                      meeting={currentMeeting}
                      onVoteSubmitted={handleVoteSubmitted}
                      userId={user.id}
                    />
                  )}
                </>
              ) : (
                <Card>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6">🗳️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      No Active Voting Session
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      There is currently no voting session available.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                      <div className="flex items-start">
                        <div className="text-blue-600 mr-3 mt-1">ℹ️</div>
                        <div className="text-left">
                          <p className="text-sm text-blue-800 font-medium mb-2">
                            What to do:
                          </p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Wait for your meeting organizer to start voting</li>
                            <li>• Check if you have the correct voting link</li>
                            <li>• Contact your VP Education if you need help</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-6">
                      This page will automatically update when voting becomes available.
                    </p>
                  </div>
                </Card>
              )}
            </>
          )}
          
          {view === "results" && currentMeeting && user?.isAdmin && (
            <ResultsDisplay
              meeting={currentMeeting}
              results={calculateResults()}
              onClose={() => setView("admin")}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VotingPage;