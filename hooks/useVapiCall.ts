"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BriefArgs, TranscriptLine, ModeType } from "@/types";
import { FIRST_MESSAGE, RIYA_PROMPT, BUILD_CONTENT_TOOL, DEMO_DATA } from "@/constants/prompts";

export function useVapiCall(
  vapiPublicKey: string,
  onToolBuild: (brief: BriefArgs, source: string) => void
) {
  const [mode, setMode] = useState<ModeType>("demo");
  const [inCall, setInCall] = useState(false);
  const [statusText, setStatusText] = useState("READY");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [brief, setBrief] = useState<BriefArgs | null>(null);
  const [speaker, setSpeaker] = useState<"ai" | "you" | null>(null);

  const vapiInstanceRef = useRef<any>(null);
  const demoAbortRef = useRef(0);

  // Initialize Vapi instance when public key changes
  useEffect(() => {
    if (typeof window === "undefined" || !vapiPublicKey.trim()) return;

    let vapi: any = null;
    import("@vapi-ai/web")
      .then(({ default: Vapi }) => {
        vapi = new Vapi(vapiPublicKey.trim());
        vapiInstanceRef.current = vapi;

        vapi.on("call-start", () => {
          setInCall(true);
          setStatusText("LIVE INTERVIEW");
          setSpeaker("ai");
        });

        vapi.on("call-end", () => {
          setInCall(false);
          setStatusText("INTERVIEW ENDED");
          setVolumeLevel(0);
          setSpeaker(null);
        });

        vapi.on("speech-start", () => {
          setStatusText("RIYA SPEAKING");
          setSpeaker("ai");
        });

        vapi.on("speech-end", () => {
          setStatusText("LISTENING");
          setSpeaker("you");
        });

        vapi.on("volume-level", (level: number) => {
          setVolumeLevel(level);
        });

        vapi.on("message", (msg: any) => {
          if (!msg) return;
          if (msg.type === "transcript") {
            const role = msg.role === "assistant" ? "ai" : "you";
            const text = msg.transcript || "";
            if (msg.transcriptType === "final" && text.trim()) {
              setTranscript((prev) => [...prev, { role, text }]);
            }
          } else if (msg.type === "tool-calls" || msg.type === "function-call") {
            const calls = msg.toolCallList || (msg.functionCall ? [msg.functionCall] : []);
            for (const call of calls) {
              const fnName = call.function?.name || call.name;
              if (fnName === BUILD_CONTENT_TOOL.function.name) {
                let args = call.function?.arguments || call.arguments || call.parameters;
                if (typeof args === "string") {
                  try {
                    args = JSON.parse(args);
                  } catch (e) {
                    args = { idea: args };
                  }
                }
                setBrief(args);
                onToolBuild(args, "Live voice interview");
              }
            }
          }
        });

        vapi.on("error", (e: any) => {
          console.error("Vapi voice error:", e);
          setStatusText("VOICE ERROR");
        });
      })
      .catch((err) => console.error("Failed to load @vapi-ai/web:", err));

    return () => {
      if (vapi) {
        try {
          vapi.stop();
        } catch (e) {}
      }
    };
  }, [vapiPublicKey, onToolBuild]);

  // Start live call
  const startLive = useCallback(
    async (creatorName: string, voiceId = "Naina", asstId?: string) => {
      if (!vapiInstanceRef.current) {
        throw new Error("Add your Vapi public key in Settings first.");
      }

      setTranscript([]);
      setBrief(null);
      setStatusText("CONNECTING");

      if (asstId && asstId.trim()) {
        await vapiInstanceRef.current.start(asstId.trim());
      } else {
        const p: any = {};
        const toolProps = BUILD_CONTENT_TOOL.function.parameters.properties;
        Object.keys(toolProps).forEach((k) => {
          p[k] = { type: "string", description: (toolProps as any)[k].description };
        });

        const personalizedGreeting = creatorName && creatorName.trim()
          ? `Hey ${creatorName.trim()}! Riya here from the Content Desk. Kis idea ko poore hafte ke content mein badalna hai? Koi idea nahi hai toh bhi chalega, I'll help you pick one.`
          : FIRST_MESSAGE;

        const assistantConfig = {
          name: "Riya · Content Desk",
          firstMessage: personalizedGreeting,
          firstMessageMode: "assistant-speaks-first",
          transcriber: {
            provider: "deepgram",
            model: "nova-3",
            language: "multi",
            keywords: [
              "lakh:2",
              "crore:2",
              "rupees:2",
              "SaaS:2",
              "Bharat:2",
              "Indore:2",
              "Hinglish:1",
              "LinkedIn:1",
              "founder:1",
              "B2B:1",
              "jugaad:2"
            ],
            smartFormat: true,
            endpointing: 250
          },
          startSpeakingPlan: {
            waitSeconds: 0.35,
            smartEndpointingPlan: { provider: "vapi" },
            transcriptionEndpointingPlan: {
              onPunctuationSeconds: 0.25,
              onNoPunctuationSeconds: 0.8,
              onNumberSeconds: 0.35
            }
          },
          stopSpeakingPlan: {
            numWords: 2,
            voiceSeconds: 0.2,
            backoffSeconds: 0.8
          },
          backgroundSpeechDenoisingPlan: {
            smartDenoisingPlan: { enabled: true }
          },
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            temperature: 0.65,
            maxTokens: 160,
            emotionRecognitionEnabled: true,
            messages: [
              {
                role: "system",
                content: RIYA_PROMPT + (creatorName && creatorName.trim() ? `\n\nCaller name: ${creatorName.trim()}` : "")
              }
            ],
            tools: [
              {
                type: "function",
                async: true,
                function: {
                  name: BUILD_CONTENT_TOOL.function.name,
                  description: BUILD_CONTENT_TOOL.function.description,
                  parameters: {
                    type: "object",
                    properties: p,
                    required: BUILD_CONTENT_TOOL.function.parameters.required
                  }
                }
              }
            ]
          },
          voice: {
            provider: "vapi",
            voiceId: voiceId || "Naina",
            speed: 1.02
          },
          clientMessages: ["transcript", "tool-calls", "speech-update", "conversation-update"]
        };

        await vapiInstanceRef.current.start(assistantConfig);
      }
    },
    []
  );

  // Play realistic simulation demo mode (runs without any API keys)
  const playDemo = useCallback(() => {
    const runId = ++demoAbortRef.current;
    setInCall(true);
    setTranscript([]);
    setBrief(null);
    setStatusText("DEMO INTERVIEW");

    const lines = DEMO_DATA.lines;
    let delayAccum = 300;

    lines.forEach((line, index) => {
      setTimeout(() => {
        if (runId !== demoAbortRef.current) return;
        setTranscript((prev) => [...prev, line]);
        setSpeaker(line.role);
        setStatusText(line.role === "ai" ? "RIYA SPEAKING" : "YOU ARE SPEAKING");
        setVolumeLevel(Math.random() * 0.7 + 0.3);

        setTimeout(() => {
          if (runId !== demoAbortRef.current) return;
          setVolumeLevel(0);
        }, 1200);

        if (index === lines.length - 1) {
          setTimeout(() => {
            if (runId !== demoAbortRef.current) return;
            setInCall(false);
            setStatusText("INTERVIEW ENDED");
            setSpeaker(null);
            setBrief(DEMO_DATA.args);
            onToolBuild(DEMO_DATA.args, "Demo interview");
          }, 1500);
        }
      }, delayAccum);

      delayAccum += 2200 + line.text.length * 35;
    });
  }, [onToolBuild]);

  const stopCall = useCallback(() => {
    demoAbortRef.current++;
    if (vapiInstanceRef.current) {
      try {
        vapiInstanceRef.current.stop();
      } catch (e) {}
    }
    setInCall(false);
    setStatusText("INTERVIEW ENDED");
    setVolumeLevel(0);
    setSpeaker(null);
  }, []);

  const reset = useCallback(() => {
    stopCall();
    setTranscript([]);
    setBrief(null);
    setStatusText("READY");
  }, [stopCall]);

  return {
    mode,
    setMode,
    inCall,
    statusText,
    volumeLevel,
    transcript,
    brief,
    speaker,
    startLive,
    playDemo,
    stopCall,
    reset
  };
}
