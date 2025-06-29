'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = true,
  className 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header className={cn(
          showSidebar && 'lg:pl-64',
          'relative'
        )} />

        {/* Mobile menu button */}
        {showSidebar && (
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Page content */}
        <main className={cn(
          'flex-1 overflow-auto',
          showSidebar && 'lg:pl-64',
          className
        )}>
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export { AppLayout };