import { supabase } from '../lib/supabase';
import { logError, AppError, ErrorType, ErrorSeverity } from '../utils/errorHandling';

export interface CRUDOptions {
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean }[];
  limit?: number;
  offset?: number;
  single?: boolean;
}

export interface CRUDResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface BulkCRUDResult<T> {
  data: T[] | null;
  error: string | null;
  count?: number;
}

export class CRUDService {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Create a new record
   */
  async create<T>(data: Partial<T>): Promise<CRUDResult<T>> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        logError(new AppError(
          `Failed to create ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.HIGH,
          { tableName: this.tableName, data, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error creating ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, data, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Read records with optional filtering, sorting, and pagination
   */
  async read<T>(options: CRUDOptions = {}): Promise<BulkCRUDResult<T>> {
    try {
      const {
        select = '*',
        filters = {},
        orderBy = [],
        limit,
        offset,
        single = false
      } = options;

      let query = supabase.from(this.tableName).select(select, { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && value.operator) {
            // Support for complex filters like { operator: 'gte', value: 10 }
            query = query[value.operator](key, value.value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      orderBy.forEach(({ column, ascending = true }) => {
        query = query.order(column, { ascending });
      });

      // Apply pagination
      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error, count } = single 
        ? await query.single()
        : await query;

      if (error) {
        logError(new AppError(
          `Failed to read ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.MEDIUM,
          { tableName: this.tableName, options, error: error.message }
        ));
        return { data: null, error: error.message, count: 0 };
      }

      return { 
        data: single ? [data] : data, 
        error: null, 
        count: count || (data ? (Array.isArray(data) ? data.length : 1) : 0)
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error reading ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.MEDIUM,
        { tableName: this.tableName, options, error: message }
      ));
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Read a single record by ID
   */
  async readById<T>(id: string, select: string = '*'): Promise<CRUDResult<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(select)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: 'Record not found' };
        }
        logError(new AppError(
          `Failed to read ${this.tableName} by ID`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.MEDIUM,
          { tableName: this.tableName, id, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error reading ${this.tableName} by ID`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.MEDIUM,
        { tableName: this.tableName, id, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Update a record by ID
   */
  async update<T>(id: string, data: Partial<T>): Promise<CRUDResult<T>> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logError(new AppError(
          `Failed to update ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.HIGH,
          { tableName: this.tableName, id, data, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error updating ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, id, data, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<CRUDResult<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logError(new AppError(
          `Failed to delete ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.HIGH,
          { tableName: this.tableName, id, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error deleting ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, id, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Soft delete (set archived/deleted flag)
   */
  async softDelete(id: string, deletedField: string = 'is_archived'): Promise<CRUDResult<any>> {
    try {
      const updateData = {
        [deletedField]: true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logError(new AppError(
          `Failed to soft delete ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.HIGH,
          { tableName: this.tableName, id, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error soft deleting ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, id, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate<T>(records: Partial<T>[]): Promise<BulkCRUDResult<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(records)
        .select();

      if (error) {
        logError(new AppError(
          `Failed to bulk create ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.HIGH,
          { tableName: this.tableName, count: records.length, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data, error: null, count: data?.length || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error bulk creating ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, count: records.length, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Bulk update records
   */
  async bulkUpdate<T>(updates: { id: string; data: Partial<T> }[]): Promise<BulkCRUDResult<T>> {
    try {
      // Supabase doesn't support bulk update directly, so we'll use multiple updates
      const results = await Promise.all(
        updates.map(({ id, data }) => this.update(id, data))
      );

      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        return { data: null, error: `Some updates failed: ${errors.join(', ')}` };
      }

      const data = results.map(r => r.data).filter(Boolean) as T[];
      return { data, error: null, count: data.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error bulk updating ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, count: updates.length, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Bulk delete records
   */
  async bulkDelete(ids: string[]): Promise<BulkCRUDResult<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .in('id', ids)
        .select();

      if (error) {
        logError(new AppError(
          `Failed to bulk delete ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.HIGH,
          { tableName: this.tableName, count: ids.length, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data, error: null, count: data?.length || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error bulk deleting ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, count: ids.length, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Bulk soft delete records
   */
  async bulkSoftDelete(ids: string[], deletedField: string = 'is_archived'): Promise<BulkCRUDResult<any>> {
    try {
      const updateData = {
        [deletedField]: true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .in('id', ids)
        .select();

      if (error) {
        logError(new AppError(
          `Failed to bulk soft delete ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.HIGH,
          { tableName: this.tableName, count: ids.length, error: error.message }
        ));
        return { data: null, error: error.message };
      }

      return { data, error: null, count: data?.length || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error bulk soft deleting ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.HIGH,
        { tableName: this.tableName, count: ids.length, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Search records with text search
   */
  async search<T>(searchTerm: string, searchColumns: string[], options: CRUDOptions = {}): Promise<BulkCRUDResult<T>> {
    try {
      const { select = '*', limit, offset } = options;

      let query = supabase.from(this.tableName).select(select, { count: 'exact' });

      // Create OR condition for text search across multiple columns
      const searchConditions = searchColumns.map(column => 
        `${column}.ilike.%${searchTerm}%`
      ).join(',');

      query = query.or(searchConditions);

      // Apply pagination
      if (limit) {
        query = query.limit(limit);
      }
      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        logError(new AppError(
          `Failed to search ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.MEDIUM,
          { tableName: this.tableName, searchTerm, searchColumns, error: error.message }
        ));
        return { data: null, error: error.message, count: 0 };
      }

      return { data, error: null, count: count || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error searching ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.MEDIUM,
        { tableName: this.tableName, searchTerm, searchColumns, error: message }
      ));
      return { data: null, error: message };
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(filters: Record<string, any> = {}): Promise<{ count: number; error: string | null }> {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { count, error } = await query;

      if (error) {
        logError(new AppError(
          `Failed to count ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.LOW,
          { tableName: this.tableName, filters, error: error.message }
        ));
        return { count: 0, error: error.message };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error counting ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.LOW,
        { tableName: this.tableName, filters, error: message }
      ));
      return { count: 0, error: message };
    }
  }

  /**
   * Check if a record exists
   */
  async exists(filters: Record<string, any>): Promise<{ exists: boolean; error: string | null }> {
    try {
      let query = supabase.from(this.tableName).select('id', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) {
        logError(new AppError(
          `Failed to check existence in ${this.tableName}`,
          ErrorType.DATABASE_ERROR,
          ErrorSeverity.LOW,
          { tableName: this.tableName, filters, error: error.message }
        ));
        return { exists: false, error: error.message };
      }

      return { exists: (count || 0) > 0, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      logError(new AppError(
        `Unexpected error checking existence in ${this.tableName}`,
        ErrorType.UNEXPECTED_ERROR,
        ErrorSeverity.LOW,
        { tableName: this.tableName, filters, error: message }
      ));
      return { exists: false, error: message };
    }
  }
}

// Predefined service instances for common tables
export const clientsService = new CRUDService('clients');
export const therapistsService = new CRUDService('therapist');
export const tasksService = new CRUDService('tasks');
export const assessmentsService = new CRUDService('assessments');
export const assessmentResultsService = new CRUDService('assessment_results');
export const notesService = new CRUDService('notes');
export const journalEntriesService = new CRUDService('journal_entries');
export const moodEntriesService = new CRUDService('mood_entries');
export const homeworkProgressService = new CRUDService('homework_progress');
export const therapistClientRelationsService = new CRUDService('therapist_client_relations'); 