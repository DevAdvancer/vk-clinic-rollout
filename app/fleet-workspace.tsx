'use client';

import Image from 'next/image';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, Check, ChevronDown, ChevronRight, CircleAlert, CircleCheck, Clock3, Cpu, FlaskConical, LayoutGrid, MapPin, Plus, Radio, RotateCcw, Search, Signal, Target, WifiOff, X } from 'lucide-react';
import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Brand } from './brand';
import { type Chair, type Connection, type Fleet, type Incident, connectionLabel, demoChairId, phases, recordEvent, rolloutTarget, sampleFleet, siteById, sites } from './fleet-data';

const views = [
  { id: 'fleet', label: 'Fleet overview', Icon: LayoutGrid },
  { id: 'rollout', label: 'Clinic rollout', Icon: MapPin },
  { id: 'service', label: 'Service queue', Icon: BellRing },
] as const;

type View = (typeof views)[number]['id'];
const workspaceKey = 'vk-clinic-fleet-workspace-v1';
const regions = ['West', 'Central', 'East'];
const number = new Intl.NumberFormat('en-US');
const eventTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'green' | 'amber' | 'neutral' | 'blue' }) {
  return <span className={`tag ${tone}`}><i />{children}</span>;
}

function ChairStatus({ state }: { state: Connection }) {
  return <Tag tone={state === 'online' ? 'green' : state === 'offline' ? 'amber' : 'neutral'}>{connectionLabel[state]}</Tag>;
}

function IncidentStatus({ state }: { state: Incident['state'] }) {
  return <Tag tone={state === 'Resolved' ? 'green' : state === 'Acknowledged' ? 'blue' : 'amber'}>{state}</Tag>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => { dialog.current?.showModal(); }, []);

  return (
    <dialog ref={dialog} className="modal" aria-labelledby="modal-title" onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="modal-content">
        <button type="button" className="icon-button modal-close" onClick={() => dialog.current?.close()} aria-label="Close dialog"><X size={20} /></button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

function ActivateChair({ pending, firstId, onClose, onActivate }: { pending: Chair[]; firstId: string; onClose: () => void; onActivate: (chair: Chair) => void }) {
  const initialChair = pending.find((chair) => chair.id === firstId) ?? pending[0];
  const [id, setId] = useState(initialChair.id);
  const [serial, setSerial] = useState(initialChair.id);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const chair = pending.find((item) => item.id === id) ?? initialChair;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (serial.trim().toUpperCase() !== chair.id) {
      setError('This chair ID does not match the selected clinic.');
      return;
    }
    if (verified) onActivate(chair);
    else setVerified(true);
  }

  return (
    <Modal title="Activate a chair" onClose={onClose}>
      <p>Match the chair to its clinic and verify its first heartbeat.</p>
      <form className="activation-form" onSubmit={submit}>
        <label>Clinic<select value={chair.id} onChange={(event) => { setId(event.target.value); setSerial(event.target.value); setVerified(false); setError(''); }}>
          {pending.map((item) => <option key={item.id} value={item.id}>{siteById[item.site].name}</option>)}
        </select></label>
        <label>Chair ID<input required value={serial} onChange={(event) => { setSerial(event.target.value); setVerified(false); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'activation-error' : undefined} /></label>
        {error && <p id="activation-error" className="form-error" role="alert">{error}</p>}
        {verified && <p className="verified" role="status"><CircleCheck size={17} /> Simulated heartbeat verified for {chair.id}.</p>}
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="submit" className="button primary">{verified ? 'Confirm activation' : 'Verify chair'} <ArrowRight size={16} /></button></div>
      </form>
    </Modal>
  );
}

function DeviceEvents({ chair }: { chair: Chair }) {
  return (
    <ol className="events" aria-label="Device event history">
      {chair.events.slice(0, 5).map((event, index) => <li key={index}><span /> <strong>{event.label}</strong><time>{event.time}</time></li>)}
    </ol>
  );
}

const heartbeat = [21, 32, 28, 46, 35, 53, 40, 73, 61, 44, 66, 87, 65, 77, 52, 69, 92, 74, 89, 66, 88, 70, 83, 73, 88, 70, 76, 89];

function DevicePanel({ chair, incident, onActivate, onIncident }: { chair: Chair; incident?: Incident; onActivate: () => void; onIncident: (id: string) => void }) {
  return (
    <aside className="panel device-panel" id="chair-details" aria-label="Selected chair" tabIndex={-1}>
      <div className="panel-top"><h2>Chair details</h2><Cpu size={18} /></div>
      <div className="chair-art"><Image src="/smart-chair-concept.webp" alt="Concept render of a smart clinic chair" width={220} height={147} loading="eager" /><small>CHAIR CONCEPT</small></div>
      <div className="device-info" key={chair.id}>
        <div className="device-title"><h3>{chair.id}</h3><ChairStatus state={chair.state} /></div>
        <p className="device-location"><MapPin size={14} /> {siteById[chair.site].name}</p>
        {chair.state === 'pending' ? (
          <button type="button" className="button primary device-action" onClick={onActivate}>Activate this chair <ArrowRight size={15} /></button>
        ) : (
          <div className="signal-chart">
            <div><Signal size={14} /> Simulated heartbeat</div>
            <div className={`signal-bars ${chair.state}`} aria-hidden="true">{heartbeat.map((height, index) => <i key={index} style={{ '--height': `${chair.state === 'offline' && index > 15 ? 8 : height}%`, '--delay': `${index * 15}ms` } as CSSProperties} />)}</div>
          </div>
        )}
        {incident && <button type="button" className="text-button incident-link" onClick={() => onIncident(incident.id)}>View {incident.id} <ArrowUpRight size={14} /></button>}
        <p className="small-label section-label">Recent events</p>
        <DeviceEvents chair={chair} />
      </div>
    </aside>
  );
}

export function FleetWorkspace() {
  const [fleet, setFleet] = useState<Fleet>(sampleFleet);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>('fleet');
  const [chairId, setChairId] = useState(demoChairId);
  const [incidentId, setIncidentId] = useState('INC-001');
  const [incidentFilter, setIncidentFilter] = useState<'Active' | 'Resolved' | 'All'>('Active');
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All regions');
  const [wave, setWave] = useState('All waves');
  const [activation, setActivation] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(workspaceKey);
      if (saved) {
        const snapshot: Fleet = JSON.parse(saved);
        if (sampleFleet.chairs.every((chair) => snapshot.chairs?.some((item) => item.id === chair.id)) && Array.isArray(snapshot.incidents)) setFleet(snapshot);
      }
    } catch { /* The workspace can run without browser storage. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(workspaceKey, JSON.stringify(fleet)); } catch { /* Storage may be disabled. */ }
  }, [fleet, loaded]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const pending = fleet.chairs.filter((chair) => chair.state === 'pending');
  const online = fleet.chairs.filter((chair) => chair.state === 'online').length;
  const activeIncidents = fleet.incidents.filter((incident) => incident.state !== 'Resolved');
  const demoChair = fleet.chairs.find((chair) => chair.id === demoChairId)!;
  const matched = fleet.chairs.filter((chair) => {
    const site = siteById[chair.site];
    return (region === 'All regions' || site.region === region) && `${chair.id} ${site.name} ${site.city}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const selectedChair = matched.find((chair) => chair.id === chairId) ?? matched[0];
  const matchingIncidents = fleet.incidents.filter((incident) => incidentFilter === 'All' || (incidentFilter === 'Resolved' ? incident.state === 'Resolved' : incident.state !== 'Resolved'));
  const selectedIncident = matchingIncidents.find((incident) => incident.id === incidentId) ?? matchingIncidents[0];
  const incidentChair = selectedIncident && fleet.chairs.find((chair) => chair.id === selectedIncident.chairId);

  function navigate(next: View) {
    setView(next);
    window.scrollTo({ top: 0 });
  }

  function selectChair(id: string) {
    setChairId(id);
    if (window.matchMedia('(max-width: 630px)').matches) document.getElementById('chair-details')?.focus();
  }

  function openIncident(id: string) {
    setIncidentId(id);
    setIncidentFilter('Active');
    navigate('service');
  }

  function activate(chair: Chair) {
    const site = siteById[chair.site];
    const time = eventTime();
    setFleet((current) => recordEvent(current, chair.id, 'online', `Chair activated at ${site.name}`, time));
    setChairId(chair.id);
    setSearch('');
    setRegion('All regions');
    setActivation(null);
    setNotice(`${chair.id} is online at ${site.name}.`);
  }

  function simulateOutage() {
    const id = `INC-${String(fleet.incidents.length + 1).padStart(3, '0')}`;
    const time = eventTime();
    setFleet((current) => {
      const updated = recordEvent(current, demoChairId, 'offline', 'Heartbeat interrupted', time);
      if (current.incidents.some((incident) => incident.chairId === demoChairId && incident.state !== 'Resolved')) return updated;
      return { ...updated, incidents: [{ id, chairId: demoChairId, state: 'Open', opened: time }, ...updated.incidents] };
    });
    const existing = activeIncidents.find((incident) => incident.chairId === demoChairId);
    setDemo(false);
    openIncident(existing?.id ?? id);
    setNotice('VK-001 is offline. The incident is in the service queue.');
  }

  function reconnect(chair: Chair) {
    const time = eventTime();
    setFleet((current) => recordEvent(current, chair.id, 'online', 'Heartbeat restored', time));
    setNotice(`${chair.id} is back online. The incident can now be resolved.`);
  }

  function updateIncident(incident: Incident, chair: Chair, state: 'Acknowledged' | 'Resolved') {
    if (state === 'Resolved' && chair.state !== 'online') return;
    const time = eventTime();
    const label = `${incident.id} ${state.toLowerCase()}`;
    setFleet((current) => ({
      ...recordEvent(current, chair.id, chair.state, label, time),
      incidents: current.incidents.map((item) => item.id === incident.id ? { ...item, state } : item),
    }));
    if (state === 'Resolved') setIncidentFilter('Resolved');
    setNotice(`${label}.`);
  }

  function reset() {
    setFleet(sampleFleet);
    setChairId(demoChairId);
    setIncidentId('INC-001');
    setIncidentFilter('Active');
    setSearch('');
    setRegion('All regions');
    setWave('All waves');
    setDemo(false);
    navigate('fleet');
    setNotice('Sample workspace reset.');
  }

  return (
    <div className="workspace">
      <a className="skip" href="#workspace-content">Skip to workspace</a>
      <aside className="rail">
        <button type="button" className="brand-link" onClick={() => navigate('fleet')} aria-label="VK Digital Health Clinic Fleet home"><Brand /></button>
        <nav aria-label="Workspace navigation">
          <p className="small-label">Operations</p>
          {views.map(({ id, label, Icon }) => <button type="button" key={id} aria-current={view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} /><span>{label}</span>{id === 'service' && activeIncidents.length > 0 && <small>{activeIncidents.length}</small>}</button>)}
        </nav>
        <div className="rail-footer"><span className="rail-dot" /><div>Prototype workspace<small>Prepared by SilverSpace Technologies</small></div></div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb"><span>Operations</span><ChevronRight size={14} /><strong>{views.find((item) => item.id === view)?.label}</strong></div>
          <div className="topbar-actions"><Tag tone="blue">Simulated data</Tag><button className="button secondary" type="button" onClick={() => setDemo(true)}><FlaskConical size={16} /> Demo controls</button></div>
        </header>

        <main className="workspace-content" id="workspace-content" tabIndex={-1}>
          {view === 'fleet' && (
            <section className="view" aria-labelledby="fleet-title">
              <div className="view-heading"><div><p className="small-label heading-label"><Activity size={15} /> SMART CHAIR OPERATIONS</p><h1 id="fleet-title">Fleet overview</h1><p>See which chairs are online, which clinics are ready, and where support is needed.</p></div>
                <button type="button" className="button primary" disabled={!pending.length} onClick={() => setActivation('')}><Plus size={17} /> Activate a chair</button></div>

              <div className="metrics">
                <div className="metric"><span className="metric-icon green"><Activity size={19} /></span><p>Online chairs</p><strong>{online}<small> / {fleet.chairs.length}</small></strong></div>
                <div className="metric"><span className="metric-icon amber"><CircleAlert size={19} /></span><p>Open incidents</p><strong>{activeIncidents.length}</strong></div>
                <div className="metric"><span className="metric-icon blue"><MapPin size={19} /></span><p>Activated sample sites</p><strong>{sites.length - pending.length}<small> / {sites.length}</small></strong></div>
                <div className="metric target"><span className="metric-icon blue"><Target size={19} /></span><p>Deployment target</p><strong>{number.format(rolloutTarget)}<small> sites</small></strong></div>
              </div>

              <div className="fleet-grid">
                <section className="panel inventory" aria-labelledby="inventory-title">
                  <div className="panel-top"><div><h2 id="inventory-title">Chair inventory</h2><p>{matched.length} {matched.length === 1 ? 'chair' : 'chairs'} in view</p></div><span className="panel-icon"><Cpu size={18} /></span></div>
                  <div className="toolbar">
                    <label className="search"><Search size={16} /><span className="sr-only">Search chairs</span><input type="search" placeholder="Search by chair or clinic" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
                    <label className="select"><span className="sr-only">Filter by region</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option>{regions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
                  </div>
                  <div className="table-head" aria-hidden="true"><span>Chair / Clinic</span><span>Region</span><span>Connection</span></div>
                  {matched.length === 0 && <p className="empty">No chairs match your search.</p>}
                  {matched.map((chair) => {
                    const site = siteById[chair.site];
                    return <button type="button" key={chair.id} className="chair-row" aria-pressed={selectedChair?.id === chair.id} onClick={() => selectChair(chair.id)}>
                      <span className="row-name"><span className="row-icon"><Cpu size={16} /></span><span><strong>{chair.id}</strong><small>{site.name}</small></span></span>
                      <span className="row-region">{site.region}</span><span className="row-end"><ChairStatus state={chair.state} /><ChevronRight size={16} /></span>
                    </button>;
                  })}
                </section>
                {selectedChair && <DevicePanel chair={selectedChair} incident={activeIncidents.find((incident) => incident.chairId === selectedChair.id)} onActivate={() => setActivation(selectedChair.id)} onIncident={openIncident} />}
              </div>
            </section>
          )}

          {view === 'rollout' && (
            <section className="view" aria-labelledby="rollout-title">
              <div className="view-heading"><div><p className="small-label heading-label"><MapPin size={15} /> SITE ACTIVATION</p><h1 id="rollout-title">Clinic rollout</h1><p>Track activation through the January Las Vegas demo, clinic pilot, and regional waves.</p></div><button type="button" className="button primary" disabled={!pending.length} onClick={() => setActivation('')}><Plus size={17} /> Activate a chair</button></div>
              <div className="wave-grid">{phases.map((phase) => {
                const batch = sites.filter((site) => site.wave === phase.name);
                const activated = batch.filter((site) => !pending.some((chair) => chair.site === site.id)).length;
                return <article className="panel wave-card" key={phase.name}><div><h2>{phase.name}</h2><Tag tone={activated === batch.length ? 'green' : 'blue'}>{activated === batch.length ? 'Complete' : 'In progress'}</Tag></div><p>{phase.detail}</p><progress value={activated} max={batch.length} aria-label={`${phase.name} sites activated`} /><small>{activated} of {batch.length} sample sites activated</small></article>;
              })}</div>
              <section className="panel site-list" aria-labelledby="sites-title">
                <div className="panel-top"><div><h2 id="sites-title">Clinic locations</h2><p>Readiness for the sample rollout</p></div><label className="select"><span className="sr-only">Filter by rollout wave</span><select value={wave} onChange={(event) => setWave(event.target.value)}><option>All waves</option>{phases.map((phase) => <option key={phase.name}>{phase.name}</option>)}</select><ChevronDown size={14} /></label></div>
                {sites.filter((site) => wave === 'All waves' || site.wave === wave).map((site) => {
                  const chair = fleet.chairs.find((item) => item.site === site.id)!;
                  return <div className="site-row" key={site.id}><span className="row-name"><span className="row-icon"><MapPin size={17} /></span><span><strong>{site.name}</strong><small>{site.city} · {site.wave}</small></span></span><Tag tone={chair.state === 'pending' ? 'neutral' : 'green'}>{chair.state === 'pending' ? 'Ready to activate' : 'Activated'}</Tag>
                    {chair.state === 'pending' ? <button type="button" className="button secondary" aria-label={`Activate chair at ${site.name}`} onClick={() => setActivation(chair.id)}>Activate <ArrowRight size={15} /></button> : <button type="button" className="button secondary" aria-label={`View chair at ${site.name}`} onClick={() => { setSearch(''); setRegion('All regions'); setChairId(chair.id); navigate('fleet'); }}>View chair <ArrowRight size={15} /></button>}
                  </div>;
                })}
              </section>
            </section>
          )}

          {view === 'service' && (
            <section className="view" aria-labelledby="service-title">
              <div className="view-heading"><div><p className="small-label heading-label"><BellRing size={15} /> DEVICE SUPPORT</p><h1 id="service-title">Service queue</h1><p>Investigate interruptions, confirm a restored heartbeat, and close the incident.</p></div><Tag tone={activeIncidents.length ? 'amber' : 'green'}>{activeIncidents.length} open {activeIncidents.length === 1 ? 'incident' : 'incidents'}</Tag></div>
              <div className="service-grid">
                <section className="panel incident-list" aria-label="Incidents">
                  <div className="panel-top"><h2>Incidents</h2><div className="segmented" aria-label="Filter incidents">{(['Active', 'Resolved', 'All'] as const).map((filter) => <button type="button" key={filter} aria-pressed={incidentFilter === filter} onClick={() => setIncidentFilter(filter)}>{filter}</button>)}</div></div>
                  {matchingIncidents.length === 0 && <p className="empty">No {incidentFilter === 'All' ? '' : `${incidentFilter.toLowerCase()} `}incidents in the queue.</p>}
                  {matchingIncidents.map((incident) => {
                    const chair = fleet.chairs.find((item) => item.id === incident.chairId)!;
                    return <button type="button" className="incident-row" key={incident.id} aria-pressed={incident.id === selectedIncident?.id} onClick={() => setIncidentId(incident.id)}><span className="row-name"><span className="row-icon"><BellRing size={16} /></span><span><strong>{incident.id} · Heartbeat interrupted</strong><small>{siteById[chair.site].name} · {chair.id}</small></span></span><IncidentStatus state={incident.state} /></button>;
                  })}
                </section>
                {selectedIncident && incidentChair && <section className="panel incident-detail" aria-label="Incident details" key={selectedIncident.id}>
                  <div className="panel-top"><div><p className="small-label">{selectedIncident.id}</p><h2>Heartbeat interrupted</h2></div><IncidentStatus state={selectedIncident.state} /></div>
                  <div className="incident-body">
                    <div className="incident-meta"><span><MapPin size={15} /> {siteById[incidentChair.site].name}</span><span><Cpu size={15} /> {incidentChair.id}</span><span><Clock3 size={15} /> Opened {selectedIncident.opened}</span><ChairStatus state={incidentChair.state} /></div>
                    {selectedIncident.state !== 'Resolved' && <><p>{incidentChair.state === 'offline' ? 'The device has stopped sending heartbeats. Verify connectivity before closing the incident.' : 'The chair is sending heartbeats again. The incident can be closed.'}</p><div className="incident-actions">
                      {selectedIncident.state === 'Open' && <button className="button secondary" type="button" onClick={() => updateIncident(selectedIncident, incidentChair, 'Acknowledged')}><Check size={16} /> Acknowledge</button>}
                      <button className="button primary" type="button" disabled={incidentChair.state === 'offline'} onClick={() => updateIncident(selectedIncident, incidentChair, 'Resolved')}><CircleCheck size={16} /> Resolve incident</button>
                    </div>
                    {incidentChair.state === 'offline' && <button type="button" className="text-button reconnect" onClick={() => reconnect(incidentChair)}><Radio size={15} /> Simulate reconnection</button>}</>}
                    <p className="small-label section-label">Recent device events</p><DeviceEvents chair={incidentChair} />
                  </div>
                </section>}
              </div>
            </section>
          )}
          <footer className="mobile-credit">Prepared by SilverSpace Technologies</footer>
        </main>
      </div>

      {activation !== null && pending.length > 0 && <ActivateChair pending={pending} firstId={activation} onClose={() => setActivation(null)} onActivate={activate} />}
      {demo && <Modal title="Demo controls" onClose={() => setDemo(false)}>
        <p>Send a simulated device event from the Las Vegas Demo Lab. Reset the workspace to run the walkthrough again.</p>
        <div className="demo-device"><span className="row-icon"><Cpu size={16} /></span><strong>VK-001</strong><ChairStatus state={demoChair.state} /></div>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={reset}><RotateCcw size={15} /> Reset workspace</button>
          {demoChair.state === 'offline' ? <button type="button" className="button primary" onClick={() => { reconnect(demoChair); setDemo(false); }}><Radio size={16} /> Simulate reconnection</button> : <button type="button" className="button primary" onClick={simulateOutage}><WifiOff size={16} /> Simulate outage</button>}</div>
      </Modal>}
      <div className="toast-region" role="status">{notice && <div className="toast"><span><ArrowDownRight size={16} /></span>{notice}<button type="button" className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={17} /></button></div>}</div>
    </div>
  );
}
