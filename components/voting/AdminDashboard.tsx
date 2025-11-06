import React from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";

interface AdminDashboardProps {
  onCreateNew: () => void;
  onViewSessions: () => void;
  adminEmail: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onCreateNew,
  onViewSessions,
  adminEmail,
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Welcome back, {adminEmail.split('@')[0]}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onCreateNew}
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create New Session</span>
          </Button>
          
          <Button
            onClick={onViewSessions}
            variant="secondary"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>View Sessions</span>
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Choose an option to get started
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;