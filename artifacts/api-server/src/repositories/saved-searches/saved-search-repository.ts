import type { SavedSearchItem } from '../../../src/types/savedSearches';

export interface SavedSearchFilterOptions {
  status?: string;
  searchType?: string;
  monitoring?: boolean;
  query?: string;
}

export interface SavedSearchRepository {
  list(workspaceId: string, filter?: SavedSearchFilterOptions): Promise<SavedSearchItem[]>;
  getById(id: string, workspaceId: string): Promise<SavedSearchItem | undefined>;
  create(search: Partial<SavedSearchItem>, workspaceId: string, userId?: string): Promise<SavedSearchItem>;
  update(id: string, partial: Partial<SavedSearchItem>, workspaceId: string): Promise<SavedSearchItem | undefined>;
  delete(id: string, workspaceId: string): Promise<boolean>;
}
