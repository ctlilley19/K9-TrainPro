// Export all Supabase services
export { authService } from './auth';
export { dogsService } from './dogs';
export { familiesService } from './families';
export { programsService } from './programs';
export { activitiesService } from './activities';
export { mediaService } from './media';
export { badgesService, badgeDefinitions } from './badges';
export {
  homeworkService,
  homeworkTemplatesService,
  homeworkAssignmentsService,
  homeworkSubmissionsService,
} from './homework';
export {
  messagingService,
  conversationsService,
  messagesService,
  messageTemplatesService,
} from './messaging';
export {
  calendarService,
  staysService,
  appointmentsService,
  blocksService,
  scheduleTemplatesService,
  dailyLogsService,
} from './calendar';
export {
  reportsService,
  dailyReportsService,
  reportTemplatesService,
  reportCommentsService,
  reportReactionsService,
} from './reports';
export {
  videoLibraryService,
  videosService,
  videoFoldersService,
  playlistsService,
  videoSharesService,
} from './videos';
export {
  statusFeedService,
  feedReactionsService,
  feedCommentsService,
} from './feed';
export {
  facilityConfigService,
  configToFeatureFlags,
  defaultFeatureFlags,
} from './config';
export {
  kennelService,
  kennelAssignmentService,
  kennelActivityService,
  kennelQRUtils,
} from './kennels';
