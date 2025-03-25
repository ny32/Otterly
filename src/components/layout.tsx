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
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center">
          <Link to="/" className="text-xl font-bold whitespace-nowrap">
            GradeView 2.0
          </Link>
          <p className="flex-grow text-center text-xs sm:text-md mr-2 sm:mr-4 truncate">
            Link to use in school➡️ &nbsp; ❗
            <Link
              className="font-bold underline"
              to="https://tinyurl.com/StudentVueSucks"
              target="_blank"
            >
              tinyurl.com/StudentVueSucks
            </Link>
            ❗
          </p>
          <ThemeToggle />
        </div>
      </header>
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
};

export default Layout;
