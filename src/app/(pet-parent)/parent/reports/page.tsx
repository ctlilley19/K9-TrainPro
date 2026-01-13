'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Download,
  Star,
  TrendingUp,
  Image,
  MessageSquare,
} from 'lucide-react';

// Mock reports data
const mockReports = [
  {
    id: '1',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    date: '2025-01-12',
    trainer: 'Sarah Johnson',
    summary: 'Great progress on leash walking! Max showed excellent focus during training sessions.',
    highlights: [
      'Mastered heel command at 90% accuracy',
      'Reduced leash pulling by 50%',
      'Successfully completed first off-leash recall',
    ],
    mood: 'Happy & Energetic',
    appetite: 'Good',
    has_photos: true,
    photo_count: 4,
    training_minutes: 45,
    skills_practiced: ['Heel', 'Recall', 'Stay'],
  },
  {
    id: '2',
    dog: { id: 'b', name: 'Bella', breed: 'Golden Retriever', photo_url: null },
    date: '2025-01-12',
    trainer: 'John Smith',
    summary: 'Bella is making steady progress with basic commands. Working on building focus.',
    highlights: [
      'Improved sit-stay duration to 30 seconds',
      'Good socialization during group play',
    ],
    mood: 'Playful',
    appetite: 'Good',
    has_photos: true,
    photo_count: 2,
    training_minutes: 30,
    skills_practiced: ['Sit', 'Stay', 'Name Recognition'],
  },
  {
    id: '3',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    date: '2025-01-11',
    trainer: 'Sarah Johnson',
    summary: 'Focused on recall training today. Max is showing great improvement.',
    highlights: [
      'Recall success rate improved to 80%',
      'Good impulse control exercises',
    ],
    mood: 'Focused',
    appetite: 'Good',
    has_photos: true,
    photo_count: 3,
    training_minutes: 50,
    skills_practiced: ['Recall', 'Wait', 'Leave It'],
  },
  {
    id: '4',
    dog: { id: 'a', name: 'Max', breed: 'German Shepherd', photo_url: null },
    date: '2025-01-10',
    trainer: 'Sarah Johnson',
    summary: 'Max earned his Sit Master badge today! Excellent training session.',
    highlights: [
      'Earned Sit Master badge (Gold)',
      'Sit command at 95% accuracy',
      'Duration hold improved to 2 minutes',
    ],
    mood: 'Excellent',
    appetite: 'Good',
    has_photos: true,
    photo_count: 5,
    training_minutes: 60,
    skills_practiced: ['Sit', 'Down', 'Place'],
    badge_earned: { name: 'Sit Master', tier: 'gold' },
  },
];

export default function PetParentReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDog, setSelectedDog] = useState<string | 'all'>('all');

  const dogs = Array.from(
    new Map(mockReports.map((r) => [r.dog.id, r.dog])).values()
  );

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.dog.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDog = selectedDog === 'all' || report.dog.id === selectedDog;
    return matchesSearch && matchesDog;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Daily Reports</h1>
        <p className="text-surface-400">
          View daily training updates and progress reports for your dogs.
        </p>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedDog}
              onChange={(e) => setSelectedDog(e.target.value)}
              className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Dogs</option>
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className="hover:border-brand-500/30 transition-all"
            variant="bordered"
          >
            <div className="flex flex-col lg:flex-row gap-4 p-4">
              {/* Dog Info & Date */}
              <div className="flex items-start gap-4 lg:w-64">
                <Avatar name={report.dog.name} size="lg" />
                <div>
                  <h3 className="font-semibold text-white">{report.dog.name}</h3>
                  <p className="text-sm text-surface-500">{report.dog.breed}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-surface-400">
                    <Calendar size={14} />
                    {formatDate(report.date)}
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="flex-1">
                <p className="text-surface-300 mb-3">{report.summary}</p>

                {/* Highlights */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {report.highlights.slice(0, 2).map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs"
                      >
                        <Star size={12} />
                        {highlight}
                      </span>
                    ))}
                    {report.highlights.length > 2 && (
                      <span className="text-xs text-surface-500">
                        +{report.highlights.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Earned */}
                {report.badge_earned && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                      <Star size={14} />
                      Badge Earned: {report.badge_earned.name}
                    </span>
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={14} />
                    {report.training_minutes} min training
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {report.skills_practiced.length} skills
                  </span>
                  {report.has_photos && (
                    <span className="flex items-center gap-1">
                      <Image size={14} />
                      {report.photo_count} photos
                    </span>
                  )}
                  <span>by {report.trainer}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col items-center gap-2">
                <Link href={`/parent/reports/${report.id}`}>
                  <Button variant="primary" size="sm">
                    View Report
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
                  PDF
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
          <p className="text-surface-400">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Daily reports will appear here once available'}
          </p>
        </Card>
      )}
    </div>
  );
}
