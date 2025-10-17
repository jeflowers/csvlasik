import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
}

function Wrapper({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };
