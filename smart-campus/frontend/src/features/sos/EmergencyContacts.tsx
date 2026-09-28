import React from 'react';
import { PhoneCall } from 'lucide-react';
import { EmergencyContact } from './types';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ contacts }) => {
  if (!contacts || contacts.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider">Emergency Contacts</h4>
      <div className="space-y-2">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-surface2 rounded-xl border border-border/60"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-error/10 border border-error/20 text-error">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{contact.label}</div>
                <div className="text-xs text-secondary font-mono mt-0.5">{contact.phone}</div>
              </div>
            </div>
            <a
              href={`tel:${contact.phone}`}
              className="px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error border border-error/40 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Call</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
