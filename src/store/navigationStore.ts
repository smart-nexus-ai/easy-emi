import { create } from 'zustand';

export type RouteType = 'home' | 'preview' | 'settings' | 'providers' | 'provider-detail' | 'onboarding';

export interface ViewState {
  route: RouteType;
  params?: Record<string, string>;
}

interface NavigationStore {
  currentView: ViewState;
  history: ViewState[];
  navigateTo: (route: RouteType, params?: Record<string, string>) => void;
  goBack: () => void;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  currentView: { route: 'home' },
  history: [],
  navigateTo: (route, params) => {
    const { currentView, history } = get();
    // Do not push onboarding, since it is a self-contained wizard
    const updatedHistory = [...history, currentView];
    set({
      currentView: { route, params },
      history: updatedHistory,
    });
  },
  goBack: () => {
    const { history } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      currentView: previous,
      history: history.slice(0, -1),
    });
  },
}));
