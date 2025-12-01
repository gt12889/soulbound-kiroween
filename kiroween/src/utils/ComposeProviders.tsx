import React from 'react';
import type { ReactNode } from 'react';

/**
 * Type for a React context provider component
 */
type ProviderComponent = React.ComponentType<{ children: ReactNode }>;

interface ComposeProvidersProps {
  providers: ProviderComponent[];
  children: ReactNode;
}

/**
 * Utility component to compose multiple context providers
 * Reduces nesting and improves readability when using many providers
 * 
 * @example
 * ```tsx
 * <ComposeProviders
 *   providers={[
 *     AuthProvider,
 *     ThemeProvider,
 *     ToastProvider,
 *   ]}
 * >
 *   <App />
 * </ComposeProviders>
 * ```
 * 
 * This is equivalent to:
 * ```tsx
 * <AuthProvider>
 *   <ThemeProvider>
 *     <ToastProvider>
 *       <App />
 *     </ToastProvider>
 *   </ThemeProvider>
 * </AuthProvider>
 * ```
 */
export const ComposeProviders: React.FC<ComposeProvidersProps> = ({
  providers,
  children,
}) => {
  return providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );
};

export default ComposeProviders;

