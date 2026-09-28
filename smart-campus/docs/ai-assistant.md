# AI Campus Assistant

## Architecture
- Provider abstraction: `AssistantProvider` interface
- Implementation: Google Gemini 1.5 Flash via `gemini_provider.py`
- Tool calling: LLM uses backend tools for all factual queries

## Tools
- `search_campus` — Search buildings, POIs, departments
- `calculate_route` — Get walking directions
- `find_nearby` — Find nearby POIs by category
- `list_active_events` — Get current/upcoming events
- `find_nearest_cart` — Find closest campus cart
- `get_shop_reviews` — Get shop reviews and ratings

## Safety
- System prompt forbids hallucination
- All facts must come from tool calls
- If no data found, assistant says "I couldn't find that"
