"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

type Role = "student" | "teacher" | "sac";

type LocationType = "LA1" | "LA2" | "DTS" | "STS" | "Football1" | "Football2";

type RequestStatus = "Pending" | "Approved" | "Rejected";

type SacRequest = {
  id: string;
  requesterEmail: string;
  requesterName?: string;
  location: LocationType;
  capacity?: number;
  purpose: string;
  start: string; // ISO
  end: string; // ISO
  status: RequestStatus;
  createdAt: string;
  isSpecial?: boolean;
  specialDetails?: string;
};

const STORAGE_KEY = "sac_requests_v1";

function loadRequests(): SacRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SacRequest[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

function saveRequests(reqs: SacRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

// format date as DD/MM/YYYY HH:MM for consistent display
function formatDateDMY(input: string | Date | null | undefined) {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SacPermissionPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [requests, setRequests] = useState<SacRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setRequests(loadRequests());
    setLoading(false);
  }, []);

  const role: Role = useMemo(() => {
    if (!session) return "student";
    const u: any = session.user as any;
    if (u.role === "teacher") return "teacher";
    if (u.isSACMember || (Array.isArray(u.roles) && u.roles.includes("SAC"))) return "sac";
    if (u.role === "sac") return "sac";
    return "student";
  }, [session]);

  useEffect(() => {
    if (!loading) saveRequests(requests);
  }, [requests, loading]);

  if (isPending) return <div className="p-6">Loading...</div>;
  if (!session) return <div className="p-6">You must be signed in to use SAC Permission.</div>;

  const email = session.user.email || "unknown";
  const name = (session.user as any).name as string | undefined;

  // Student view
  if (role === "student") {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">SAC Permission</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Make a Request</CardTitle>
            <CardDescription>Book LA1/LA2, DTS, STS or Football grounds</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestForm
              existingRequests={requests}
              onCreate={(r) => setRequests((s) => [r, ...s])}
              requesterEmail={email}
              requesterName={name}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>History of requests you made</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentRequestList
              requests={requests.filter((x) => x.requesterEmail === email)}
              onCancel={(id) => setRequests((s) => s.filter((r) => r.id !== id))}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Teacher / SAC view: show incoming requests and allow approve/reject/edit
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">SAC Permission - Incoming Requests</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Requests</CardTitle>
          <CardDescription>Approve, reject or edit requests</CardDescription>
        </CardHeader>
        <CardContent>
          <ManagerRequestList
            requests={requests}
            onUpdate={(next) => setRequests(next)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function RequestForm({ existingRequests, onCreate, requesterEmail, requesterName }: {
  existingRequests: SacRequest[];
  onCreate: (r: SacRequest) => void;
  requesterEmail: string;
  requesterName?: string;
}) {
  const [location, setLocation] = useState<LocationType>("LA1");
  const [capacity, setCapacity] = useState<number | undefined>(undefined);
  const [purpose, setPurpose] = useState("");

  const [startDate, setStartDate] = useState(""); // DD/MM/YYYY input kept as ISO date input value (YYYY-MM-DD)
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [duration, setDuration] = useState<string>("60"); // minutes or 'custom'
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialDetails, setSpecialDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (location === "LA1" || location === "LA2") {
      setCapacity((c) => c ?? 10);
    } else {
      setCapacity(undefined);
    }
  }, [location]);

  // helper to combine date + time to ISO string
  const combine = (d: string, t: string) => {
    if (!d || !t) return "";
    const dt = new Date(`${d}T${t}`);
    return dt.toISOString();
  };

  // when start date/time and duration selected, auto-fill end date/time
  useEffect(() => {
    if (!startDate || !startTime) return;
    if (!duration || duration === 'custom') return;
    const mins = parseInt(duration, 10) || 60;
    const s = new Date(`${startDate}T${startTime}`);
    const e = new Date(s.getTime() + mins * 60000);
    // fill endDate and endTime in local form values
    const pad = (n: number) => n.toString().padStart(2, '0');
    setEndDate(`${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}`);
    setEndTime(`${pad(e.getHours())}:${pad(e.getMinutes())}`);
  }, [startDate, startTime, duration]);

  const combinedStart = combine(startDate, startTime);
  const combinedEnd = combine(endDate, endTime);

  const isSlotFree = useMemo(() => {
    if (!combinedStart || !combinedEnd) return false;
    for (const r of existingRequests) {
      if (r.location !== location) continue;
      if (overlaps(combinedStart, combinedEnd, r.start, r.end)) return false;
    }
    return true;
  }, [combinedStart, combinedEnd, existingRequests, location]);

  // suggested next free start
  const suggestedStart = useMemo(() => {
    if (!combinedStart) return null;
    const after = new Date(combinedStart);
    const later = existingRequests
      .filter((r) => r.location === location && new Date(r.end) > after)
      .map((r) => new Date(r.end));
    if (!later.length) return null;
    const latest = new Date(Math.max.apply(null, later as any));
    const mins = Math.ceil(latest.getMinutes() / 15) * 15;
    latest.setMinutes(mins);
    latest.setSeconds(0);
    latest.setMilliseconds(0);
    return latest;
  }, [combinedStart, existingRequests, location]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    if (!purpose.trim()) return setError("Purpose is required");
    if (!combinedStart || !combinedEnd) return setError("Start and end date/time are required");
    if (new Date(combinedStart) >= new Date(combinedEnd)) return setError("End must be after start");
    if (!isSlotFree) return setError("Selected slot is not free. Please pick another time or location.");

    const req: SacRequest = {
      id: generateId(),
      requesterEmail,
      requesterName,
      location,
      capacity,
      purpose,
      start: new Date(combinedStart).toISOString(),
      end: new Date(combinedEnd).toISOString(),
      status: "Pending",
      createdAt: new Date().toISOString(),
      isSpecial: isSpecial ? true : undefined,
      specialDetails: isSpecial ? specialDetails : undefined,
    };

    onCreate(req);
    setSuccess("Request submitted and is pending approval.");
    setPurpose("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setDuration("60");
    setIsSpecial(false);
    setSpecialDetails("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value as LocationType)} className="mt-1 block w-full rounded-md border px-3 py-2">
            <option value="LA1">LA1 (Lecture Auditorium 1)</option>
            <option value="LA2">LA2 (Lecture Auditorium 2)</option>
            <option value="DTS">DTS</option>
            <option value="STS">STS</option>
            <option value="Football1">Football Ground 1</option>
            <option value="Football2">Football Ground 2</option>
          </select>
        </div>

        {(location === "LA1" || location === "LA2") && (
          <div>
            <label className="block text-sm font-medium">Needed student capacity</label>
            <input type="number" min={1} value={capacity ?? 10} onChange={(e) => setCapacity(Number(e.target.value))} className="mt-1 block w-full rounded-md border px-3 py-2" />
          </div>
        )}

        {/* Start card */}
        <div>
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Start</label>
              <div className="text-xs">Duration:</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-md border px-3 py-2" />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-md border px-3 py-2" />
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <button type="button" onClick={() => setDuration('30')} className="rounded-md border px-2 py-1">30m</button>
              <button type="button" onClick={() => setDuration('60')} className="rounded-md border px-2 py-1">1h</button>
              <button type="button" onClick={() => setDuration('120')} className="rounded-md border px-2 py-1">2h</button>
              <button type="button" onClick={() => setDuration('custom')} className="rounded-md border px-2 py-1">Custom</button>
            </div>
          </div>
        </div>

        {/* End card */}
        <div>
          <div className="rounded-md border p-3">
            <label className="block text-sm font-medium">End</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-md border px-3 py-2" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-md border px-3 py-2" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Purpose / Notes</label>
        <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2" />
      </div>

      {/* special request toggle */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setIsSpecial((s) => !s)} className={`rounded-md px-3 py-1 ${isSpecial ? 'bg-yellow-100' : 'border'}`}>Make special request</button>
        {isSpecial && (
          <div className="flex-1">
            <label className="block text-sm">Special request details</label>
            <input className="mt-1 block w-full rounded-md border px-3 py-2" value={specialDetails} onChange={(e) => setSpecialDetails(e.target.value)} placeholder="Purpose, preferred location notes, equipment needed, etc." />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-md bg-cyan-600 px-4 py-2 text-white">Submit request</button>
        <button type="button" onClick={() => { setPurpose(""); setStartDate(""); setStartTime(""); setEndDate(""); setEndTime(""); setDuration('60'); setIsSpecial(false); setSpecialDetails(''); }} className="rounded-md border px-4 py-2">Reset</button>
        <div className="ml-auto text-sm text-neutral-500">
          {combinedStart && combinedEnd && (isSlotFree ? <span className="text-green-600">Slot appears free</span> : <span className="text-red-600">Slot unavailable</span>)}
          {!isSlotFree && suggestedStart && (
            <div className="text-xs text-neutral-500 mt-1">Suggested next free start: {suggestedStart.toLocaleString()}</div>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}
    </form>
  );
}

function StudentRequestList({ requests, onCancel }: { requests: SacRequest[]; onCancel: (id: string) => void; }) {
  if (!requests.length) return <div className="p-4 text-center text-neutral-500">No requests made yet.</div>;

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <div key={r.id} className="rounded-md border p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{r.location} — {r.purpose}</h3>
                <span className={`text-xs px-2 py-1 rounded ${r.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : r.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
              </div>
              <p className="text-sm text-neutral-500">{formatDateDMY(r.start)} — {formatDateDMY(r.end)}</p>
            </div>
            <div className="flex items-center gap-2">
              {r.status === 'Pending' && (
                <button onClick={() => onCancel(r.id)} className="rounded-md border px-3 py-1 text-sm">Cancel</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ManagerRequestList({ requests, onUpdate }: { requests: SacRequest[]; onUpdate: (next: SacRequest[]) => void; }) {
  const [editing, setEditing] = useState<SacRequest | null>(null);

  function approve(id: string) {
    const next = requests.map((r) =>
      r.id === id ? ({ ...r, status: "Approved" } as SacRequest) : r
    );
    onUpdate(next);
  }
  function reject(id: string) {
    const next = requests.map((r) =>
      r.id === id ? ({ ...r, status: "Rejected" } as SacRequest) : r
    );
    onUpdate(next);
  }
  function saveEdit(updated: SacRequest) {
    const next = requests.map((r) => r.id === updated.id ? updated : r);
    onUpdate(next);
    setEditing(null);
  }

  if (!requests.length) return <div className="p-4 text-center text-neutral-500">No incoming requests.</div>;

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <div key={r.id} className="rounded-md border p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{r.location} — {r.purpose}</h3>
                <span className={`text-xs px-2 py-1 rounded ${r.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : r.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
              </div>
              <p className="text-sm text-neutral-500">Requested by {r.requesterName || r.requesterEmail}</p>
              <p className="text-sm text-neutral-500">{formatDateDMY(r.start)} — {formatDateDMY(r.end)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(r)} className="rounded-md border px-3 py-1 text-sm">Edit</button>
              <button onClick={() => approve(r.id)} className="rounded-md bg-green-600 px-3 py-1 text-sm text-white">Approve</button>
              <button onClick={() => reject(r.id)} className="rounded-md border px-3 py-1 text-sm">Reject</button>
            </div>
          </div>
        </div>
      ))}

      {editing && (
        <div className="rounded-md border p-4 bg-neutral-50">
          <h4 className="font-semibold mb-2">Edit request</h4>
          <EditRequestForm request={editing} onCancel={() => setEditing(null)} onSave={saveEdit} existingRequests={requests} />
        </div>
      )}
    </div>
  );
}

function EditRequestForm({ request, onCancel, onSave, existingRequests }: { request: SacRequest; onCancel: () => void; onSave: (r: SacRequest) => void; existingRequests: SacRequest[]; }) {
  const [purpose, setPurpose] = useState(request.purpose);
  const [start, setStart] = useState(new Date(request.start).toISOString().slice(0, 16));
  const [end, setEnd] = useState(new Date(request.end).toISOString().slice(0, 16));
  const [capacity, setCapacity] = useState<number | undefined>(request.capacity);
  const [error, setError] = useState<string | null>(null);

  const isSlotFree = useMemo(() => {
    if (!start || !end) return false;
    for (const r of existingRequests) {
      if (r.id === request.id) continue; // skip self
      if (r.location !== request.location) continue;
      if (overlaps(start, end, r.start, r.end)) return false;
    }
    return true;
  }, [start, end, existingRequests, request]);

  function save() {
    setError(null);
    if (!purpose.trim()) return setError("Purpose required");
    if (new Date(start) >= new Date(end)) return setError("End must be after start");
    if (!isSlotFree) return setError("Conflict with existing booking");

    onSave({ ...request, purpose, start: new Date(start).toISOString(), end: new Date(end).toISOString(), capacity });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Start</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 block w-full rounded-md border px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">End</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 block w-full rounded-md border px-2 py-1" />
        </div>
      </div>

      {(request.location === "LA1" || request.location === "LA2") && (
        <div>
          <label className="block text-sm">Capacity</label>
          <input type="number" value={capacity ?? 10} onChange={(e) => setCapacity(Number(e.target.value))} className="mt-1 block w-40 rounded-md border px-2 py-1" />
        </div>
      )}

      <div>
        <label className="block text-sm">Purpose</label>
        <textarea rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-1 block w-full rounded-md border px-2 py-1"></textarea>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={save} className="rounded-md bg-cyan-600 px-3 py-1 text-white">Save</button>
        <button onClick={onCancel} className="rounded-md border px-3 py-1">Cancel</button>
        <div className="ml-auto text-sm">{!isSlotFree && <span className="text-red-600">Conflict</span>}</div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
