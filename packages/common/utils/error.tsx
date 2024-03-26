/* eslint-disable react/display-name */
import React, { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div>
    <p>Error</p>
    {error.message && <span>message: {error.message}</span>}
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

function withErrorBoundaryCustom<T>(ChildComp: React.FC<T>) {
  const errorBoundaryProps = {
    FallbackComponent: ErrorFallback,
    onError: (error: Error, info: ErrorInfo) => {
      console.error(error);
      console.log(info.componentStack);
    },
  };

  return (props: React.JSX.IntrinsicAttributes & T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <ChildComp {...props} />
    </ErrorBoundary>
  );
}

export { withErrorBoundaryCustom };
