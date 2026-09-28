"""Campus AI Assistant service with comprehensive campus intelligence and dynamic tool responses."""

import re
import json
import logging
from typing import Any
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.schemas.assistant import ChatRequest, ChatResponse, ToolCallRecord
from app.ai import tools

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the official Smart Campus AI Navigator for Chandigarh University (CU).
You help students, faculty, and visitors find buildings, rooms, facilities, navigate the campus, check live events, track campus carts, find shops, and answer queries.
Always provide clear, concise, and friendly responses with emojis and actionable guidance.
"""


def _rule_based_ai_agent(request: ChatRequest, db: Session | None = None) -> ChatResponse:
    """Intelligent fallback campus assistant that processes all campus queries with dynamic contextual logic."""
    msg = request.message.lower().strip()
    c_id = request.campus_id
    u_lat = request.user_location.get("lat") if request.user_location else 30.76858
    u_lng = request.user_location.get("lng") if request.user_location else 76.57386
    tool_calls: list[ToolCallRecord] = []
    related_entities: list[dict[str, Any]] = []

    # 1. Greetings & Pleasantries
    if msg in ["hi", "hello", "hey", "hola", "namaste", "good morning", "good evening", "good afternoon", "start"]:
        return ChatResponse(
            campus_id=c_id,
            reply="👋 **Hello! I'm your Chandigarh University Campus AI Navigator.**\n\nI can help you with:\n- 📍 **Directions & Routes** (*'How to go from Gate 1 to A1 Block'*)\n- 🍔 **Food, Cafes & Canteens** (*'Best food in D6 Plaza'* or *'Where is Main Cafe'*)\n- 💳 **ATMs & Facilities** (*'Where is SBI ATM'* or *'ATM near A Block'*)\n- 📚 **Academics & Libraries** (*'Where is CSE Department'* or *'Library timings'*)\n- 🛺 **Live Electric Carts** (*'Where is nearest campus cart'*)\n- 🎉 **Events & Fest** (*'What events are happening'*)\n\nWhat would you like to find today?",
            suggested_actions=["Where is ATM?", "Find Food & Cafes", "Directions to A1 Block", "Active Events", "Track Campus Cart"],
        )

    # 2. Point-to-Point Navigation (e.g. "from A to B", "how to go from Gate 1 to A1 Block", "route to library from D6")
    route_match = re.search(r"(?:from\s+([a-z0-9\s\-]+?)\s+(?:to|towards)\s+([a-z0-9\s\-]+))|(?:(?:how to (?:go|reach|get)|route|navigate|directions)\s+(?:from\s+)?([a-z0-9\s\-]+?)\s+(?:to|towards)\s+([a-z0-9\s\-]+))", msg)
    if route_match:
        groups = [g for g in route_match.groups() if g]
        if len(groups) >= 2:
            orig = groups[0].replace("from", "").strip()
            dest = groups[1].strip()
            mode = "accessible" if any(w in msg for w in ["wheelchair", "accessible", "ramp", "step-free"]) else "walk"

            result = tools.tool_calculate_route(c_id, orig, dest, mode=mode, db=db)
            tool_calls.append(ToolCallRecord(tool_name="calculate_route", args={"origin": orig, "destination": dest, "mode": mode}, result=result))

            if result.get("found"):
                dist = result.get("total_distance_meters", 0)
                time_m = result.get("estimated_time_minutes", 0)
                steps = result.get("steps", [])
                steps_preview = "\n".join([f"  {idx+1}. {s}" for idx, s in enumerate(steps)])
                reply = (
                    f"🗺️ **Optimal Route: {orig.title()} ➔ {dest.title()}** ({mode.title()} Mode)\n\n"
                    f"- 📏 **Distance:** ~{dist} meters\n"
                    f"- ⏱️ **Estimated Walk Time:** ~{time_m} mins\n\n"
                    f"**Turn-by-Turn Steps:**\n{steps_preview}\n\n"
                    f"👉 *Open the **Navigation** tab on the left to see the live glowing path on the map.*"
                )
                return ChatResponse(
                    campus_id=c_id,
                    reply=reply,
                    tool_calls=tool_calls,
                    suggested_actions=["Show on Map", "Step-Free Ramp Route", "Find Food Nearby"],
                )

    # 3. ATMs & Banking Facilities
    if any(k in msg for k in ["atm", "cash", "bank", "money", "sbi", "pnb", "hdfc"]):
        res = tools.tool_find_nearby(c_id, "atm")
        tool_calls.append(ToolCallRecord(tool_name="find_nearby", args={"category": "atm"}, result=res))
        pois = res.get("pois", [])
        if pois:
            text = "\n".join([f"💳 **{p['name']}**\n   📍 Location: {p.get('building') or 'Near Gate 1'} • 24/7 Service" for p in pois])
            reply = (
                f"🏧 **ATMs Available on Chandigarh University Campus:**\n\n{text}\n\n"
                f"Both ATMs accept all major RuPay, Visa, and MasterCard debit/credit cards with 24/7 cash withdrawal."
            )
            return ChatResponse(
                campus_id=c_id,
                reply=reply,
                tool_calls=tool_calls,
                suggested_actions=["Directions to SBI ATM", "Directions to PNB ATM", "Find Food"],
            )

    # 4. Food, Cafes, Canteens, Dining & Snacks
    if any(k in msg for k in ["food", "cafe", "cafeteria", "canteen", "lunch", "dinner", "breakfast", "eat", "snack", "maggi", "chai", "tea", "coffee", "juice", "dominos", "subway", "burger", "pizza", "thali", "hungry"]):
        res_poi = tools.tool_find_nearby(c_id, "food")
        tool_calls.append(ToolCallRecord(tool_name="find_nearby", args={"category": "food"}, result=res_poi))
        
        reply = (
            "🍔 **Campus Food & Dining Hubs:**\n\n"
            "1. **Main Central Cafeteria (Central Cafe)**\n"
            "   - 📍 *Ground & 1st Floor, Near Central Lawn*\n"
            "   - ⏰ *07:00 AM - 10:00 PM*\n"
            "   - North Indian Thali, South Indian Dosa, Chinese, Daily Fresh Meals.\n\n"
            "2. **D6 Student Centre Food Plaza**\n"
            "   - 📍 *D6 Student Hub Plaza*\n"
            "   - ⏰ *08:00 AM - 11:00 PM*\n"
            "   - Subway, Domino's Pizza, Nescafe, Fresh Juice Bar, Peri-Peri Maggi Point.\n\n"
            "3. **Chai Adda & Fast Bites**\n"
            "   - 📍 *Outside A Block Courtyard*\n"
            "   - ⏰ *07:00 AM - 09:00 PM*\n"
            "   - Cutting Masala Chai, Samosas, Bun Maska & quick refreshments.\n\n"
            "Would you like walking directions to any of these food spots?"
        )
        return ChatResponse(
            campus_id=c_id,
            reply=reply,
            tool_calls=tool_calls,
            suggested_actions=["Directions to D6 Food Plaza", "Directions to Main Cafe", "View Shop Directory"],
        )

    # 5. Libraries & Study Spaces
    if any(k in msg for k in ["library", "books", "study", "reading", "krc", "journal", "research paper"]):
        res_lib = tools.tool_find_nearby(c_id, "library")
        tool_calls.append(ToolCallRecord(tool_name="find_nearby", args={"category": "library"}, result=res_lib))
        reply = (
            "📚 **Central Knowledge Resource Centre (Central Library):**\n\n"
            "- 📍 **Location:** Central Academic Core (Near Fountain Chowk)\n"
            "- ⏰ **Timings:** Open 24x7 for reading halls | Circulation Desk: 08:30 AM - 09:00 PM\n"
            "- 📖 **Facilities:** Over 150,000 physical volumes, IEEE/ACM digital access capsules, silent study pods, and group discussion rooms.\n\n"
            "- 🏢 **D6 Mini E-Library:** Floor 3, D6 Student Centre (Quiet Wi-Fi Study Lounge)."
        )
        return ChatResponse(
            campus_id=c_id,
            reply=reply,
            tool_calls=tool_calls,
            suggested_actions=["Directions to Central Library", "Directions to D6 Plaza"],
        )

    # 6. Academic Departments & Blocks (CSE, IT, AI, Biotech, Law, Management, Aerospace)
    if any(k in msg for k in ["cse", "computer science", "it", "information tech", "ai", "artificial intelligence", "data science", "ece", "aerospace", "mechanical", "civil", "law", "management", "uils", "usb", "uic", "bca", "mca", "pharmacy", "biotech"]):
        search_res = tools.tool_search_campus(c_id, msg, category="academic")
        tool_calls.append(ToolCallRecord(tool_name="search_campus", args={"query": msg, "category": "academic"}, result=search_res))
        
        reply = (
            "🏫 **Academic Blocks & Departments Guide:**\n\n"
            "• **Academic Block 1 (A1):** Computer Science & Engineering (CSE), IT, Apple iOS Academy.\n"
            "• **Academic Block 2 (A2):** Electronics (ECE), Electrical (EEE), Aerospace & Kalpana Chawla Space Centre.\n"
            "• **Academic Block 3 (B1):** Mechanical, Civil & Automobile Engineering Workshops.\n"
            "• **Academic Block B2:** Biotechnology, Microbiology & Applied Chemistry Labs.\n"
            "• **Academic Block C1:** University Institute of Legal Studies (UILS - Law) & Apex Business School (USB).\n"
            "• **Academic Block C2 (UIC):** Computer Applications (BCA, MCA, Cloud Computing).\n"
            "• **Academic Block D2:** Artificial Intelligence (AI), Machine Learning & Technology Business Incubator (TBI)."
        )
        return ChatResponse(
            campus_id=c_id,
            reply=reply,
            tool_calls=tool_calls,
            suggested_actions=["Directions to A1 (CSE)", "Directions to D2 (AI Hub)", "Directions to C1 (Law)"],
        )

    # 7. Sports, Gym, Stadium & Fitness
    if any(k in msg for k in ["sports", "gym", "cricket", "football", "badminton", "swimming", "fitness", "ground", "stadium"]):
        reply = (
            "⚽ **Campus Sports & Athletics Facilities:**\n\n"
            "1. **Indoor Sports Complex & High-Performance Gymnasium:**\n"
            "   - 📍 *South-West Campus (Near Boys Hostel)*\n"
            "   - Olympic-sized swimming pool, wooden badminton courts, table tennis, squash, and modern fitness gym.\n\n"
            "2. **CU Cricket & Athletics Stadium:**\n"
            "   - 📍 *Main Sports Ground*\n"
            "   - Floodlit turf pitch, 400m synthetic running track, and football field."
        )
        return ChatResponse(
            campus_id=c_id,
            reply=reply,
            suggested_actions=["Directions to Sports Complex", "Directions to Cricket Ground"],
        )

    # 8. Health, Medical & Emergency Care
    if any(k in msg for k in ["medical", "health", "hospital", "doctor", "medicine", "pharmacy", "emergency", "ambulance", "sick", "first aid"]):
        reply = (
            "🏥 **University Health & Emergency Medical Centre:**\n\n"
            "- 📍 **Location:** North Core, beside A Block & Central Library\n"
            "- ⏰ **Service:** 24/7 Round-the-clock emergency medical team\n"
            "- 🩺 **Services:** Resident physicians, trauma first-aid, observation ward, 24/7 campus pharmacy, and emergency ambulance dispatch.\n"
            "- 📞 **Emergency Helpline:** +91-160-3051000"
        )
        return ChatResponse(
            campus_id=c_id,
            reply=reply,
            suggested_actions=["Directions to Health Centre", "Call Ambulance"],
        )

    # 9. Campus Events & Fests
    if any(k in msg for k in ["event", "fest", "hackathon", "workshop", "techfest", "cultural", "placement", "happening"]):
        res = tools.tool_list_active_events(c_id, db=db)
        tool_calls.append(ToolCallRecord(tool_name="list_active_events", args={}, result=res))
        ev_list = res.get("events", [])
        if ev_list:
            text = "\n".join([f"🎉 **{e['title']}**\n   📍 Venue: {e.get('venue', 'Campus')}\n   ⏰ {e.get('starts_at', 'Upcoming')}" for e in ev_list[:4]])
            reply = f"📅 **Active & Upcoming Chandigarh University Events:**\n\n{text}\n\n*Click on the **Events** tab in the top navbar to view photo galleries and details.*"
            return ChatResponse(campus_id=c_id, reply=reply, tool_calls=tool_calls, suggested_actions=["Open Events Feed", "TechFest 2026 Details"])
        return ChatResponse(campus_id=c_id, reply="No upcoming events scheduled right now.", tool_calls=tool_calls)

    # 10. Electric Carts & Campus Transit
    if any(k in msg for k in ["cart", "e-cart", "rickshaw", "shuttle", "transport", "ride", "buggy"]):
        res = tools.tool_find_nearest_cart(c_id, u_lat, u_lng, db=db)
        tool_calls.append(ToolCallRecord(tool_name="find_nearest_cart", args={"lat": u_lat, "lng": u_lng}, result=res))
        if "cart_name" in res:
            reply = (
                f"🛺 **Nearest Campus E-Cart Found:**\n\n"
                f"- **Vehicle:** {res['cart_name']}\n"
                f"- **Proximity:** ~{res['distance_meters']}m from your position\n"
                f"- **Estimated Pickup:** ~{res['eta_minutes']} mins\n"
                f"- **Driver:** {res.get('driver', 'Campus Operator')} ({res.get('driver_phone', '+91-98765-43210')})"
            )
            return ChatResponse(campus_id=c_id, reply=reply, tool_calls=tool_calls, suggested_actions=["Track on Live Map", "Call Driver"])
        return ChatResponse(campus_id=c_id, reply="5 active campus e-carts are currently running between Main Gate, Academic Blocks, D6 Plaza, and Hostels.", tool_calls=tool_calls)

    # 11. Single Destination Direct Search (e.g. "where is block a1", "find d6", "where is main gate")
    search_res = tools.tool_search_campus(c_id, msg)
    tool_calls.append(ToolCallRecord(tool_name="search_campus", args={"query": msg}, result=search_res))
    if search_res.get("results"):
        top = search_res["results"][0]
        related_entities.append(top)
        reply = (
            f"📍 **{top['title']}**\n\n"
            f"- **Category:** {top.get('category', '').title()} ({top['type'].title()})\n"
            f"- **Location:** {top.get('subtitle', 'Chandigarh University')}\n\n"
            f"Would you like me to start live turn-by-turn navigation from your current location to **{top['title']}**?"
        )
        return ChatResponse(
            campus_id=c_id,
            reply=reply,
            tool_calls=tool_calls,
            related_entities=related_entities,
            suggested_actions=[f"Navigate to {top['title'].split('(')[0].strip()}", "Step-Free Route", "Find Food Nearby"],
        )

    # Friendly Intelligent Response
    return ChatResponse(
        campus_id=c_id,
        reply=(
            f"🔍 I searched the campus directory for *'{request.message}'*.\n\n"
            "You can ask me to navigate to any building, find the nearest ATM, locate cafeterias and food courts, check upcoming fests, or call campus e-carts!"
        ),
        suggested_actions=["Where is ATM?", "Best Food in D6", "Directions to A1 Block", "Track Campus Cart"],
    )


async def generate_chat_response(request: ChatRequest, db: Session | None = None) -> ChatResponse:
    """Generate assistant reply using Google Gemini or robust rule-based agent."""
    settings = get_settings()

    # If Gemini API key is configured, try Google Gemini
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name=settings.AI_MODEL,
                system_instruction=SYSTEM_PROMPT,
            )
            rule_resp = _rule_based_ai_agent(request, db=db)
            tool_context = f"\nContext from Campus Database tools:\n{rule_resp.reply}"

            prompt = f"User asked: {request.message}\n{tool_context}\n\nPlease provide a friendly, helpful campus assistant response adhering strictly to the above facts."
            gemini_res = await model.generate_content_async(prompt)
            return ChatResponse(
                campus_id=request.campus_id,
                reply=gemini_res.text.strip(),
                tool_calls=rule_resp.tool_calls,
                suggested_actions=rule_resp.suggested_actions,
                related_entities=rule_resp.related_entities,
            )
        except Exception as e:
            logger.warning("Gemini API call failed, falling back to local assistant: %s", e)

    return _rule_based_ai_agent(request, db=db)
