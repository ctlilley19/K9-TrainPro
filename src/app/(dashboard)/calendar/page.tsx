'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  useCalendarEvents,
  useActiveStays,
  useUpcomingStays,
  useUpcomingAppointments,
  useCheckInStay,
  useCheckOutStay,
  useDogs,
} from '@/hooks';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Dog,
  Home,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Users,
  Filter,
  List,
  Grid3X3,
} from 'lucide-react';
import type { CalendarEvent, BoardTrainStayWithDetails } from '@/types/database';

type ViewMode = 'month' | 'week' | 'day' | 'list';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // Calculate date range for current view
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'month') {
      start.setDate(1);
      start.setDate(start.getDate() - start.getDay());
      end.setMonth(end.getMonth() + 1, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    } else {
      // day view - just current day
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }, [currentDate, viewMode]);

  const { data: events, isLoading: eventsLoading } = useCalendarEvents(dateRange);
  const { data: activeStays } = useActiveStays();
  const { data: upcomingStays } = useUpcomingStays();
  const { data: upcomingAppointments } = useUpcomingAppointments(5);
  const { data: dogs } = useDogs();

  const checkInStay = useCheckInStay();
  const checkOutStay = useCheckOutStay();

  // Generate calendar grid for month view
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(currentDate);
    start.setDate(1);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 42; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    if (!events) return [];
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleCheckIn = async (stayId: string) => {
    try {
      await checkInStay.mutateAsync(stayId);
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleCheckOut = async (stayId: string) => {
    try {
      await checkOutStay.mutateAsync(stayId);
    } catch (error) {
      console.error('Failed to check out:', error);
    }
  };

  const totalBoardingDogs = activeStays?.length || 0;
  const todayCheckIns = upcomingStays?.filter(s => {
    const checkIn = new Date(s.check_in_date);
    const today = new Date();
    return checkIn.toDateString() === today.toDateString();
  }).length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-surface-400">
            {totalBoardingDogs} dogs currently boarding
            {todayCheckIns > 0 && ` · ${todayCheckIns} check-in${todayCheckIns !== 1 ? 's' : ''} today`}
          </p>
        </div>
        <Button onClick={() => setShowNewEventModal(true)}>
          <Plus size={18} className="mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-white">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={navigatePrevious}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={navigateNext}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
                  {(['month', 'week', 'day', 'list'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        'px-3 py-1.5 text-sm capitalize transition-colors',
                        viewMode === mode
                          ? 'bg-brand-500 text-white'
                          : 'text-surface-400 hover:text-white hover:bg-surface-800'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Grid - Month View */}
            {viewMode === 'month' && (
              <div className="p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-surface-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentDay = isToday(day);
                    const inMonth = isCurrentMonth(day);

                    return (
                      <div
                        key={index}
                        className={cn(
                          'min-h-[100px] p-1 border border-white/[0.06] rounded-lg',
                          !inMonth && 'bg-surface-900/50',
                          isCurrentDay && 'border-brand-500/50 bg-brand-500/5'
                        )}
                      >
                        <div
                          className={cn(
                            'text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                            isCurrentDay
                              ? 'bg-brand-500 text-white'
                              : inMonth
                                ? 'text-white'
                                : 'text-surface-600'
                          )}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setSelectedEvent(event)}
                              className={cn(
                                'w-full text-left text-xs px-1.5 py-0.5 rounded truncate',
                                event.type === 'stay' && 'bg-emerald-500/20 text-emerald-400',
                                event.type === 'appointment' && 'bg-blue-500/20 text-blue-400',
                                event.type === 'block' && 'bg-gray-500/20 text-gray-400'
                              )}
                              style={{
                                backgroundColor:
                                  event.type === 'appointment'
                                    ? `${event.color}20`
                                    : undefined,
                                color:
                                  event.type === 'appointment' ? event.color : undefined,
                              }}
                            >
                              {event.title}
                            </button>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-surface-500 px-1.5">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const day = new Date(currentDate);
                    day.setDate(day.getDate() - day.getDay() + i);
                    const dayEvents = getEventsForDay(day);
                    const isCurrentDay = isToday(day);

                    return (
                      <div key={i} className="space-y-2">
                        <div
                          className={cn(
                            'text-center py-2 rounded-lg',
                            isCurrentDay && 'bg-brand-500/10'
                          )}
                        >
                          <div className="text-xs text-surface-500">{DAYS[i]}</div>
                          <div
                            className={cn(
                              'text-lg font-semibold',
                              isCurrentDay ? 'text-brand-400' : 'text-white'
                            )}
                          >
                            {day.getDate()}
                          </div>
                        </div>
                        <div className="space-y-1 min-h-[300px]">
                          {dayEvents.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setSelectedEvent(event)}
                              className={cn(
                                'w-full text-left text-xs p-2 rounded-lg',
                                event.type === 'stay' && 'bg-emerald-500/20 text-emerald-400',
                                event.type === 'appointment' && 'bg-blue-500/20 text-blue-400',
                                event.type === 'block' && 'bg-gray-500/20 text-gray-400'
                              )}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              {!event.allDay && (
                                <div className="text-[10px] opacity-75">
                                  {formatTime(event.start)}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day View */}
            {viewMode === 'day' && (
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-white">
                    {currentDate.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  {getEventsForDay(currentDate).length === 0 ? (
                    <div className="text-center py-12 text-surface-500">
                      No events scheduled for this day
                    </div>
                  ) : (
                    getEventsForDay(currentDate).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border transition-colors',
                          'border-white/[0.06] hover:border-white/[0.12] hover:bg-surface-800/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-white">{event.title}</div>
                            <div className="text-sm text-surface-400">
                              {event.allDay
                                ? 'All day'
                                : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                            </div>
                          </div>
                          <div className="text-xs text-surface-500 capitalize">
                            {event.type}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="p-4">
                <div className="space-y-4">
                  {events?.length === 0 ? (
                    <div className="text-center py-12 text-surface-500">
                      No events in this period
                    </div>
                  ) : (
                    events?.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border transition-colors',
                          'border-white/[0.06] hover:border-white/[0.12] hover:bg-surface-800/50'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <div className="text-xs text-surface-500">
                              {event.start.toLocaleDateString(undefined, { month: 'short' })}
                            </div>
                            <div className="text-2xl font-bold text-white">
                              {event.start.getDate()}
                            </div>
                            <div className="text-xs text-surface-500">
                              {event.start.toLocaleDateString(undefined, { weekday: 'short' })}
                            </div>
                          </div>
                          <div
                            className="w-1 h-12 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-white">{event.title}</div>
                            <div className="text-sm text-surface-400">
                              {event.allDay
                                ? 'All day'
                                : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                            </div>
                          </div>
                          <div className="text-xs text-surface-500 capitalize px-2 py-1 bg-surface-800 rounded">
                            {event.type}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Currently Boarding */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Currently Boarding</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                {activeStays?.length || 0} dogs
              </span>
            </div>
            <div className="space-y-3">
              {activeStays?.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">
                  No dogs currently boarding
                </p>
              ) : (
                activeStays?.slice(0, 5).map((stay) => (
                  <div
                    key={stay.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800/50 transition-colors"
                  >
                    <Avatar name={stay.dog?.name || ''} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {stay.dog?.name}
                      </div>
                      <div className="text-xs text-surface-500">
                        {stay.kennel_number} · Until{' '}
                        {new Date(stay.check_out_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCheckOut(stay.id)}
                      title="Check Out"
                    >
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Today's Check-ins */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Today&apos;s Check-ins</h3>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                {todayCheckIns}
              </span>
            </div>
            <div className="space-y-3">
              {todayCheckIns === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">
                  No check-ins scheduled today
                </p>
              ) : (
                upcomingStays
                  ?.filter((s) => {
                    const checkIn = new Date(s.check_in_date);
                    const today = new Date();
                    return checkIn.toDateString() === today.toDateString();
                  })
                  .map((stay) => (
                    <div
                      key={stay.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800/50 transition-colors"
                    >
                      <Avatar name={stay.dog?.name || ''} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">
                          {stay.dog?.name}
                        </div>
                        <div className="text-xs text-surface-500">
                          {stay.program?.name || 'Board & Train'}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCheckIn(stay.id)}
                      >
                        Check In
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="p-4">
            <h3 className="font-medium text-white mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              {upcomingAppointments?.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">
                  No upcoming appointments
                </p>
              ) : (
                upcomingAppointments?.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: appt.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">
                          {appt.title}
                        </div>
                        <div className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(appt.start_time).toLocaleString(undefined, {
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {appt.location && (
                          <div className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {appt.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-medium text-white mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-surface-800/50">
                <div className="text-2xl font-bold text-white">
                  {activeStays?.length || 0}
                </div>
                <div className="text-xs text-surface-500">Boarding</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface-800/50">
                <div className="text-2xl font-bold text-white">
                  {upcomingStays?.length || 0}
                </div>
                <div className="text-xs text-surface-500">Upcoming</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface-800/50">
                <div className="text-2xl font-bold text-white">
                  {upcomingAppointments?.length || 0}
                </div>
                <div className="text-xs text-surface-500">Appointments</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface-800/50">
                <div className="text-2xl font-bold text-white">
                  {dogs?.length || 0}
                </div>
                <div className="text-xs text-surface-500">Total Dogs</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <Card
            className="w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: selectedEvent.color }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-surface-400 capitalize">
                  {selectedEvent.type}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-surface-300">
                <CalendarIcon size={16} className="text-surface-500" />
                <span>
                  {selectedEvent.start.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-surface-300">
                <Clock size={16} className="text-surface-500" />
                <span>
                  {selectedEvent.allDay
                    ? 'All day'
                    : `${formatTime(selectedEvent.start)} - ${formatTime(selectedEvent.end)}`}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
              <Button variant="primary" className="flex-1">
                Edit Event
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
