import React from 'react';
import { Layers, Terminal, ExternalLink } from 'lucide-react';

export const ArchitectureProof: React.FC = () => {
  const techStack = ['React 18', 'TypeScript', 'FastAPI', 'Leaflet', 'NetworkX', 'Gemini AI'];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-border/50">
      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            One engine. Any campus.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-secondary leading-relaxed max-w-2xl">
            The routing engine, search, and AI assistant run on a campus manifest. Swap the JSON manifest, deploy to any new university without code changes.
          </p>
        </div>

        {/* Campus Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="bg-primary text-black px-4 py-2 rounded-full text-sm font-extrabold flex items-center space-x-1.5 shadow-md shadow-primary/10">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span>Chandigarh University</span>
          </span>
          <span className="bg-surface border border-border text-secondary px-4 py-2 rounded-full text-sm font-medium">
            + Add campus manifest
          </span>
        </div>

        {/* Tech Stack Chips */}
        <div className="pt-4 space-y-2">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>Core Architecture Stack</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                className="bg-surface2 border border-border/60 text-secondary px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Manifest Link */}
        <div className="pt-2">
          <a
            href="https://github.com/MANAN0120/TECHFORGE/tree/main/smart-campus/campus-data/cu-gharaun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-sm text-primary font-semibold hover:underline"
          >
            <span>view campus data manifest</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
