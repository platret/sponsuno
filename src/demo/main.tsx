import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DemoApp from './DemoApp';
import { DemoProvider } from './store';
import { ToastProvider } from './ui';
import './demo.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing in demo/index.html');

createRoot(root).render(
  <StrictMode>
    <DemoProvider>
      <ToastProvider>
        <DemoApp />
      </ToastProvider>
    </DemoProvider>
  </StrictMode>,
);
