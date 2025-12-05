import React, { lazy, Suspense } from 'react';
import { GhostArchiveProvider } from '../../contexts/GhostArchiveContext';
import LoadingFallback from '../common/LoadingFallback';
import ErrorBoundary from '../common/ErrorBoundary';

// Lazy load TarotReader component for better performance
// Requirement: 1.6
const TarotReader = lazy(() => import('./TarotReader'));

const TerminalTarot: React.FC = () => {
  return (
    <GhostArchiveProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Consulting the cards..." />}>
          <TarotReader />
        </Suspense>
      </ErrorBoundary>
    </GhostArchiveProvider>
  );
};

export default TerminalTarot;
