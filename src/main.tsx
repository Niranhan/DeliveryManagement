import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // data considered fresh for 30s — no refetch on quick re-navigation
      retry: 1,                // one retry on failure, not the default 3 (faster failure feedback on bad connections)
      refetchOnWindowFocus: false, // avoid surprise refetches when switching apps on mobile
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);