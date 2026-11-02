"use client";

import React, { useState, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { InterviewRail } from "@/components/InterviewRail";
import { StudioGrid } from "@/components/StudioGrid";
import { SubagentCommandBar, SubagentTask } from "@/components/SubagentCommandBar";
import { SettingsModal } from "@/components/SettingsModal";
import { SocialConnectModal } from "@/components/SocialConnectModal";
import { useBYOK } from "@/context/BYOKContext";
import { useVapiCall } from "@/hooks/useVapiCall";
import { BriefArgs, GeneratedWeek, ChannelStatus } from "@/types";
import { DEMO_DATA, JOB_PROMPTS, SCHEMAS, TONE_PROMPTS, SYSTEM_PROMPT } from "@/constants/prompts";
import { gemJSON, gemImage, argsFromTranscript } from "@/lib/geminiEngine";

const ALL_CHANNELS = ["li", "x", "car", "short", "ads", "news", "cal"] as const;

const INITIAL_SUBAGENT_TASKS: SubagentTask[] = [
  {
    id: "strategy",
    name: "Strategy Architect",
    role: "Brief & Hook Extraction",
    avatar: "🧠",
    status: "idle",
    detail: "Synthesizing thesis, quotes & core argument...",
    doneDetail: "Strategic brief & hook locked"
  },
  {
    id: "li",
    name: "Justin Welsh AI",
    role: "LinkedIn Solopreneur OS",
    avatar: "💼",
    status: "idle",
    detail: "Drafting 3-line mobile trailer & whitespace body...",
    doneDetail: "Viral LinkedIn post drafted"
  },
  {
    id: "x",
    name: "Dickie Bush AI",
    role: "High-Retention Thread Chainer",
    avatar: "🐦",
    status: "idle",
    detail: "Weaving 6-part curiosity loop thread...",
    doneDetail: "6-tweet chained thread ready"
  },
  {
    id: "car",
    name: "Chris Do Studio",
    role: "AIDA Carousel Designer",
    avatar: "🎨",
    status: "idle",
    detail: "Rendering 5-slide visual sequence & swipe cues...",
    doneDetail: "5-slide carousel & graphics generated"
  },
  {
    id: "short",
    name: "Video Producer",
    role: "Shorts Retention Script",
    avatar: "🎬",
    status: "idle",
    detail: "Timing 45s kinetic scenes & infinite loop hook...",
    doneDetail: "Script timed & 9:16 thumbnail set"
  },
  {
    id: "ads",
    name: "Direct-Response AI",
    role: "Conversion Ad Copywriter",
    avatar: "🖼️",
    status: "idle",
    detail: "Crafting Quote, Stat, & Offer square posters...",
    doneDetail: "3 high-converting ad posters ready"
  },
  {
    id: "news",
    name: "Editorial Essayist",
    role: "Founder Newsletter",
    avatar: "📧",
    status: "idle",
    detail: "Writing personal story-driven deep-dive...",
    doneDetail: "Newsletter issue & 16:9 banner ready"
  },
  {
    id: "story",
    name: "Viral Story AI",
    role: "Interactive Polls & Stickers",
    avatar: "📱",
    status: "idle",
    detail: "Priming binary polls & 'VOICE' DM triggers...",
    doneDetail: "3-frame story sequence primed"
  },
  {
    id: "cal",
    name: "Distribution Planner",
    role: "7-Day Publishing Cadence",
    avatar: "📅",
    status: "idle",
    detail: "Optimizing 7-day multi-channel IST posting times...",
    doneDetail: "Weekly content calendar synchronized"
  }
];

export default function Home() {
  const { config, hasGeminiKey } = useBYOK();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedWeek>({});
  const [channelStatus, setChannelStatus] = useState<Record<string, ChannelStatus>>({});
  const [subagentTasks, setSubagentTasks] = useState<SubagentTask[]>(INITIAL_SUBAGENT_TASKS);
  const [isBuilding, setIsBuilding] = useState(false);
  const [lastBrief, setLastBrief] = useState<BriefArgs | null>(null);
  const demoTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Instant finish demo mode without waiting for animations
  const handleInstantFinishDemo = useCallback(() => {
    demoTimersRef.current.forEach((t) => clearTimeout(t));
    demoTimersRef.current = [];
    setGeneratedContent(DEMO_DATA.out as any);
    const doneStatus: Record<string, ChannelStatus> = {};
    ALL_CHANNELS.forEach((ch) => {
      doneStatus[ch] = { writing: false, generatingImages: false, done: true };
    });
    setChannelStatus(doneStatus);
    setSubagentTasks((prev) =>
      prev.map((t) => ({ ...t, status: "done" as const }))
    );
    setIsBuilding(false);
  }, []);

  // Parallel generation orchestrator
  const buildWeekContent = useCallback(
    async (brief: BriefArgs, source: string) => {
      setLastBrief(brief);
      setIsBuilding(true);

      // Clear any pending demo timers
      demoTimersRef.current.forEach((t) => clearTimeout(t));
      demoTimersRef.current = [];

      // Reset content & set initial writing status for all channels
      setGeneratedContent({});
      const initialStatus: Record<string, ChannelStatus> = {};
      ALL_CHANNELS.forEach((ch) => {
        initialStatus[ch] = { writing: true, generatingImages: false, done: false };
      });
      setChannelStatus(initialStatus);

      // Start all subagent tasks
      setSubagentTasks((prev) =>
        prev.map((t) => ({ ...t, status: "working" as const }))
      );

      // In DEMO mode or if no Gemini key is provided, simulate realistic parallel progressive completion
      if (!hasGeminiKey) {
        const demoSchedule: { ch: keyof GeneratedWeek; subagentId: string; delay: number }[] = [
          { ch: "li", subagentId: "strategy", delay: 250 },
          { ch: "li", subagentId: "li", delay: 550 },
          { ch: "x", subagentId: "x", delay: 950 },
          { ch: "car", subagentId: "car", delay: 1350 },
          { ch: "short", subagentId: "short", delay: 1750 },
          { ch: "ads", subagentId: "ads", delay: 2150 },
          { ch: "news", subagentId: "news", delay: 2550 },
          { ch: "cal", subagentId: "cal", delay: 2950 }
        ];

        demoSchedule.forEach(({ ch, subagentId, delay }, index) => {
          const timer = setTimeout(() => {
            const assetData = (DEMO_DATA.out as any)[ch];
            if (assetData) {
              setGeneratedContent((prev) => ({ ...prev, [ch]: assetData }));
              setChannelStatus((prev) => ({
                ...prev,
                [ch]: { writing: false, generatingImages: false, done: true }
              }));
            }

            setSubagentTasks((prev) =>
              prev.map((t) =>
                t.id === subagentId || (subagentId === "cal" && t.id === "story")
                  ? { ...t, status: "done" as const }
                  : t
              )
            );

            if (index === demoSchedule.length - 1) {
              setSubagentTasks((prev) =>
                prev.map((t) => ({ ...t, status: "done" as const }))
              );
              setIsBuilding(false);
            }
          }, delay);

          demoTimersRef.current.push(timer);
        });

        return;
      }

      // Live Gemini Mode: Concurrent parallel API workers
      const toneInstruction = TONE_PROMPTS[config.preferredTone] || TONE_PROMPTS.founder;

      await Promise.all(
        ALL_CHANNELS.map(async (ch) => {
          try {
            const systemPrompt = `${SYSTEM_PROMPT}\n\n${toneInstruction}\n\nYour job for ${ch.toUpperCase()}:\n${JOB_PROMPTS[ch]}`;

            const userPrompt = `Brief (JSON):\n${JSON.stringify(
              brief,
              null,
              2
            )}\n\nCreator Name: ${config.creatorName}`;

            const result = await gemJSON(
              config.geminiApiKey,
              config.textModel,
              systemPrompt,
              userPrompt,
              SCHEMAS[ch]
            );

            setGeneratedContent((prev) => ({ ...prev, [ch]: result }));
            setChannelStatus((prev) => ({
              ...prev,
              [ch]: {
                writing: false,
                generatingImages: ch === "li" && Boolean(result.image_prompt),
                done: true
              }
            }));

            setSubagentTasks((prev) =>
              prev.map((t) =>
                t.id === ch || (ch === "li" && t.id === "strategy")
                  ? { ...t, status: "done" as const }
                  : t
              )
            );

            // Optional background image generation for LinkedIn
            if (ch === "li" && result.image_prompt) {
              gemImage(config.geminiApiKey, config.imageModel, result.image_prompt, "16:9")
                .then((url) => {
                  setGeneratedContent((prev) => ({
                    ...prev,
                    li: { ...prev.li!, imageUrl: url }
                  }));
                  setChannelStatus((prev) => ({
                    ...prev,
                    li: { ...prev.li!, generatingImages: false }
                  }));
                })
                .catch((imgErr) => {
                  console.error("LinkedIn image generation error:", imgErr);
                  setChannelStatus((prev) => ({
                    ...prev,
                    li: { ...prev.li!, generatingImages: false }
                  }));
                });
            }
          } catch (e: any) {
            console.error(`Error generating channel ${ch}:`, e);
            setChannelStatus((prev) => ({
              ...prev,
              [ch]: { writing: false, generatingImages: false, done: false, error: e?.message || "Failed to generate" }
            }));
            setSubagentTasks((prev) =>
              prev.map((t) =>
                t.id === ch ? { ...t, status: "done" as const, doneDetail: "Fallback generated" } : t
              )
            );
          }
        })
      );

      setIsBuilding(false);
    },
    [config, hasGeminiKey]
  );

  // Single-channel regenerator
  const handleRegenerateChannel = useCallback(
    async (ch: string) => {
      if (!lastBrief) return;

      setChannelStatus((prev) => ({
        ...prev,
        [ch]: { writing: true, generatingImages: false, done: false }
      }));

      if (!hasGeminiKey) {
        setTimeout(() => {
          const assetData = (DEMO_DATA.out as any)[ch];
          if (assetData) {
            setGeneratedContent((prev) => ({ ...prev, [ch]: assetData }));
            setChannelStatus((prev) => ({
              ...prev,
              [ch]: { writing: false, generatingImages: false, done: true }
            }));
          }
        }, 700);
        return;
      }

      try {
        const toneInstruction = TONE_PROMPTS[config.preferredTone] || TONE_PROMPTS.founder;
        const systemPrompt = `${SYSTEM_PROMPT}\n\n${toneInstruction}\n\nYour job for ${ch.toUpperCase()}:\n${JOB_PROMPTS[ch]}`;
        const userPrompt = `Brief (JSON):\n${JSON.stringify(lastBrief, null, 2)}\n\nCreator Name: ${config.creatorName}`;

        const result = await gemJSON(
          config.geminiApiKey,
          config.textModel,
          systemPrompt,
          userPrompt,
          SCHEMAS[ch]
        );

        setGeneratedContent((prev) => ({ ...prev, [ch]: result }));
        setChannelStatus((prev) => ({
          ...prev,
          [ch]: { writing: false, generatingImages: false, done: true }
        }));
      } catch (e: any) {
        setChannelStatus((prev) => ({
          ...prev,
          [ch]: { writing: false, generatingImages: false, done: false, error: e?.message || "Regeneration failed" }
        }));
      }
    },
    [config, hasGeminiKey, lastBrief]
  );

  const {
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
    skipDemoToResults,
    stopCall,
    reset
  } = useVapiCall(config.vapiPublicKey, buildWeekContent);

  const handleStartLive = () => {
    if (!config.vapiPublicKey.trim()) {
      setIsSettingsOpen(true);
      return;
    }
    startLive(config.creatorName, config.voiceId, config.vapiAssistantId);
  };

  const handleBuildFromTyped = async (typedText: string) => {
    if (!hasGeminiKey) {
      // In demo/free mode: use demo brief & kick off realistic parallel build
      await buildWeekContent(DEMO_DATA.args, "Typed input (Demo)");
      return;
    }

    try {
      setIsBuilding(true);
      const extractedBrief = await argsFromTranscript(
        config.geminiApiKey,
        config.textModel,
        typedText
      );
      await buildWeekContent(extractedBrief, "Typed input");
    } catch (e: any) {
      alert("Failed to extract brief from input: " + e.message);
      setIsBuilding(false);
    }
  };

  const handleResetAll = () => {
    demoTimersRef.current.forEach((t) => clearTimeout(t));
    demoTimersRef.current = [];
    reset();
    setGeneratedContent({});
    setChannelStatus({});
    setSubagentTasks(INITIAL_SUBAGENT_TASKS);
    setIsBuilding(false);
    setLastBrief(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        mode={mode}
        setMode={setMode}
        statusText={statusText}
        inCall={inCall}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSocials={() => setIsSocialsOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-[1760px] w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row items-start gap-6">
        {/* Left Rail: The Interviewer */}
        <InterviewRail
          mode={mode}
          inCall={inCall}
          statusText={statusText}
          volumeLevel={volumeLevel}
          speaker={speaker}
          transcript={transcript}
          brief={brief || lastBrief}
          onStartLive={handleStartLive}
          onPlayDemo={playDemo}
          onSkipDemo={skipDemoToResults}
          onStopCall={stopCall}
          onReset={handleResetAll}
          onBuildFromTyped={handleBuildFromTyped}
          isBuilding={isBuilding}
        />

        {/* Right Studio Column: Multi-Platform Previews & Subagents */}
        <div className="flex-1 w-full flex flex-col min-w-0">
          <SubagentCommandBar
            isBuilding={isBuilding}
            tasks={subagentTasks}
            onSkip={handleInstantFinishDemo}
          />

          <StudioGrid
            content={generatedContent}
            status={channelStatus}
            isBuilding={isBuilding}
            onRegenerateChannel={handleRegenerateChannel}
          />
        </div>
      </main>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <SocialConnectModal isOpen={isSocialsOpen} onClose={() => setIsSocialsOpen(false)} />
    </div>
  );
}
