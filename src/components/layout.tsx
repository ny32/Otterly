import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./theme-toggle";
import { useTheme } from "./theme-provider";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo_white.svg" : "/logo.svg";

  return (
    <div className="flex flex-col h-full">
      <header className="border-b flex-shrink-0">
        <div className="container mx-auto pr-2 sm:pr-4 py-2 sm:py-4 flex items-center">
          <Link
            to="/"
            className="flex items-center text-xl font-bold whitespace-nowrap"
          >
            <img src={logoSrc} alt="Otterly logo" className="mr-2 w-7 h-7" />
            Otterly
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
