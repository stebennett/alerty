import type { Application, SelectionState } from '../types';
import { ApplicationNode } from './ApplicationNode';

interface Props {
  applications: Application[];
  selection: SelectionState;
  onToggleApp: (appId: number) => void;
  onToggleCapability: (capId: number) => void;
}

export function ApplicationTree({ applications, selection, onToggleApp, onToggleCapability }: Props) {
  if (applications.length === 0) {
    return (
      <div className="card">
        <p>No applications configured. Go to Admin to add applications.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Select Applications / Capabilities</h2>
      <ul className="tree">
        {applications.map(app => (
          <ApplicationNode
            key={app.id}
            app={app}
            selection={selection}
            onToggleApp={onToggleApp}
            onToggleCapability={onToggleCapability}
          />
        ))}
      </ul>
    </div>
  );
}
