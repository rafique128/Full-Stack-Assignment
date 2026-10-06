import os
import csv
import io
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from database import (
    init_db, get_all_leads, get_lead_by_id,
    create_lead, update_lead, delete_lead, get_stats
)
from ai_service import summarize_notes, draft_followup, parse_unstructured_notes

# Initialize DB on boot
init_db()

app = FastAPI(
    title="NexusLead AI - Event Lead Manager",
    description="Smart full-stack event lead capture, AI summarizer, and automated follow-up engine.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LeadCreateSchema(BaseModel):
    name: str
    company: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    event_name: str
    notes: Optional[str] = ""
    follow_up_status: Optional[str] = "New Met"
    priority: Optional[str] = "Warm"
    tags: Optional[str] = ""
    ai_summary: Optional[str] = ""
    ai_followup_email: Optional[str] = ""
    ai_followup_linkedin: Optional[str] = ""
    ai_key_points: Optional[str] = ""

class LeadUpdateSchema(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    event_name: Optional[str] = None
    notes: Optional[str] = None
    follow_up_status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_followup_email: Optional[str] = None
    ai_followup_linkedin: Optional[str] = None
    ai_key_points: Optional[str] = None

class AISummarizeRequest(BaseModel):
    lead_id: Optional[int] = None
    name: Optional[str] = ""
    company: Optional[str] = ""
    event_name: Optional[str] = ""
    notes: str

class AIDraftRequest(BaseModel):
    lead_id: Optional[int] = None
    name: Optional[str] = ""
    company: Optional[str] = ""
    event_name: Optional[str] = ""
    notes: str
    tone: Optional[str] = "Warm & Professional"

class AIParseRequest(BaseModel):
    raw_text: str

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "NexusLead AI API",
        "endpoints": {
            "leads": "/api/leads",
            "stats": "/api/stats",
            "ai_summarize": "/api/ai/summarize",
            "ai_draft": "/api/ai/draft-followup",
            "ai_extract": "/api/ai/extract-card",
            "seed": "/api/seed",
            "export": "/api/export"
        }
    }

@app.get("/api/leads")
def list_leads(
    search: Optional[str] = Query(None, description="Search term for name, company, notes, event"),
    status: Optional[str] = Query(None, description="Filter by follow_up_status"),
    event: Optional[str] = Query(None, description="Filter by event_name"),
    priority: Optional[str] = Query(None, description="Filter by priority")
):
    return get_all_leads(search=search, status=status, event=event, priority=priority)

@app.post("/api/leads", status_code=201)
def add_lead(lead_in: LeadCreateSchema):
    if not lead_in.name.strip():
        raise HTTPException(status_code=400, detail="Lead name is required.")
    if not lead_in.event_name.strip():
        raise HTTPException(status_code=400, detail="Event name is required.")
        
    lead_dict = lead_in.model_dump()
    
    # Auto-generate AI summary and follow-up draft if notes exist and not already generated
    if lead_dict.get("notes") and not lead_dict.get("ai_summary"):
        ai_res = summarize_notes(
            name=lead_dict["name"],
            company=lead_dict["company"],
            event_name=lead_dict["event_name"],
            notes=lead_dict["notes"]
        )
        lead_dict["ai_summary"] = ai_res.get("summary", "")
        lead_dict["ai_key_points"] = " • ".join(ai_res.get("key_points", []))
        
        draft_res = draft_followup(
            name=lead_dict["name"],
            company=lead_dict["company"],
            event_name=lead_dict["event_name"],
            notes=lead_dict["notes"],
            tone="Warm & Professional"
        )
        lead_dict["ai_followup_email"] = draft_res.get("email_body", "")
        lead_dict["ai_followup_linkedin"] = draft_res.get("linkedin_dm", "")
        
    created = create_lead(lead_dict)
    return created

@app.get("/api/leads/{lead_id}")
def read_lead(lead_id: int):
    lead = get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.put("/api/leads/{lead_id}")
def edit_lead(lead_id: int, lead_in: LeadUpdateSchema):
    existing = get_lead_by_id(lead_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    updated = update_lead(lead_id, lead_in.model_dump(exclude_unset=True))
    return updated

@app.delete("/api/leads/{lead_id}")
def remove_lead(lead_id: int):
    success = delete_lead(lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully", "id": lead_id}

@app.get("/api/stats")
def stats():
    return get_stats()

@app.post("/api/ai/summarize")
def ai_summarize_endpoint(payload: AISummarizeRequest):
    res = summarize_notes(
        name=payload.name or "Prospect",
        company=payload.company or "",
        event_name=payload.event_name or "Conference",
        notes=payload.notes
    )
    
    # If lead_id is provided, optionally persist update
    if payload.lead_id:
        update_lead(payload.lead_id, {
            "ai_summary": res.get("summary", ""),
            "ai_key_points": " • ".join(res.get("key_points", []))
        })
        
    return res

@app.post("/api/ai/draft-followup")
def ai_draft_endpoint(payload: AIDraftRequest):
    drafts = draft_followup(
        name=payload.name or "Prospect",
        company=payload.company or "",
        event_name=payload.event_name or "Conference",
        notes=payload.notes,
        tone=payload.tone or "Warm & Professional"
    )
    
    if payload.lead_id:
        update_lead(payload.lead_id, {
            "ai_followup_email": drafts.get("email_body", ""),
            "ai_followup_linkedin": drafts.get("linkedin_dm", "")
        })
        
    return drafts

@app.post("/api/ai/extract-card")
def ai_extract_endpoint(payload: AIParseRequest):
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided")
    return parse_unstructured_notes(payload.raw_text)

@app.post("/api/seed")
def seed_demo_leads():
    demo_leads = [
        {
            "name": "Elena Rostova",
            "company": "QuantumScale AI",
            "email": "elena.r@quantumscale.ai",
            "phone": "+1 415 892 4410",
            "event_name": "SaaStr Annual 2026",
            "notes": "VP of Engineering. Looking to overhaul their enterprise customer onboarding pipeline with automated AI agents. Budget approved for Q3, need SOC2 compliance and seamless webhook integrations. Ready to schedule a technical demo next Tuesday.",
            "follow_up_status": "Follow-up Pending",
            "priority": "Hot",
            "tags": "Decision Maker, Enterprise, High Budget"
        },
        {
            "name": "Marcus Vance",
            "company": "Aura Health Technologies",
            "email": "marcus@aurahealth.co",
            "phone": "+1 650 334 7891",
            "event_name": "Web Summit Lisbon",
            "notes": "Co-founder & Chief Product Officer. Met at booth during the morning keynote. Interested in our real-time sentiment analysis engine for patient feedback. Wants a brief follow-up email with case studies.",
            "follow_up_status": "New Met",
            "priority": "Warm",
            "tags": "Healthcare, Product, Series A"
        },
        {
            "name": "Sophia Zhang",
            "company": "Apex Fintech Labs",
            "email": "szhang@apexfintech.io",
            "phone": "+1 212 901 8842",
            "event_name": "TechCrunch Disrupt 2026",
            "notes": "Head of Partnerships. Discussed co-marketing opportunities and joint webinar next quarter. Very enthusiastic about our developer community. Meeting scheduled for next Thursday 2 PM EST.",
            "follow_up_status": "Meeting Scheduled",
            "priority": "Hot",
            "tags": "Partnership, Fintech, High Intent"
        },
        {
            "name": "David Miller",
            "company": "GreenPulse Logistics",
            "email": "d.miller@greenpulselogistics.com",
            "phone": "+1 312 455 1209",
            "event_name": "AWS Summit Chicago",
            "notes": "Director of Supply Chain IT. Casual conversation during lunch roundtable. Exploring IoT fleet tracker integrations. Currently bound by legacy vendor contract until December, re-evaluate Q1 2027.",
            "follow_up_status": "In Conversation",
            "priority": "Cool",
            "tags": "Supply Chain, Long Term, Nurture"
        },
        {
            "name": "Amira Al-Mansoor",
            "company": "Krypton Global Capital",
            "email": "amira@kryptonglobal.com",
            "phone": "+971 50 882 1934",
            "event_name": "GITEX Global 2026",
            "notes": "Angel investor & portfolio advisor. Impressed by our AI lead intelligence approach. Wants to introduce our founder to 3 SaaS portfolio companies looking for pipeline acceleration.",
            "follow_up_status": "Closed Won",
            "priority": "Hot",
            "tags": "Investor, VIP, Strategic Intro"
        }
    ]
    
    seeded_count = 0
    for lead in demo_leads:
        # Check if already exists
        existing = get_all_leads(search=lead["name"])
        if not existing:
            ai_res = summarize_notes(lead["name"], lead["company"], lead["event_name"], lead["notes"])
            lead["ai_summary"] = ai_res.get("summary", "")
            lead["ai_key_points"] = " • ".join(ai_res.get("key_points", []))
            
            draft_res = draft_followup(lead["name"], lead["company"], lead["event_name"], lead["notes"], "Warm & Professional")
            lead["ai_followup_email"] = draft_res.get("email_body", "")
            lead["ai_followup_linkedin"] = draft_res.get("linkedin_dm", "")
            
            create_lead(lead)
            seeded_count += 1
            
    return {"message": f"Successfully seeded {seeded_count} leads.", "total_seeded": seeded_count}

@app.get("/api/export")
def export_leads_csv():
    leads = get_all_leads()
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "ID", "Name", "Company", "Email", "Phone", "Event",
        "Status", "Priority", "Notes", "AI Summary", "Created At"
    ])
    
    for l in leads:
        writer.writerow([
            l.get("id"),
            l.get("name"),
            l.get("company"),
            l.get("email"),
            l.get("phone"),
            l.get("event_name"),
            l.get("follow_up_status"),
            l.get("priority"),
            l.get("notes"),
            l.get("ai_summary"),
            l.get("created_at")
        ])
        
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=event_leads_export.csv"}
    )
