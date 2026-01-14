'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvided,
  type DroppableProvided,
} from '@hello-pangea/dnd';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActivityBadge } from '@/components/ui/Badge';
import { ActivityCard, QuickLogFAB, type ActivityDog } from '@/components/training';
import { cn, activityConfig, type ActivityType } from '@/lib/utils';
import { useTrainingBoard, useStartActivity, useEndActivity, useQuickLog, type TrainingBoardDog } from '@/hooks';
import { useUser } from '@/stores/authStore';
import {
  Dog,
  Filter,
  Plus,
  Home,
  Droplets,
  GraduationCap,
  Gamepad2,
  UtensilsCrossed,
  Moon,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Loader2,
  AlertCircle,
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
  grooming: <Sparkles size={16} />,
  medical: <Stethoscope size={16} />,
};

// Column configuration
const columnConfig: { id: ActivityType; title: string }[] = [
  { id: 'kennel', title: 'Kenneled' },
  { id: 'potty', title: 'Potty Break' },
  { id: 'training', title: 'Training' },
  { id: 'play', title: 'Play Time' },
  { id: 'feeding', title: 'Feeding' },
  { id: 'rest', title: 'Rest' },
];

// Transform TrainingBoardDog to ActivityDog for the UI components
function transformToActivityDog(dog: TrainingBoardDog): ActivityDog {
  return {
    id: dog.dogId,
    name: dog.dogName,
    breed: dog.dogBreed,
    photo_url: dog.photoUrl,
    startedAt: dog.startedAt,
    trainer: dog.trainer,
    notes: dog.notes,
    activityId: dog.id, // Store the activity ID for mutations
    programId: dog.programId,
  };
}

export default function TrainingBoardPage() {
  const user = useUser();
  const { data: boardData, isLoading, error, refetch } = useTrainingBoard();
  const startActivity = useStartActivity();
  const endActivity = useEndActivity();
  const quickLog = useQuickLog();

  // Local state for optimistic updates during drag operations
  const [columns, setColumns] = useState<Record<ActivityType, ActivityDog[]>>({
    kennel: [],
    potty: [],
    training: [],
    play: [],
    group_play: [],
    feeding: [],
    rest: [],
    walk: [],
    grooming: [],
    medical: [],
  });

  // Sync server data to local state
  useEffect(() => {
    if (boardData) {
      const transformedData: Record<ActivityType, ActivityDog[]> = {
        kennel: [],
        potty: [],
        training: [],
        play: [],
        group_play: [],
        feeding: [],
        rest: [],
        walk: [],
        grooming: [],
        medical: [],
      };

      for (const [activityType, dogs] of Object.entries(boardData)) {
        transformedData[activityType as ActivityType] = dogs.map(transformToActivityDog);
      }

      setColumns(transformedData);
    }
  }, [boardData]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // Dropped outside a droppable area
      if (!destination) return;

      // Dropped in the same position
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const sourceColumn = source.droppableId as ActivityType;
      const destColumn = destination.droppableId as ActivityType;

      // Find the dog being moved
      const movedDog = columns[sourceColumn][source.index];
      if (!movedDog) return;

      // Optimistic update
      setColumns((prev) => {
        const newColumns = { ...prev };

        // Remove from source
        const sourceDogs = [...newColumns[sourceColumn]];
        const [removedDog] = sourceDogs.splice(source.index, 1);

        // Update the dog's start time when moving to a new column
        const updatedDog = sourceColumn !== destColumn
          ? { ...removedDog, startedAt: new Date() }
          : removedDog;

        // Add to destination
        const destDogs = sourceColumn === destColumn ? sourceDogs : [...newColumns[destColumn]];
        destDogs.splice(destination.index, 0, updatedDog);

        newColumns[sourceColumn] = sourceDogs;
        newColumns[destColumn] = destDogs;

        return newColumns;
      });

      // If moving to a different column, start a new activity
      if (sourceColumn !== destColumn && movedDog.programId) {
        try {
          // End current activity
          if (movedDog.activityId) {
            await endActivity.mutateAsync({ activityId: movedDog.activityId });
          }

          // Start new activity
          await startActivity.mutateAsync({
            dog_id: movedDog.id,
            program_id: movedDog.programId,
            type: destColumn,
            trainer_id: user?.id || '',
          });
        } catch (err) {
          console.error('Failed to update activity:', err);
          // Revert on error - refetch will restore correct state
          refetch();
        }
      }
    },
    [columns, endActivity, startActivity, user?.id, refetch]
  );

  const handleQuickLog = useCallback(
    async (dogId: string, activityType: ActivityType, notes?: string) => {
      // Find the dog in any column
      let foundDog: ActivityDog | null = null;
      let sourceColumn: ActivityType | null = null;

      for (const [column, dogs] of Object.entries(columns)) {
        const dog = dogs.find((d) => d.id === dogId);
        if (dog) {
          foundDog = dog;
          sourceColumn = column as ActivityType;
          break;
        }
      }

      if (!foundDog || !sourceColumn || !foundDog.programId) return;

      // Optimistic update
      setColumns((prev) => {
        const newColumns = { ...prev };

        // Remove from source
        newColumns[sourceColumn!] = newColumns[sourceColumn!].filter((d) => d.id !== dogId);

        // Add to destination with new start time
        newColumns[activityType] = [
          ...newColumns[activityType],
          {
            ...foundDog!,
            startedAt: new Date(),
            notes,
          },
        ];

        return newColumns;
      });

      try {
        // End current activity
        if (foundDog.activityId) {
          await endActivity.mutateAsync({ activityId: foundDog.activityId });
        }

        // Start new activity
        await startActivity.mutateAsync({
          dog_id: dogId,
          program_id: foundDog.programId,
          type: activityType,
          trainer_id: user?.id || '',
          notes,
        });
      } catch (err) {
        console.error('Failed to log activity:', err);
        refetch();
      }
    },
    [columns, endActivity, startActivity, user?.id, refetch]
  );

  const handleAddPhoto = useCallback((dogId: string) => {
    // TODO: Open file picker and upload photo
    console.log('Add photo for dog:', dogId);
  }, []);

  const handleAddNote = useCallback(
    async (dogId: string, note: string) => {
      setColumns((prev) => {
        const newColumns = { ...prev };
        for (const column of Object.keys(newColumns) as ActivityType[]) {
          newColumns[column] = newColumns[column].map((dog) =>
            dog.id === dogId ? { ...dog, notes: note } : dog
          );
        }
        return newColumns;
      });
      // TODO: Update activity notes via API
    },
    []
  );

  const handleEndActivity = useCallback(
    async (dogId: string, currentColumn: ActivityType) => {
      const dog = columns[currentColumn].find((d) => d.id === dogId);
      if (!dog || !dog.programId) return;

      // Optimistic update - move dog back to kennel
      setColumns((prev) => {
        const newColumns = { ...prev };
        const movingDog = newColumns[currentColumn].find((d) => d.id === dogId);
        if (!movingDog) return prev;

        newColumns[currentColumn] = newColumns[currentColumn].filter((d) => d.id !== dogId);
        newColumns.kennel = [
          ...newColumns.kennel,
          { ...movingDog, startedAt: new Date(), notes: undefined },
        ];

        return newColumns;
      });

      try {
        // End current activity
        if (dog.activityId) {
          await endActivity.mutateAsync({ activityId: dog.activityId });
        }

        // Start kennel activity
        await startActivity.mutateAsync({
          dog_id: dogId,
          program_id: dog.programId,
          type: 'kennel',
          trainer_id: user?.id || '',
        });
      } catch (err) {
        console.error('Failed to end activity:', err);
        refetch();
      }
    },
    [columns, endActivity, startActivity, user?.id, refetch]
  );

  // Get all dogs for quick log dropdown
  const allDogs = Object.values(columns)
    .flat()
    .map((d) => ({ id: d.id, name: d.name }));

  // Loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-surface-400">Loading training board...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Failed to load training board</h2>
          <p className="text-surface-400 max-w-md">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <PageHeader
        title="Training Board"
        description="Drag dogs between columns to log activities"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={16} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
              Filter
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
              Add Dog
            </Button>
          </div>
        }
      />

      {/* Kanban Board with Drag and Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columnConfig.map((column) => {
            const config = activityConfig[column.id];
            const dogs = columns[column.id] || [];

            return (
              <div key={column.id} className="flex-shrink-0 w-72 flex flex-col">
                {/* Column Header */}
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-t-xl border-t-2',
                    'bg-surface-800/50',
                    column.id === 'kennel'
                      ? 'border-t-gray-500'
                      : column.id === 'potty'
                      ? 'border-t-yellow-500'
                      : column.id === 'training'
                      ? 'border-t-blue-500'
                      : column.id === 'play'
                      ? 'border-t-green-500'
                      : column.id === 'feeding'
                      ? 'border-t-purple-500'
                      : 'border-t-sky-500'
                  )}
                >
                  <ActivityBadge activity={column.id} size="sm">
                    {activityIcons[column.id]}
                  </ActivityBadge>
                  <span className="font-medium text-white text-sm">{column.title}</span>
                  <span className="ml-auto text-xs text-surface-500 bg-surface-700 px-2 py-0.5 rounded-full">
                    {dogs.length}
                  </span>
                </div>

                {/* Droppable Column Content */}
                <Droppable droppableId={column.id}>
                  {(provided: DroppableProvided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 p-2 rounded-b-xl border border-surface-800 border-t-0 space-y-2 overflow-y-auto transition-colors',
                        snapshot.isDraggingOver
                          ? 'bg-surface-800/70 border-brand-500/30'
                          : 'bg-surface-900/50'
                      )}
                    >
                      {dogs.length === 0 && !snapshot.isDraggingOver ? (
                        <div className="flex items-center justify-center h-24 text-surface-600 text-sm">
                          Drop dogs here
                        </div>
                      ) : (
                        dogs.map((dog, index) => (
                          <Draggable key={dog.id} draggableId={dog.id} index={index}>
                            {(provided: DraggableProvided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <ActivityCard
                                  dog={dog}
                                  activityType={column.id}
                                  isDragging={snapshot.isDragging}
                                  dragHandleProps={provided.dragHandleProps ?? undefined}
                                  onAddPhoto={() => handleAddPhoto(dog.id)}
                                  onAddNote={(note) => handleAddNote(dog.id, note)}
                                  onEndActivity={() => handleEndActivity(dog.id, column.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Quick Log FAB */}
      <QuickLogFAB dogs={allDogs} onLog={handleQuickLog} />
    </div>
  );
}
