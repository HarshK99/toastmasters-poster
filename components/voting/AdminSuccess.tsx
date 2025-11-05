import React from "react";
import { Meeting } from "@/types/voting";
import SuccessMessage from "./SuccessMessage";
import ShareLinkSection from "./ShareLinkSection";
import AdminActions from "./AdminActions";

interface AdminSuccessProps {
  meeting: Meeting;
  meetingUrl: string;
  onViewResults: () => void;
  onBackToAdmin: () => void;
  onEditSession: () => void;
  onClearSession: () => void;
}

const AdminSuccess: React.FC<AdminSuccessProps> = ({
  meeting,
  meetingUrl,
  onViewResults,
  onBackToAdmin,
  onEditSession,
  onClearSession,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SuccessMessage meeting={meeting} />
      <ShareLinkSection meetingUrl={meetingUrl} />
      <AdminActions
        onViewResults={onViewResults}
        onEditSession={onEditSession}
        onBackToAdmin={onBackToAdmin}
        onClearSession={onClearSession}
      />
    </div>
  );
};

export default AdminSuccess;