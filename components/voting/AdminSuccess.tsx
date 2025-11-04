import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";
import { Meeting } from "@/types/voting";

interface AdminSuccessProps {
  meeting: Meeting;
  onViewResults: () => void;
  onBackToAdmin: () => void;
  onEditSession: () => void;
  onClearSession: () => void;
}

const AdminSuccess: React.FC<AdminSuccessProps> = ({
  meeting,
  onViewResults,
  onBackToAdmin,
  onEditSession,
  onClearSession,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate the voting link (in a real app, this would be the actual domain)
  const votingLink = `${window.location.origin}/voting`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(votingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = votingLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      <Card>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            Voting Session Created Successfully!
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Your voting session &ldquo;{meeting.name}&rdquo; is ready for member participation.
          </p>
          <p className="text-sm text-gray-500">
            Meeting Date: {new Date(meeting.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            Categories: {meeting.roles.length} voting categories
          </p>
        </div>
      </Card>

      {/* Share Link */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">📤 Share Voting Link</h3>
        <p className="text-gray-600 mb-4">
          Share this link with your Toastmasters members so they can participate in the voting:
        </p>
        
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <code className="text-sm text-gray-800 break-all flex-1 mr-4">
              {votingLink}
            </code>
            <Button
              onClick={copyLink}
              variant={copied ? "ghost" : "secondary"}
              size="sm"
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <span className="text-green-600">✓ Copied!</span>
                </>
              ) : (
                <>
                  📋 Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Instructions for Members:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Click the link above or visit the voting page</li>
                <li>Enter their full name and email address</li>
                <li>Vote for nominees in each category</li>
                <li>Submit their votes (one-time only)</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>

      {/* Admin Actions */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">🔧 Admin Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={onViewResults}
            className="flex-1"
            size="lg"
          >
            📊 View Live Results
          </Button>
          
          <Button
            onClick={onEditSession}
            variant="secondary"
            className="flex-1"
            size="lg"
          >
            ✏️ Edit Session
          </Button>
          
          <Button
            onClick={onBackToAdmin}
            variant="ghost"
            className="flex-1"
            size="lg"
          >
            ➕ New Session
          </Button>
        </div>
        
        <div className="mt-4">
          <Button
            onClick={onClearSession}
            variant="danger"
            className="w-full"
            size="sm"
          >
            🗑️ End Voting Session
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-3 mt-0.5">⚠️</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Admin Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>Results update in real-time as members vote</li>
                <li>You can reveal results progressively during the meeting</li>
                <li>Members can only vote once per meeting</li>
                <li>Use screen sharing controls to manage result visibility</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSuccess;