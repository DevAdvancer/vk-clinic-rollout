import { Activity } from 'lucide-react';

export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true"><Activity size={22} /></span>
      <span><strong>VK Digital Health</strong><small>CLINIC FLEET</small></span>
    </span>
  );
}
