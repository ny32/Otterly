import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./theme-toggle";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b flex-shrink-0">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center">
          <Link to="/" className="text-xl font-bold whitespace-nowrap">
            GradeView 2.0
          </Link>
          <p className="flex-grow text-center text-md sm:text-md mr-2 sm:mr-4 truncate">
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
      <main className="flex-grow overflow-auto">{children}</main>
    </div>
  );
};

export default Layout;
