export {
  useUpload,
  useDogPhotoUpload,
  useActivityMediaUpload,
  useAvatarUpload,
  useBatchUpload,
} from './useUpload';

export {
  useRealtime,
  useRealtimeActivities,
  useRealtimePresence,
  useRealtimeTrainingBoard,
  useRealtimeNotifications,
  useRealtimeBroadcast,
} from './useRealtime';

// Data fetching hooks with React Query
export {
  // Dogs
  useDogs,
  useDog,
  useCreateDog,
  useUpdateDog,
  useDogsWithPrograms,
  // Programs
  usePrograms,
  useActivePrograms,
  useProgram,
  // Families
  useFamilies,
  useFamily,
  // Training Board / Activities
  useTrainingBoard,
  useStartActivity,
  useEndActivity,
  useQuickLog,
  type TrainingBoardDog,
  // Badges
  useDogBadges,
  useAwardBadge,
  // Analytics
  useDashboardStats,
  // Reports
  useReports,
  useDogsNeedingReports,
  // Pet Parent Portal
  usePetParentFamily,
  usePetParentDogs,
  usePetParentDashboard,
  usePetParentReports,
  usePetParentGallery,
  usePetParentAchievements,
} from './useData';
