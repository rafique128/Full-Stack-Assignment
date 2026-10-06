import os
import re
import json
from typing import Dict, Any, Optional

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def _extract_intent_and_keywords(notes: str) -> Dict[str, Any]:
    notes_lower = notes.lower()
    
    # Priority heuristics
    priority = "Warm"
    if any(w in notes_lower for w in ["urgent", "ready to buy", "demo next week", "budget approved", "asap", "decision maker", "hot"]):
        priority = "Hot"
    elif any(w in notes_lower for w in ["just looking", "next year", "no budget", "student", "casually exploring", "cool"]):
        priority = "Cool"
        
    # Keywords / topics
    topics = []
    topic_keywords = {
        "AI Integration": ["ai", "llm", "automation", "agent", "gpt", "model", "machine learning"],
        "Enterprise Security": ["security", "soc2", "compliance", "gdpr", "hipaa", "auth"],
        "Cloud & Scale": ["aws", "cloud", "scalability", "infrastructure", "kubernetes", "devops"],
        "Pricing & ROI": ["price", "cost", "budget", "roi", "discount", "tier", "subscription"],
        "Pilot / Trial": ["pilot", "poc", "trial", "test", "demo", "sample"]
    }
    for topic, words in topic_keywords.items():
        if any(w in notes_lower for w in words):
            topics.append(topic)
            
    if not topics:
        topics.append("General Collaboration")
        
    return {
        "priority": priority,
        "topics": topics
    }

def summarize_notes(name: str, company: str, event_name: str, notes: str) -> Dict[str, Any]:
    """
    Summarize interaction notes into key takeaways, primary interest, and recommended next step.
    """
    if not notes.strip():
        return {
            "summary": f"Met {name} from {company or 'their organization'} at {event_name}. No detailed notes recorded yet.",
            "key_points": ["Initial contact established", "Awaiting detailed discovery"],
            "sentiment": "Neutral",
            "recommended_action": "Send a warm introductory reconnection message."
        }
        
    # Check if external API call is viable
    if OPENAI_API_KEY:
        try:
            import urllib.request
            req_data = {
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an executive CRM AI assistant analyzing business event leads. Return a clean JSON object with keys: summary (2 sentences), key_points (list of 3 string bullets), sentiment (Positive/Neutral/Hesitant), recommended_action (1 actionable sentence)."
                    },
                    {
                        "role": "user",
                        "content": f"Lead: {name} from {company} at {event_name}.\nNotes:\n{notes}"
                    }
                ],
                "response_format": {"type": "json_object"}
            }
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(req_data).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {OPENAI_API_KEY}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode("utf-8"))
                content = json.loads(result["choices"][0]["message"]["content"])
                return content
        except Exception as e:
            print("OpenAI call failed, falling back to local NLP:", e)

    # Intelligent Local NLP Fallback
    meta = _extract_intent_and_keywords(notes)
    sentences = [s.strip() for s in re.split(r"[.!?\n]+", notes) if len(s.strip()) > 5]
    
    lead_ref = f"{name}" if name else "The prospect"
    company_ref = f" at {company}" if company else ""
    event_ref = f" during {event_name}" if event_name else ""
    
    topics_str = ", ".join(meta["topics"])
    summary = (
        f"{lead_ref}{company_ref} engaged with our team{event_ref}, expressing strategic interest in {topics_str}. "
        f"Key focus is exploring practical collaboration and evaluating fit for their current roadmap."
    )
    
    key_points = []
    if sentences:
        for s in sentences[:3]:
            # Clean bullet
            clean_s = s[0].upper() + s[1:]
            key_points.append(clean_s)
    else:
        key_points = [
            f"Interested in {meta['topics'][0]} solutions",
            "Discussed current operational priorities",
            "Agreed to review follow-up documentation"
        ]
        
    recommended_action = "Schedule a 15-minute alignment call within 48 hours while the event conversation is fresh."
    if meta["priority"] == "Hot":
        recommended_action = "Priority Outreach: Send tailored demo deck and calendar link within 24 hours."
    elif meta["priority"] == "Cool":
        recommended_action = "Nurture: Share our latest quarterly whitepaper and connect on LinkedIn."

    sentiment = "Positive" if meta["priority"] in ["Hot", "Warm"] else "Neutral"

    return {
        "summary": summary,
        "key_points": key_points,
        "sentiment": sentiment,
        "recommended_action": recommended_action
    }

def draft_followup(name: str, company: str, event_name: str, notes: str, tone: str = "Warm & Professional") -> Dict[str, Any]:
    """
    Draft tailored multi-channel follow-up communications.
    """
    first_name = name.split()[0] if name else "there"
    company_clause = f" at {company}" if company else ""
    event_clause = f" at {event_name}" if event_name else "recently"
    meta = _extract_intent_and_keywords(notes)
    primary_topic = meta["topics"][0] if meta["topics"] else "collaboration"
    
    # Try OpenAI if available
    if OPENAI_API_KEY:
        try:
            import urllib.request
            prompt = (
                f"You are a sales & networking expert. Write a follow-up for {name} ({company}) met at {event_name}.\n"
                f"Interaction notes: {notes}\nTone requested: {tone}.\n"
                "Return a JSON object with: email_subject, email_body, linkedin_dm, whatsapp_quick_chat."
            )
            req_data = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            }
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(req_data).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {OPENAI_API_KEY}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode("utf-8"))
                return json.loads(result["choices"][0]["message"]["content"])
        except Exception as e:
            print("OpenAI draft failed, using local generator:", e)

    # Local High-Touch Dynamic Generator
    if "Executive" in tone or "Formal" in tone:
        subject = f"Connecting post-{event_name} | {company} & Strategic Collaboration"
        body = (
            f"Dear {first_name},\n\n"
            f"It was a privilege speaking with you{event_clause}. I appreciated your perspectives on {company}'s "
            f"focus areas, specifically around {primary_topic}.\n\n"
            f"Given our discussion regarding: \"{notes[:120].strip()}...\", I believe there is strong alignment "
            f"between what your team is building and how our platform drives measurable outcomes.\n\n"
            f"Would you or a key colleague have 15 minutes next Tuesday or Wednesday for a brief introductory sync?\n\n"
            f"Looking forward to keeping in touch.\n\n"
            f"Best regards,\n[Your Name]\n[Your Title]"
        )
        linkedin = (
            f"Hi {first_name}, great meeting you{company_clause} at {event_name}! "
            f"Loved our conversation about {primary_topic}. Let's stay connected here and explore collaboration."
        )
    elif "Casual" in tone or "Coffee" in tone:
        subject = f"Great running into you at {event_name}! ☕"
        body = (
            f"Hey {first_name},\n\n"
            f"Really enjoyed bumping into you{event_clause}! Our chat about {primary_topic} was one of the highlights of my day.\n\n"
            f"I remember you mentioned: \"{notes[:100].strip()}...\". I'd love to pick up where we left off over a quick virtual coffee.\n\n"
            f"Let me know if you're free for a quick 10-min catchup sometime next week!\n\n"
            f"Cheers,\n[Your Name]"
        )
        linkedin = (
            f"Hey {first_name}! Great meeting you at {event_name}. "
            f"Would love to connect here and grab that coffee we talked about soon!"
        )
    elif "Pitch" in tone or "Value" in tone:
        subject = f"Idea for {company} following our chat at {event_name}"
        body = (
            f"Hi {first_name},\n\n"
            f"Thanks for taking a moment to stop by our booth at {event_name}. "
            f"I've been thinking about what you highlighted regarding {primary_topic}.\n\n"
            f"Teams similar to {company or 'yours'} typically reduce cycle times by over 40% using our approach. "
            f"I put together a quick 3-point walkthrough tailored to your setup.\n\n"
            f"Do you have 10 minutes this Thursday afternoon to take a quick look?\n\n"
            f"Best,\n[Your Name]"
        )
        linkedin = (
            f"Hi {first_name} - enjoyed our chat at {event_name}. "
            f"Following up on {primary_topic} for {company}. Sent a quick note to your email, let's connect here too!"
        )
    else:  # Warm & Professional (Default)
        subject = f"Following up from {event_name} — {name} & [Our Team]"
        body = (
            f"Hi {first_name},\n\n"
            f"It was wonderful meeting you{event_clause}! I really enjoyed hearing about what you and the team at {company or 'your team'} are working on.\n\n"
            f"From our chat, I noted that {primary_topic} is a top priority for you right now. As promised, I wanted to follow up and see how we can best support your initiatives.\n\n"
            f"Are you open to a brief 15-minute call next week to dive a bit deeper?\n\n"
            f"Best regards,\n[Your Name]"
        )
        linkedin = (
            f"Hi {first_name}, truly enjoyed our discussion at {event_name}! "
            f"Excited to connect here on LinkedIn and keep the conversation going around {primary_topic}."
        )

    whatsapp = f"Hi {first_name}, great meeting you at {event_name}! Reaching out following our discussion on {primary_topic}. Let me know when suits for a quick catch up!"

    return {
        "email_subject": subject,
        "email_body": body,
        "linkedin_dm": linkedin,
        "whatsapp_quick_chat": whatsapp
    }

def parse_unstructured_notes(raw_text: str) -> Dict[str, Any]:
    """
    Parse unstructured business card text or voice notes into structured lead data.
    """
    raw_lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    
    # Extract email
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", raw_text)
    email = email_match.group(0) if email_match else ""
    
    # Extract phone
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", raw_text)
    phone = phone_match.group(0) if phone_match else ""
    
    # Try OpenAI if available
    if OPENAI_API_KEY:
        try:
            import urllib.request
            prompt = (
                "Extract business lead details from this raw note/card text into a JSON object with keys: "
                "name, company, email, phone, event_name, notes, priority (Hot/Warm/Cool), follow_up_status (New Met).\n"
                f"Raw Text:\n{raw_text}"
            )
            req_data = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            }
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(req_data).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {OPENAI_API_KEY}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode("utf-8"))
                return json.loads(result["choices"][0]["message"]["content"])
        except Exception as e:
            print("OpenAI parse failed, using heuristic fallback:", e)

    # Heuristic parsing
    name = ""
    company = ""
    event_name = "Global Tech Summit 2026"
    
    for line in raw_lines:
        lower = line.lower()
        if "event:" in lower or "at " in lower and "summit" in lower or "conf" in lower:
            event_name = line.replace("Event:", "").strip()
        elif "company:" in lower or "corp" in lower or "inc" in lower or "technologies" in lower or "labs" in lower:
            company = line.replace("Company:", "").strip()
        elif not name and not "@" in line and not any(c.isdigit() for c in line) and len(line.split()) in [2, 3]:
            name = line.replace("Name:", "").strip()

    if not name and raw_lines:
        name = raw_lines[0]
        
    meta = _extract_intent_and_keywords(raw_text)
    
    return {
        "name": name,
        "company": company or "Innovatech Solutions",
        "email": email or f"{name.lower().replace(' ', '.')}@example.com" if name else "",
        "phone": phone,
        "event_name": event_name,
        "notes": raw_text,
        "priority": meta["priority"],
        "follow_up_status": "New Met"
    }
