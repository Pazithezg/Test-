import { DiscoveryRepository } from './interface';
import { LocalDiscoveryRepository } from './local-repo';
import { SupabaseDiscoveryRepository } from './supabase-repo';

let repositoryInstance: DiscoveryRepository | null = null;

export function getDiscoveryRepository(): DiscoveryRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      repositoryInstance = new SupabaseDiscoveryRepository(supabaseUrl, supabaseKey);
      return repositoryInstance;
    } catch (err) {
      console.warn('Could not initialize Supabase client, falling back to LocalDiscoveryRepository:', err);
    }
  }

  repositoryInstance = new LocalDiscoveryRepository();
  return repositoryInstance;
}

export function resetRepositoryInstance(repo?: DiscoveryRepository): void {
  repositoryInstance = repo || null;
}
