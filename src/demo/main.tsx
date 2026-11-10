import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts (no request to Google): only the CD weights
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import DemoApp from './DemoApp';
import { clearStoredDemo, DemoProvider } from './store';
import { ToastProvider } from './ui';
import './demo.css';

/** Last resort if a view crashes (e.g. unexpected stored data): offers a reset instead of a blank page. */
class DemoErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  reset = () => {
    clearStoredDemo();
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="demo">
        <div className="demo-banner" role="note"><p><strong>Vorschau mit Beispieldaten.</strong></p></div>
        <main className="demo-main">
          <div className="ui-empty" role="alert">
            <p className="ui-empty-title">Diese Ansicht konnte nicht geladen werden</p>
            <p>Vermutlich passen die in diesem Browser gespeicherten Daten nicht zu dieser Version. Setzen Sie die Vorschau zurück, um mit den Beispieldaten neu zu beginnen.</p>
            <button type="button" className="ui-btn ui-btn-navy ui-btn-md" onClick={this.reset}>Vorschau zurücksetzen</button>
          </div>
        </main>
      </div>
    );
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('#root missing in demo/index.html');

createRoot(root).render(
  <StrictMode>
    <DemoErrorBoundary>
      <DemoProvider>
        <ToastProvider>
          <DemoApp />
        </ToastProvider>
      </DemoProvider>
    </DemoErrorBoundary>
  </StrictMode>,
);
