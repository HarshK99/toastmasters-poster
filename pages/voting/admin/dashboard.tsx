import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminDashboard from "@/components/voting/AdminDashboard";

const AdminDashboardPage: NextPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in (you can use localStorage, sessionStorage, or a more robust auth system)
    const storedEmail = localStorage.getItem('adminEmail');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (storedEmail && loginTime) {
      // Check if login is still valid (e.g., within 24 hours)
      const now = Date.now();
      const loginTimeMs = parseInt(loginTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - loginTimeMs < twentyFourHours) {
        setIsAuthenticated(true);
        setAdminEmail(storedEmail);
      } else {
        // Clear expired session
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminLoginTime');
        router.push('/voting');
      }
    } else {
      router.push('/voting');
    }
    setIsLoading(false);
  }, [router]);

  const handleCreateNew = () => {
    router.push('/voting/admin/create');
  };

  const handleViewSessions = () => {
    router.push('/voting/admin/sessions');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoginTime');
    router.push('/voting');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24 sm:pt-28">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 sm:pt-28">
        <AdminDashboard
          onCreateNew={handleCreateNew}
          onViewSessions={handleViewSessions}
          adminEmail={adminEmail}
          onLogout={handleLogout}
        />
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;