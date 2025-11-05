import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/button";

interface ShareLinkSectionProps {
  meetingUrl: string;
}

const ShareLinkSection: React.FC<ShareLinkSectionProps> = ({ meetingUrl }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = meetingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-blue-50">
      <h3 className="text-xl font-semibold mb-4">📤 Share Voting Link</h3>
      <p className="text-gray-600 mb-4">
        Share this link with your Toastmasters members so they can participate in the voting:
      </p>
      
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <code className="text-sm text-gray-800 break-all flex-1 mr-4">
            {meetingUrl}
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
    </Card>
  );
};

export default ShareLinkSection;