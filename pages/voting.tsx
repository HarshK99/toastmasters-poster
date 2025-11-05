import React, { useState } from "react";
import type { NextPage } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSetup from "@/components/voting/AdminSetup";
import AdminSuccess from "@/components/voting/AdminSuccess";
import { Meeting } from "@/types/voting";

const AdminLogin = ({ onLogin }: { onLogin: (email: string) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user.role === "admin") {
        onLogin(data.user.email);
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

const VotingPage: NextPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [meetingUrl, setMeetingUrl] = useState("");

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setAdminEmail(email);
  };

  const handleMeetingCreated = (meetingData: Meeting, url: string) => {
    setMeeting(meetingData);
    setMeetingUrl(url);
  };

  const handleBackToAdmin = () => {
    setMeeting(null);
    setMeetingUrl("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Voting Dashboard
          </h1>
          <p className="text-gray-600">
            Create and manage Toastmaster voting sessions
          </p>
        </div>

        {!isAuthenticated ? (
          <AdminLogin onLogin={handleLogin} />
        ) : meeting && meetingUrl ? (
          <AdminSuccess 
            meeting={meeting}
            meetingUrl={meetingUrl}
            onViewResults={() => {}}
            onBackToAdmin={handleBackToAdmin}
            onEditSession={() => {}}
            onClearSession={handleBackToAdmin}
          />
        ) : (
          <AdminSetup
            onMeetingCreated={handleMeetingCreated}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VotingPage;
