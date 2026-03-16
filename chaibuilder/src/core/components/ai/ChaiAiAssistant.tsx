import { useState, useRef, useEffect } from "react";
import { useChaiAi } from "@chaibuilder/hooks/use-chai-ai";
import { Button } from "@chaibuilder/components/ui/button";
import { Textarea } from "@chaibuilder/components/ui/textarea";
import { LightningBoltIcon, PaperPlaneIcon, ReloadIcon } from "@radix-ui/react-icons";
import { cn } from "@chaibuilder/core/functions/common-functions";

export const ChaiAiAssistant = () => {
    const { messages, askAi, loading } = useChaiAi();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || loading) return;
        askAi(input);
        setInput("");
    };

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LightningBoltIcon className="text-blue-600 h-5 w-5" />
                    <h3 className="font-bold text-sm text-slate-700 font-sans tracking-tight">AI Assistant</h3>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ready</span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-white/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn(
                        "flex flex-col max-w-[90%] rounded-2xl p-4 text-sm transition-all duration-300",
                        msg.role === "user" 
                            ? "bg-blue-600 text-white self-end ml-auto rounded-br-none shadow-md shadow-blue-500/10" 
                            : "bg-slate-100/80 text-slate-800 self-start rounded-bl-none border border-slate-200/50"
                    )}>
                        <p className="leading-relaxed font-medium">{msg.content}</p>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-3 text-slate-500 bg-slate-100/50 p-4 rounded-2xl rounded-bl-none border border-slate-200/50 self-start animate-fade-in">
                        <ReloadIcon className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-xs font-semibold italic">Analyzing your request...</span>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="relative group">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Say things like 'Add a contact form' or 'Change text to blue'..."
                        className="min-h-[100px] w-full resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm p-3 pr-12 rounded-xl bg-white shadow-sm transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 bottom-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-full h-9 w-9 transition-all duration-200"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                    >
                        <PaperPlaneIcon className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { icon: "✨", label: "Hero section" },
                        { icon: "🎨", label: "Colorful vibe" },
                        { icon: "📱", label: "Contact Us" }
                    ].map((tip) => (
                        <button
                            key={tip.label}
                            onClick={() => askAi("Create a " + tip.label)}
                            className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-bold transition-all duration-200 border border-slate-200 shadow-sm hover:border-blue-200"
                        >
                            <span>{tip.icon}</span>
                            {tip.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
