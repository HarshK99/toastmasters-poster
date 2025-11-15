import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionsList from "@/components/voting/SessionsList";
import Loading from '@/components/ui/Loading'

const AdminSessionsPage: NextPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const storedEmail = localStorage.getItem('adminEmail');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (storedEmail && loginTime) {
      const now = Date.now();
      const loginTimeMs = parseInt(loginTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - loginTimeMs < twentyFourHours) {
        setIsAuthenticated(true);
        setAdminEmail(storedEmail);
      } else {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminLoginTime');
        router.push('/voting');
      }
    } else {
      router.push('/voting');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <Loading message="Loading..." variant="center" className="pt-24 sm:pt-28" />
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 sm:pt-28">
        <SessionsList
          adminEmail={adminEmail}
        />
      </main>
      <Footer />
    </div>
  );
};

export default AdminSessionsPage;