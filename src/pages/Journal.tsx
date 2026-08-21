import { useState, useEffect, useMemo, useCallback } from 'react';
import { BookOpen, RefreshCw, Sparkles, Inbox } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { JournalFilters } from '../components/journal/JournalFilters';
import { ActivitySummaryTimeline } from '../components/journal/ActivitySummaryTimeline';
import { FeedbackSection } from '../components/journal/FeedbackSection';
import { JourneyMap } from '../components/journal/JourneyMap';
import { useAppStore } from '../store';
import { fetchUserJournalData, filterEvents, getLocalJournalEvents } from '../services/journalService';
import { getSession, getUidFromUser } from '../services/auth';
import type { JournalActivityEvent, DateFilterOption, TypeFilterOption } from '../types/journal';

export default function Journal() {
  const session = useAppStore((s) => s.session);
  const storeState = useAppStore();

  const [events, setEvents] = useState<JournalActivityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilterOption>('all');

  const activeUserId = session?.userId ?? 'demo-user-id';

  const loadJournalData = useCallback(async () => {
    setLoading(true);

    // 1. Resolve current session (Zustand state or Supabase auth check)
    let currentSession = session;
    if (!currentSession) {
      const spSession = await getSession();
      if (spSession?.user) {
        currentSession = {
          userId: spSession.user.id,
          uid: getUidFromUser(spSession.user),
          sessionStart: new Date().toISOString(),
          isDemo: false,
        };
      }
    }

    if (currentSession?.userId && !currentSession.isDemo) {
      // Authenticated Supabase User
      const data = await fetchUserJournalData(currentSession.userId);
      setEvents(data);
    } else {
      // Explicit Demo / Guest Mode
      const localData = getLocalJournalEvents(storeState as unknown as Record<string, unknown>);
      setEvents(localData);
    }

    setLoading(false);
  }, [session, storeState]);

  useEffect(() => {
    loadJournalData();
  }, [loadJournalData]);

  // Handle new feedback submission
  const handleFeedbackSaved = (newEvent: JournalActivityEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return filterEvents(events, dateFilter, typeFilter);
  }, [events, dateFilter, typeFilter]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/20 border border-surface-border/60 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent-lavender" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Private Activity Record
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
                Journal &amp; Journey
              </h1>
            </div>
          </div>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-2xl">
            View your chronological timeline of analysis pattern matches, condition workspace activities, global tools, and feedback.
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={loadJournalData}
          disabled={loading}
          className="self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* FILTER BAR */}
      <JournalFilters
        dateFilter={dateFilter}
        typeFilter={typeFilter}
        onDateFilterChange={setDateFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-accent-lavender/30 border-t-accent-lavender animate-spin" />
          <p className="text-xs font-mono text-text-muted">Fetching your journal history from Supabase...</p>
        </div>
      ) : events.length === 0 ? (
        /* FRIENDLY EMPTY STATE */
        <Card className="border-dashed border-surface-border py-12 text-center">
          <CardContent className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-hover/60 border border-surface-border flex items-center justify-center mx-auto text-text-muted">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-text-primary">
                No activities recorded yet
              </h3>
              <p className="text-xs md:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                As you run analysis check-ins, complete condition workspace exercises, use global tools, or submit feedback, your private timeline will appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* MAIN CONTENT SECTIONS */
        <div className="space-y-12">
          {/* 1. ACTIVITY SUMMARY TIMELINE */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-lavender" />
                Activity Summary Timeline
              </h2>
              <span className="text-xs font-mono text-text-muted">
                Showing {filteredEvents.length} of {events.length} records
              </span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface/50 border border-surface-border text-xs text-text-muted">
                No events match the selected filter criteria.
              </div>
            ) : (
              <ActivitySummaryTimeline events={filteredEvents} />
            )}
          </section>

          {/* 2. FEEDBACK SECTION */}
          <section className="pt-4 border-t border-surface-border/60">
            <FeedbackSection
              userId={activeUserId}
              events={events}
              onFeedbackSaved={handleFeedbackSaved}
            />
          </section>

          {/* 3. JOURNEY MAP (AT THE BOTTOM) */}
          <section className="pt-4 border-t border-surface-border/60 space-y-4">
            <JourneyMap events={events} />
          </section>
        </div>
      )}
    </div>
  );
}
