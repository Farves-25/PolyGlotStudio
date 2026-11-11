import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import { LanguageService } from './language.service';
import { UserProgressService } from './user-progress.service';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github' | 'apple' | 'guest';
  targetLanguage: string;
  goal: string;
  dailyMinutes: number;
  startingLevel: string;
  createdAt: string;
}

const STORAGE_KEY = 'POLYGLOT_USER_PROFILE';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private langService = inject(LanguageService);
  private progress = inject(UserProgressService);

  public readonly currentUser = signal<UserProfile | null>(null);
  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly isLoading = signal<boolean>(false);

  constructor() {
    this.restoreSession();
    this.syncSupabaseAuth();
    this.preventOAuthBackNavigation();
  }

  private preventOAuthBackNavigation(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('popstate', () => {
      if (this.isAuthenticated()) {
        const path = window.location.pathname;
        if (path === '/' || path === '/welcome' || path === '/onboarding') {
          window.history.pushState({ app: true }, '', '/dashboard');
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
      }
    });
  }

  private syncSupabaseAuth(): void {
    if (typeof window === 'undefined') return;

    // Listen for incoming OAuth redirects or session changes
    setTimeout(() => {
      if (this.supabase.client) {
        this.supabase.client.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            const user = session.user;
            const pendingLang = localStorage.getItem('POLYGLOT_PENDING_LANG');
            const pendingGoal = localStorage.getItem('POLYGLOT_PENDING_GOAL');
            const pendingMinutes = localStorage.getItem('POLYGLOT_PENDING_MINUTES');
            const pendingLevel = localStorage.getItem('POLYGLOT_PENDING_LEVEL');

            // Detect if this is an active OAuth redirect callback (not a page refresh)
            const isFreshOAuthCallback =
              event === 'SIGNED_IN' &&
              (!!pendingLang ||
                window.location.hash.includes('access_token') ||
                window.location.search.includes('code='));

            const profile: UserProfile = {
              id: user.id,
              email: user.email || 'learner@gmail.com',
              name: user.user_metadata?.['full_name'] || user.user_metadata?.['name'] || user.email?.split('@')[0] || 'Learner',
              avatar: user.user_metadata?.['avatar_url'] || user.user_metadata?.['picture'] || '🌐',
              provider: 'google',
              targetLanguage: pendingLang || this.currentUser()?.targetLanguage || this.langService.selectedLanguage().id,
              goal: pendingGoal || this.currentUser()?.goal || 'Travel & Cultural Immersion',
              dailyMinutes: pendingMinutes ? Number(pendingMinutes) : (this.currentUser()?.dailyMinutes || 15),
              startingLevel: pendingLevel || this.currentUser()?.startingLevel || 'A1',
              createdAt: user.created_at || new Date().toISOString()
            };

            this.persistProfile(profile);
            if (pendingLang) this.langService.setLanguage(pendingLang);

            // Clean up transient pending keys
            localStorage.removeItem('POLYGLOT_PENDING_LANG');
            localStorage.removeItem('POLYGLOT_PENDING_GOAL');
            localStorage.removeItem('POLYGLOT_PENDING_MINUTES');
            localStorage.removeItem('POLYGLOT_PENDING_LEVEL');

            // Strip OAuth tokens/codes from URL and replace history entry so Back button never hits them
            if (typeof window !== 'undefined' && (window.location.hash || window.location.search)) {
              window.history.replaceState({ app: true }, '', window.location.pathname);
            }

            // Lock the history entry to ensure pressing Back cannot escape to Google Accounts
            if (typeof window !== 'undefined') {
              window.history.pushState({ app: true }, '', window.location.pathname);
            }

            // Only show the toast on fresh login, NEVER on page refresh / reload
            if (isFreshOAuthCallback) {
              this.toast.show(`Signed in with Google as ${profile.name}!`, 'success');
            }
          }
        });
      }
    }, 100);
  }

  private restoreSession(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const profile: UserProfile = JSON.parse(saved);
        this.currentUser.set(profile);
        if (profile.targetLanguage) {
          this.langService.setLanguage(profile.targetLanguage);
        }
      }
    } catch (err) {
      console.warn('Could not restore user session from localStorage', err);
    }
  }

  public async signInWithEmail(email: string, pass: string): Promise<boolean> {
    this.isLoading.set(true);
    try {
      if (this.supabase.client && this.supabase.isConfigured()) {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
          email: email.trim(),
          password: pass
        });
        if (error) throw error;

        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.['name'] || email.split('@')[0],
          avatar: data.user.user_metadata?.['avatar_url'],
          provider: 'email',
          targetLanguage: this.langService.selectedLanguage().id,
          goal: 'Fluency & Daily Habit',
          dailyMinutes: 15,
          startingLevel: 'A1',
          createdAt: new Date().toISOString()
        };
        this.persistProfile(profile);
        this.toast.show(`Welcome back, ${profile.name}!`, 'success');
        this.isLoading.set(false);
        return true;
      }

      // Offline / Demo fallback
      const profile: UserProfile = {
        id: `demo-${Date.now()}`,
        email: email.trim(),
        name: email.split('@')[0],
        provider: 'email',
        targetLanguage: this.langService.selectedLanguage().id,
        goal: 'Fluency & Daily Habit',
        dailyMinutes: 15,
        startingLevel: 'A1',
        createdAt: new Date().toISOString()
      };
      this.persistProfile(profile);
      this.toast.show(`Signed in as ${profile.name} (Demo Session)`, 'success');
      this.isLoading.set(false);
      return true;
    } catch (err: any) {
      this.isLoading.set(false);
      this.toast.show(err.message || 'Sign in failed. Please check credentials.', 'error');
      return false;
    }
  }

  public async signUpWithEmail(
    email: string,
    pass: string,
    name: string,
    targetLanguage: string,
    goal: string,
    dailyMinutes: number,
    startingLevel: string
  ): Promise<boolean> {
    this.isLoading.set(true);
    try {
      if (this.supabase.client && this.supabase.isConfigured()) {
        const { data, error } = await this.supabase.client.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: { name: name.trim(), targetLanguage, goal, dailyMinutes, startingLevel }
          }
        });
        if (error) throw error;

        const profile: UserProfile = {
          id: data.user?.id || `user-${Date.now()}`,
          email: email.trim(),
          name: name.trim() || email.split('@')[0],
          provider: 'email',
          targetLanguage,
          goal,
          dailyMinutes,
          startingLevel,
          createdAt: new Date().toISOString()
        };
        this.persistProfile(profile);
        this.toast.show(`Profile created! Welcome to PolyglotStudio, ${profile.name}!`, 'success');
        this.isLoading.set(false);
        return true;
      }

      // Offline / Demo registration
      const profile: UserProfile = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        provider: 'email',
        targetLanguage,
        goal,
        dailyMinutes,
        startingLevel,
        createdAt: new Date().toISOString()
      };
      this.persistProfile(profile);
      this.toast.show(`Account created for ${profile.name}!`, 'success');
      this.isLoading.set(false);
      return true;
    } catch (err: any) {
      this.isLoading.set(false);
      this.toast.show(err.message || 'Registration failed.', 'error');
      return false;
    }
  }

  public async signInWithOAuth(
    provider: 'google' | 'github' | 'apple' = 'google',
    metadata?: Partial<UserProfile>
  ): Promise<void> {
    this.isLoading.set(true);
    try {
      // Store pending preferences so they are retained when returning from Google OAuth
      if (metadata) {
        if (metadata.targetLanguage) {
          localStorage.setItem('POLYGLOT_PENDING_LANG', metadata.targetLanguage);
          this.langService.setLanguage(metadata.targetLanguage);
        }
        if (metadata.goal) localStorage.setItem('POLYGLOT_PENDING_GOAL', metadata.goal);
        if (metadata.dailyMinutes) localStorage.setItem('POLYGLOT_PENDING_MINUTES', String(metadata.dailyMinutes));
        if (metadata.startingLevel) localStorage.setItem('POLYGLOT_PENDING_LEVEL', metadata.startingLevel);
      }

      if (this.supabase.client && this.supabase.isConfigured()) {
        const { data, error } = await this.supabase.client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard',
            skipBrowserRedirect: true,
            queryParams: {
              prompt: 'select_account',
              access_type: 'offline'
            }
          }
        });
        if (error) throw error;
        if (data?.url) {
          // Use location.replace() so Google OAuth replaces the onboarding page in session
          // history instead of pushing it. When the user clicks the browser Back button later,
          // the browser will never navigate back to the Google accounts chooser!
          window.location.replace(data.url);
          return;
        }
      }

      // Offline / demo fallback if Supabase client is not connected
      const profile: UserProfile = {
        id: `google-${Date.now().toString().slice(-6)}`,
        email: 'learner@gmail.com',
        name: 'Google Learner',
        avatar: '🌐',
        provider: 'google',
        targetLanguage: metadata?.targetLanguage || this.langService.selectedLanguage().id,
        goal: metadata?.goal || 'Travel & Cultural Immersion',
        dailyMinutes: metadata?.dailyMinutes || 15,
        startingLevel: metadata?.startingLevel || 'A1',
        createdAt: new Date().toISOString()
      };

      this.persistProfile(profile);
      this.toast.show('Signed in with Google Account!', 'success');
      this.isLoading.set(false);
      this.router.navigate(['/curriculum']);
    } catch (err: any) {
      this.isLoading.set(false);
      this.toast.show(err.message || `Could not sign in with ${provider}`, 'error');
    }
  }

  public continueAsGuest(
    targetLanguage: string,
    goal: string,
    dailyMinutes: number,
    startingLevel: string
  ): void {
    const profile: UserProfile = {
      id: `guest-${Date.now().toString().slice(-6)}`,
      email: 'guest@polyglotstudio.local',
      name: 'Polyglot Explorer',
      avatar: '🧑‍🚀',
      provider: 'guest',
      targetLanguage,
      goal,
      dailyMinutes,
      startingLevel,
      createdAt: new Date().toISOString()
    };
    this.persistProfile(profile);
    this.toast.show('Continuing in Guest Mode. Progress saved locally!', 'info');
    this.router.navigate(['/curriculum']);
  }

  private persistProfile(profile: UserProfile): void {
    this.currentUser.set(profile);
    if (profile.targetLanguage) {
      this.langService.setLanguage(profile.targetLanguage);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }

  public signOut(): void {
    if (this.supabase.client && this.supabase.isConfigured()) {
      this.supabase.client.auth.signOut().catch(() => {});
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.currentUser.set(null);
    this.toast.show('Signed out. See you tomorrow for your streak!', 'info');
    this.router.navigate(['/welcome']);
  }

  public async deleteAccount(): Promise<boolean> {
    this.isLoading.set(true);
    try {
      if (this.supabase.client && this.supabase.isConfigured()) {
        try {
          await this.supabase.client.auth.signOut();
        } catch { /* ignored */ }
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('polyglot_user_profile');
        localStorage.removeItem('polyglot_srs_state');
        localStorage.removeItem('POLYGLOT_PENDING_LANG');
        localStorage.removeItem('POLYGLOT_PENDING_GOAL');
        localStorage.removeItem('POLYGLOT_PENDING_MINUTES');
        localStorage.removeItem('POLYGLOT_PENDING_LEVEL');
      }

      this.progress.reset();
      this.currentUser.set(null);
      this.isLoading.set(false);
      this.toast.show('Account and learning data have been permanently deleted.', 'info');
      this.router.navigate(['/welcome']);
      return true;
    } catch (err: any) {
      this.isLoading.set(false);
      this.toast.show(err.message || 'Could not delete account.', 'error');
      return false;
    }
  }
}

