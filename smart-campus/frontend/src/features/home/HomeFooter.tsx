import React from 'react';

export const HomeFooter: React.FC = () => {
  return (
    <footer className="border-t border-border py-8 text-xs sm:text-sm text-secondary bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="font-semibold text-foreground">SmartCampus</span> · Built for Chandigarh University
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/MANAN0120/TECHFORGE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
};
