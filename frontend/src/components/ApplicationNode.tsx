import { useRef, useEffect } from 'react';
import type { Application, SelectionState } from '../types';

interface Props {
  app: Application;
  selection: SelectionState;
  onToggleApp: (appId: number) => void;
  onToggleCapability: (capId: number) => void;
}

export function ApplicationNode({ app, selection, onToggleApp, onToggleCapability }: Props) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Calculate checkbox state
  const selectedCaps = app.capabilities.filter(cap => selection.capabilities.has(cap.id));
  const allSelected = app.capabilities.length > 0 && selectedCaps.length === app.capabilities.length;
  const someSelected = selectedCaps.length > 0 && !allSelected;

  // Set indeterminate state (can only be done via ref)
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <li className="tree-app">
      <div className="tree-app-header" onClick={() => onToggleApp(app.id)}>
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={allSelected}
          onChange={() => onToggleApp(app.id)}
          onClick={e => e.stopPropagation()}
        />
        <span className="tree-app-name">{app.name}</span>
        {app.description && (
          <span className="tree-app-desc">{app.description}</span>
        )}
      </div>

      {app.capabilities.length > 0 && (
        <ul className="tree-capabilities">
          {app.capabilities.map(cap => (
            <li key={cap.id} className="tree-capability">
              <input
                type="checkbox"
                checked={selection.capabilities.has(cap.id)}
                onChange={() => onToggleCapability(cap.id)}
              />
              <span className="tree-capability-name">{cap.name}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
