export type Connection = 'online' | 'offline' | 'pending';
export type IncidentStatus = 'Open' | 'Acknowledged' | 'Resolved';

export type Chair = {
  id: string;
  site: string;
  state: Connection;
  events: { label: string; time: string }[];
};

export type Incident = {
  id: string;
  chairId: string;
  state: IncidentStatus;
  opened: string;
};

export type Fleet = { chairs: Chair[]; incidents: Incident[] };

export const rolloutTarget = 2500;
export const demoChairId = 'VK-001';
export const sites = [
  { id: 'LAS', name: 'Las Vegas Demo Lab', city: 'Las Vegas, NV', region: 'West', wave: 'January demo' },
  { id: 'MES', name: 'Mesa Creek Clinic', city: 'Mesa, AZ', region: 'West', wave: 'Pilot' },
  { id: 'HIL', name: 'Hillstone Health', city: 'Austin, TX', region: 'Central', wave: 'Pilot' },
  { id: 'NOR', name: 'Northline Care', city: 'Denver, CO', region: 'Central', wave: 'Wave 1' },
  { id: 'BEA', name: 'Beacon Grove Clinic', city: 'Raleigh, NC', region: 'East', wave: 'Wave 1' },
  { id: 'HAR', name: 'Harbor Point Care', city: 'Boston, MA', region: 'East', wave: 'Wave 1' },
  { id: 'CED', name: 'Cedar Valley Clinic', city: 'Portland, OR', region: 'West', wave: 'Wave 1' },
] as const;

export type Site = (typeof sites)[number];
export const siteById: Record<string, Site> = Object.fromEntries(sites.map((site) => [site.id, site]));

export const phases = [
  { name: 'January demo', detail: 'Validate the chair-to-console workflow in Las Vegas.' },
  { name: 'Pilot', detail: 'Verify installation and support at two sample clinics.' },
  { name: 'Wave 1', detail: 'Use the same activation workflow across the first regional batch.' },
] as const;

export const connectionLabel: Record<Connection, string> = {
  online: 'Online',
  offline: 'Offline',
  pending: 'Awaiting activation',
};

export const sampleFleet: Fleet = {
  chairs: [
    { id: demoChairId, site: 'LAS', state: 'online', events: [{ label: 'Heartbeat received', time: '09:42' }, { label: 'Chair activated at Las Vegas Demo Lab', time: '09:12' }] },
    { id: 'VK-002', site: 'MES', state: 'online', events: [{ label: 'Heartbeat received', time: '09:41' }] },
    { id: 'VK-003', site: 'HIL', state: 'offline', events: [{ label: 'Heartbeat interrupted', time: '09:26' }, { label: 'Chair activated at Hillstone Health', time: '08:54' }] },
    { id: 'VK-004', site: 'NOR', state: 'online', events: [{ label: 'Heartbeat received', time: '09:40' }] },
    { id: 'VK-005', site: 'BEA', state: 'pending', events: [{ label: 'Chair assigned to Beacon Grove Clinic', time: '09:15' }] },
    { id: 'VK-006', site: 'HAR', state: 'online', events: [{ label: 'Heartbeat received', time: '09:43' }] },
    { id: 'VK-007', site: 'CED', state: 'pending', events: [{ label: 'Chair assigned to Cedar Valley Clinic', time: '09:15' }] },
  ],
  incidents: [{ id: 'INC-001', chairId: 'VK-003', state: 'Open', opened: '09:26' }],
};

export function recordEvent(fleet: Fleet, id: string, state: Connection, label: string, time: string): Fleet {
  return {
    ...fleet,
    chairs: fleet.chairs.map((chair) => chair.id === id ? { ...chair, state, events: [{ label, time }, ...chair.events] } : chair),
  };
}
