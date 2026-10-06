const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export async function fetchLeads(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status && filters.status !== "All") params.append("status", filters.status);
  if (filters.event && filters.event !== "All") params.append("event", filters.event);
  if (filters.priority && filters.priority !== "All") params.append("priority", filters.priority);

  const url = `${API_BASE}/leads?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function createLead(leadData) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create lead");
  }
  return res.json();
}

export async function updateLead(id, leadData) {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update lead");
  }
  return res.json();
}

export async function deleteLead(id) {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete lead");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function requestAISummary(payload) {
  const res = await fetch(`${API_BASE}/ai/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("AI summarization failed");
  return res.json();
}

export async function requestAIDraft(payload) {
  const res = await fetch(`${API_BASE}/ai/draft-followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("AI draft generation failed");
  return res.json();
}

export async function requestAIExtract(rawText) {
  const res = await fetch(`${API_BASE}/ai/extract-card`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text: rawText })
  });
  if (!res.ok) throw new Error("AI extraction failed");
  return res.json();
}

export async function seedDemoData() {
  const res = await fetch(`${API_BASE}/seed`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to seed demo data");
  return res.json();
}

export function getExportCsvUrl() {
  return `${API_BASE}/export`;
}
