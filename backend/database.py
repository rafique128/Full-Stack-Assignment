import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/leads.db"
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "leads.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT DEFAULT '',
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        event_name TEXT NOT NULL,
        notes TEXT DEFAULT '',
        follow_up_status TEXT DEFAULT 'New Met',
        priority TEXT DEFAULT 'Warm',
        tags TEXT DEFAULT '',
        ai_summary TEXT DEFAULT '',
        ai_followup_email TEXT DEFAULT '',
        ai_followup_linkedin TEXT DEFAULT '',
        ai_key_points TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

def row_to_dict(row) -> Dict[str, Any]:
    if not row:
        return {}
    d = dict(row)
    return d

def get_all_leads(search: Optional[str] = None, status: Optional[str] = None, event: Optional[str] = None, priority: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM leads WHERE 1=1"
    params = []
    
    if search:
        search_param = f"%{search.strip()}%"
        query += " AND (name LIKE ? OR company LIKE ? OR email LIKE ? OR notes LIKE ? OR event_name LIKE ?)"
        params.extend([search_param, search_param, search_param, search_param, search_param])
        
    if status and status != "All":
        query += " AND follow_up_status = ?"
        params.append(status)
        
    if event and event != "All":
        query += " AND event_name = ?"
        params.append(event)

    if priority and priority != "All":
        query += " AND priority = ?"
        params.append(priority)
        
    query += " ORDER BY id DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    leads = [row_to_dict(r) for r in rows]
    conn.close()
    return leads

def get_lead_by_id(lead_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row) if row else None

def create_lead(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    cursor.execute("""
    INSERT INTO leads (
        name, company, email, phone, event_name, notes, follow_up_status,
        priority, tags, ai_summary, ai_followup_email, ai_followup_linkedin,
        ai_key_points, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("name", "").strip(),
        data.get("company", "").strip(),
        data.get("email", "").strip(),
        data.get("phone", "").strip(),
        data.get("event_name", "").strip() or "General Business Event",
        data.get("notes", "").strip(),
        data.get("follow_up_status", "New Met"),
        data.get("priority", "Warm"),
        data.get("tags", ""),
        data.get("ai_summary", ""),
        data.get("ai_followup_email", ""),
        data.get("ai_followup_linkedin", ""),
        data.get("ai_key_points", ""),
        now,
        now
    ))
    
    lead_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_lead_by_id(lead_id)

def update_lead(lead_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    fields = []
    values = []
    
    allowed_fields = [
        "name", "company", "email", "phone", "event_name", "notes",
        "follow_up_status", "priority", "tags", "ai_summary",
        "ai_followup_email", "ai_followup_linkedin", "ai_key_points"
    ]
    
    for field in allowed_fields:
        if field in data and data[field] is not None:
            fields.append(f"{field} = ?")
            values.append(data[field])
            
    if not fields:
        conn.close()
        return get_lead_by_id(lead_id)
        
    fields.append("updated_at = ?")
    values.append(now)
    values.append(lead_id)
    
    query = f"UPDATE leads SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return get_lead_by_id(lead_id)

def delete_lead(lead_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_stats() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM leads")
    total_leads = cursor.fetchone()[0]
    
    cursor.execute("SELECT follow_up_status, COUNT(*) FROM leads GROUP BY follow_up_status")
    status_counts = {r[0]: r[1] for r in cursor.fetchall()}
    
    cursor.execute("SELECT event_name, COUNT(*) FROM leads GROUP BY event_name ORDER BY COUNT(*) DESC LIMIT 8")
    event_counts = {r[0]: r[1] for r in cursor.fetchall()}
    
    cursor.execute("SELECT priority, COUNT(*) FROM leads GROUP BY priority")
    priority_counts = {r[0]: r[1] for r in cursor.fetchall()}
    
    conn.close()
    return {
        "total_leads": total_leads,
        "status_breakdown": status_counts,
        "event_breakdown": event_counts,
        "priority_breakdown": priority_counts
    }
