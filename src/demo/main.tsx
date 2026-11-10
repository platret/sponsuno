import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import DemoApp, { preloadView } from './DemoApp';
import { parseHash } from './router';
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

const render = () => createRoot(root).render(
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

// First the chunk of the view the URL opens (the route DemoApp renders first), then one render with shell and view.
// If the chunk fails to load, render anyway: the view then suspends and retries, or the error boundary takes over.
preloadView(parseHash(window.location.hash).name).then(render, render);
