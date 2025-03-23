import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./theme-toggle";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            GradeViewer
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
