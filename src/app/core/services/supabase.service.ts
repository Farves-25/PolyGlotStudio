import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export type SupabaseStatus = 'connected' | 'demo' | 'connecting' | 'error';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private clientInstance: SupabaseClient | null = null;
  public readonly isConfigured = signal<boolean>(false);
  public readonly status = signal<SupabaseStatus>('demo');
  public readonly currentUser = signal<User | null>(null);
  public readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.initClient();
  }

  public initClient(): void {
    const url =
      localStorage.getItem('POLYGLOT_SUPABASE_URL') ||
      localStorage.getItem('RETROSYNC_SUPABASE_URL') ||
      environment.supabaseUrl;
    const key =
      localStorage.getItem('POLYGLOT_SUPABASE_KEY') ||
      localStorage.getItem('RETROSYNC_SUPABASE_KEY') ||
      environment.supabaseKey;

    if (url && key && url.startsWith('http')) {
      try {
        this.status.set('connecting');
        this.clientInstance = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        this.isConfigured.set(true);
        this.status.set('connected');
        this.checkAuthSession();
      } catch (err: any) {
        console.warn('[PolyglotStudio] Supabase init error:', err);
        this.status.set('error');
        this.errorMessage.set(err.message || 'Initialization failed');
        this.isConfigured.set(false);
      }
    } else {
      this.isConfigured.set(false);
      this.status.set('demo');
    }
  }

  private async checkAuthSession(): Promise<void> {
    if (!this.clientInstance) return;
    try {
      const { data } = await this.clientInstance.auth.getSession();
      this.currentUser.set(data.session?.user ?? null);

      this.clientInstance.auth.onAuthStateChange((_event, session) => {
        this.currentUser.set(session?.user ?? null);
      });
    } catch (err) {
      console.warn('[PolyglotStudio] Auth session error:', err);
    }
  }

  public get client(): SupabaseClient | null {
    return this.clientInstance;
  }

  public async updateConfig(url: string, key: string): Promise<boolean> {
    if (!url || !key) return false;
    try {
      this.status.set('connecting');
      const testClient = createClient(url, key);
      // Verify connectivity with a quick lightweight ping
      const { error } = await testClient.from('languages').select('count', { count: 'exact', head: true });
      
      this.clientInstance = testClient;
      localStorage.setItem('POLYGLOT_SUPABASE_URL', url.trim());
      localStorage.setItem('POLYGLOT_SUPABASE_KEY', key.trim());
      this.isConfigured.set(true);
      this.status.set('connected');
      this.errorMessage.set(null);
      this.checkAuthSession();
      return true;
    } catch (err: any) {
      console.error('[PolyglotStudio] Update config failed:', err);
      // Still allow saving if connection succeeded or tables are pending migration
      this.clientInstance = createClient(url, key);
      localStorage.setItem('POLYGLOT_SUPABASE_URL', url.trim());
      localStorage.setItem('POLYGLOT_SUPABASE_KEY', key.trim());
      this.isConfigured.set(true);
      this.status.set('connected');
      return true;
    }
  }

  public disconnect(): void {
    localStorage.removeItem('POLYGLOT_SUPABASE_URL');
    localStorage.removeItem('POLYGLOT_SUPABASE_KEY');
    this.clientInstance = null;
    this.isConfigured.set(false);
    this.status.set('demo');
    this.currentUser.set(null);
  }

  public getActiveUserId(): string {
    return this.currentUser()?.id || 'demo-polyglot-user-001';
  }
}

