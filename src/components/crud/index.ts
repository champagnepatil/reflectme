// CRUD Components
export { CRUDTable } from './CRUDTable';
export { CRUDForm } from './CRUDForm';

// Types
export type { CRUDColumn, CRUDTableProps } from './CRUDTable';
export type { CRUDField, CRUDFormProps } from './CRUDForm';

// Services
export { 
  CRUDService,
  clientsService,
  therapistsService,
  tasksService,
  assessmentsService,
  assessmentResultsService,
  notesService,
  journalEntriesService,
  moodEntriesService,
  homeworkProgressService,
  therapistClientRelationsService
} from '../../services/crudService';

export type { 
  CRUDOptions, 
  CRUDResult, 
  BulkCRUDResult 
} from '../../services/crudService'; 