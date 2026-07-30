/**
 * T078: app entry point. Wires TanStack Query (request dedupe/caching so back/forward
 * navigation doesn't refetch) and the router.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import './styles/tokens.css';
import './styles/global.css';
import './styles/utilities.css';
import './styles/support.css';
import './styles/tables.css';
import './styles/layout.css';
import './styles/forms.css';
import './styles/components.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
