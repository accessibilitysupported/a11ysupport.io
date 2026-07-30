/**
 * T077: route table. `/tests/html/*` is intentionally excluded — that path resolves to the
 * static fixture mount (server/app.ts), never the client router (plan.md's route-ordering
 * hazard).
 */
import { createBrowserRouter } from 'react-router';
import { Layout } from './layout/Layout';
import { HomePage } from './pages/HomePage';
import { TechIndexPage } from './pages/TechIndexPage';
import { TechPage } from './pages/TechPage';
import { FeaturePage } from './pages/FeaturePage';
import { TestsPage } from './pages/TestsPage';
import { TestCasePage } from './pages/TestCasePage';
import { TestCaseRunPage } from './pages/TestCaseRunPage';
import { SupportPointPage } from './pages/SupportPointPage';
import { RunTestsPage } from './pages/RunTestsPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { CommandsPage } from './pages/CommandsPage';
import { LearnAtPage } from './pages/LearnAtPage';
import { StaticPage } from './pages/StaticPage';
import { ErrorPage } from './pages/ErrorPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tech', element: <TechIndexPage /> },
      { path: '/tech/:techId', element: <TechPage /> },
      { path: '/tech/:techId/:featureId', element: <FeaturePage /> },
      { path: '/tests', element: <TestsPage /> },
      { path: '/tests/:testId', element: <TestCasePage /> },
      { path: '/tests/:testId/run', element: <TestCaseRunPage /> },
      { path: '/tests/:testId/:featureId/:assertionId/:atId/:browserId', element: <SupportPointPage /> },
      { path: '/run-tests', element: <RunTestsPage /> },
      { path: '/updates', element: <UpdatesPage /> },
      { path: '/learn/commands', element: <CommandsPage /> },
      { path: '/learn/at/:id', element: <LearnAtPage /> },
      { path: '/faq', element: <StaticPage slug="faq" /> },
      { path: '/contribute', element: <StaticPage slug="contribute" /> },
      { path: '/learn', element: <StaticPage slug="learn" /> },
      { path: '/learn/vc_differences', element: <StaticPage slug="vc_differences" /> },
      { path: '*', element: <ErrorPage /> },
    ],
  },
]);
