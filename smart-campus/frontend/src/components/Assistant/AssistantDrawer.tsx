import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Wrench, 
  Navigation, 
  CornerDownRight, 
  Compass, 
  MapPin 
} from 'lucide-react';
import { api } from '../../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
  suggestedActions?: string[];
  relatedEntities?: any[];
}

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (id: string) => void;
}

const INITIAL_SUGGESTIONS = [
  'Where is the library?',
  'Directions from Main Gate to Block A',
  'Where can I get coffee or food?',
  'Where is the nearest campus cart?',
  'What events are happening this week?',
  'Where is the nearest ATM?',
];

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTo,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "👋 **Hello! I'm your Smart Campus AI Navigator for Chandigarh University.**\n\nI can help you navigate blocks, find labs & ATMs, track live campus carts, check event schedules, or find the best places to eat. How can I help you today?",
      suggestedActions: ['Where is Library?', 'Track Campus Cart', 'Upcoming Events', 'Find Food Courts'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await api.chatAssistant(query, history);

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.reply,
        toolCalls: response.tool_calls,
        suggestedActions: response.suggested_actions,
        relatedEntities: response.related_entities,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to the campus intelligence server. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-[1001] w-full sm:w-[420px] glass-panel border-l border-zinc-700/60 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#A3E635] to-emerald-400 flex items-center justify-center text-black shadow-lg shadow-[#A3E635]/25">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-white font-['Outfit']">Campus Assistant</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] font-bold border border-[#A3E635]/30">
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Zero-hallucination campus navigation</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#A3E635] shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-2`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#A3E635] text-black font-semibold rounded-tr-none shadow-md shadow-[#A3E635]/20'
                    : 'bg-zinc-800/90 text-zinc-100 rounded-tl-none border border-zinc-700/60 shadow-md backdrop-blur-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Tool Calling Indicators */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-700/60 flex flex-wrap gap-1.5">
                    {msg.toolCalls.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-zinc-900/90 text-[#A3E635] border border-[#A3E635]/30 font-mono"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>{t.tool_name}()</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Entity Card */}
              {msg.relatedEntities && msg.relatedEntities.length > 0 && (
                <div className="space-y-1.5">
                  {msg.relatedEntities.map((ent: any) => (
                    <div
                      key={ent.id}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#A3E635]" />
                        <span className="text-xs font-semibold text-white">{ent.title}</span>
                      </div>
                      <button
                        onClick={() => onNavigateTo(ent.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#A3E635] hover:bg-[#bef264] text-black text-[11px] font-bold transition-all flex items-center gap-1"
                      >
                        <span>Navigate</span>
                        <CornerDownRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Follow-up Actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(action)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-[#A3E635] flex items-center justify-center text-black shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#A3E635] shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-zinc-800/90 border border-zinc-700/60 text-xs flex items-center gap-2 text-zinc-400">
              <div className="w-3.5 h-3.5 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin"></div>
              <span>Querying campus tools & AI model...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Initial Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-zinc-800/60 overflow-x-auto no-scrollbar flex gap-1.5">
          {INITIAL_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 hover:border-[#A3E635]/40 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Campus Assistant..."
            className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#A3E635] hover:bg-[#bef264] disabled:opacity-40 disabled:hover:bg-[#A3E635] text-black font-bold transition-all shadow-md shadow-[#A3E635]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
