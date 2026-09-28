import { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { MeetupRequest, MeetupSuggestion, MeetupResponse } from '../../types/meetup';

export function useMeetupSuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MeetupSuggestion[]>([]);
  const [midpoint, setMidpoint] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggest = useCallback(async (req: MeetupRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res: MeetupResponse = await api.suggestMeetup(req);
      setSuggestions(res.suggestions || []);
      setMidpoint(res.midpoint || null);
      if (res.warnings && res.warnings.length > 0) {
        setError(res.warnings.join(' · '));
      }
    } catch (e) {
      setError('Could not find meetup points. Try a wider radius.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, suggestions, midpoint, error, suggest };
}
