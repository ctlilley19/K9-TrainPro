'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, ActivityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatDuration, getTimerStatus, activityConfig, type ActivityType } from '@/lib/utils';
import {
  Dog,
  Clock,
  Camera,
  MessageSquare,
  MoreVertical,
  Plus,
  Filter,
  Home,
  Droplets,
  GraduationCap,
  Gamepad2,
  UtensilsCrossed,
  Moon,
} from 'lucide-react';

// Activity icons mapping
const activityIcons: Record<ActivityType, React.ReactNode> = {
  kennel: <Home size={16} />,
  potty: <Droplets size={16} />,
  training: <GraduationCap size={16} />,
  play: <Gamepad2 size={16} />,
  group_play: <Gamepad2 size={16} />,
  feeding: <UtensilsCrossed size={16} />,
  rest: <Moon size={16} />,
  walk: <Dog size={16} />,
  grooming: <Dog size={16} />,
  medical: <Dog size={16} />,
};

// Mock data for training board
const columns: { id: ActivityType; title: string; dogs: DogCard[] }[] = [
  {
    id: 'kennel',
    title: 'Kenneled',
    dogs: [
      { id: '1', name: 'Max', breed: 'German Shepherd', photo: null, startedAt: new Date(Date.now() - 45 * 60000), trainer: 'John' },
      { id: '2', name: 'Rocky', breed: 'Rottweiler', photo: null, startedAt: new Date(Date.now() - 180 * 60000), trainer: 'Sarah' },
    ],
  },
  {
    id: 'potty',
    title: 'Potty Break',
    dogs: [
      { id: '3', name: 'Bella', breed: 'Golden Retriever', photo: null, startedAt: new Date(Date.now() - 5 * 60000), trainer: 'John' },
    ],
  },
  {
    id: 'training',
    title: 'Training',
    dogs: [
      { id: '4', name: 'Luna', breed: 'Border Collie', photo: null, startedAt: new Date(Date.now() - 20 * 60000), trainer: 'Sarah' },
      { id: '5', name: 'Charlie', breed: 'Labrador', photo: null, startedAt: new Date(Date.now() - 15 * 60000), trainer: 'Mike' },
    ],
  },
  {
    id: 'play',
    title: 'Play Time',
    dogs: [
      { id: '6', name: 'Daisy', breed: 'Beagle', photo: null, startedAt: new Date(Date.now() - 25 * 60000), trainer: 'John' },
    ],
  },
  {
    id: 'feeding',
    title: 'Feeding',
    dogs: [],
  },
  {
    id: 'rest',
    title: 'Rest',
    dogs: [
      { id: '7', name: 'Cooper', breed: 'Husky', photo: null, startedAt: new Date(Date.now() - 60 * 60000), trainer: 'Sarah' },
    ],
  },
];

interface DogCard {
  id: string;
  name: string;
  breed: string;
  photo: string | null;
  startedAt: Date;
  trainer: string;
}

function DogCardComponent({ dog, activityType }: { dog: DogCard; activityType: ActivityType }) {
  const elapsedMinutes = Math.floor((Date.now() - dog.startedAt.getTime()) / 60000);
  const status = getTimerStatus(elapsedMinutes, activityType);
  const config = activityConfig[activityType];

  return (
    <div
      className={cn(
        'p-3 rounded-xl bg-surface-800/80 border transition-all duration-200',
        'hover:border-surface-600 hover:shadow-lg cursor-grab active:cursor-grabbing',
        status === 'urgent' ? 'border-red-500/50 shadow-red-500/10' :
        status === 'warning' ? 'border-yellow-500/50 shadow-yellow-500/10' :
        'border-surface-700'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Avatar name={dog.name} size="sm" />
          <div>
            <p className="font-medium text-white text-sm">{dog.name}</p>
            <p className="text-xs text-surface-500">{dog.breed}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
          <MoreVertical size={14} />
        </Button>
      </div>

      {/* Timer */}
      <div className={cn(
        'flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg',
        config.bgColor
      )}>
        <Clock size={14} className={cn(
          status === 'urgent' ? 'text-red-400 animate-pulse' :
          status === 'warning' ? 'text-yellow-400' :
          config.color
        )} />
        <span className={cn(
          'text-sm font-medium',
          status === 'urgent' ? 'text-red-400' :
          status === 'warning' ? 'text-yellow-400' :
          config.color
        )}>
          {formatDuration(elapsedMinutes)}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" title="Take photo">
          <Camera size={14} />
        </Button>
        <Button variant="ghost" size="icon-sm" title="Add note">
          <MessageSquare size={14} />
        </Button>
        <span className="ml-auto text-xs text-surface-500">{dog.trainer}</span>
      </div>
    </div>
  );
}

export default function TrainingBoardPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <PageHeader
        title="Training Board"
        description="Drag dogs between columns to log activities"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
              Filter
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
              Add Dog
            </Button>
          </div>
        }
      />

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns.map((column) => {
          const config = activityConfig[column.id];

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-72 flex flex-col"
            >
              {/* Column Header */}
              <div className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-t-xl border-t-2',
                'bg-surface-800/50',
                column.id === 'kennel' ? 'border-t-gray-500' :
                column.id === 'potty' ? 'border-t-yellow-500' :
                column.id === 'training' ? 'border-t-blue-500' :
                column.id === 'play' ? 'border-t-green-500' :
                column.id === 'feeding' ? 'border-t-purple-500' :
                'border-t-sky-500'
              )}>
                <ActivityBadge activity={column.id} size="sm">
                  {activityIcons[column.id]}
                </ActivityBadge>
                <span className="font-medium text-white text-sm">{column.title}</span>
                <span className="ml-auto text-xs text-surface-500 bg-surface-700 px-2 py-0.5 rounded-full">
                  {column.dogs.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-2 bg-surface-900/50 rounded-b-xl border border-surface-800 border-t-0 space-y-2 overflow-y-auto">
                {column.dogs.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-surface-600 text-sm">
                    Drop dogs here
                  </div>
                ) : (
                  column.dogs.map((dog) => (
                    <div key={dog.id} className="group">
                      <DogCardComponent dog={dog} activityType={column.id} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
