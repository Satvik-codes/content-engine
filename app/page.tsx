"use client";

import React, { useState, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { InterviewRail } from "@/components/InterviewRail";
import { StudioGrid } from "@/components/StudioGrid";
import { SettingsModal } from "@/components/SettingsModal";
import { SocialConnectModal } from "@/components/SocialConnectModal";
import { useBYOK } from "@/context/BYOKContext";
import { useVapiCall } from "@/hooks/useVapiCall";
import { BriefArgs, GeneratedWeek, ChannelStatus } from "@/types";
import { DEMO_DATA, JOB_PROMPTS, SCHEMAS, TONE_PROMPTS, SYSTEM_PROMPT } from "@/constants/prompts";
import { gemJSON, gemImage, argsFromTranscript } from "@/lib/geminiEngine";

const ALL_CHANNELS = ["li", "x", "car", "short", "ads", "news", "cal"] as const;

export default function Home() {
  const { config, hasGeminiKey } = useBYOK();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedWeek>({});
  const [channelStatus, setChannelStatus] = useState<Record<string, ChannelStatus>>({});
  const [isBuilding, setIsBuilding] = useState(false);
  const [lastBrief, setLastBrief] = useState<BriefArgs | null>(null);
  const demoTimersRef = useRef<NodeJS.Timeout[]>([]);

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

      // In DEMO mode or if no Gemini key is provided, simulate realistic parallel progressive completion
      if (!hasGeminiKey) {
        const demoSchedule: { ch: keyof GeneratedWeek; delay: number }[] = [
          { ch: "li", delay: 400 },
          { ch: "x", delay: 750 },
          { ch: "car", delay: 1100 },
          { ch: "short", delay: 1450 },
          { ch: "ads", delay: 1750 },
          { ch: "news", delay: 2000 },
          { ch: "cal", delay: 2250 }
        ];

        demoSchedule.forEach(({ ch, delay }, index) => {
          const timer = setTimeout(() => {
            const assetData = (DEMO_DATA.out as any)[ch];
            if (assetData) {
              setGeneratedContent((prev) => ({ ...prev, [ch]: assetData }));
              setChannelStatus((prev) => ({
                ...prev,
                [ch]: { writing: false, generatingImages: false, done: true }
              }));
            }

            if (index === demoSchedule.length - 1) {
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
      const briefToUse = lastBrief || DEMO_DATA.args;
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
        }, 600);
        return;
      }

      try {
        const toneInstruction = TONE_PROMPTS[config.preferredTone] || TONE_PROMPTS.founder;
        const systemPrompt = `${SYSTEM_PROMPT}\n\n${toneInstruction}\n\nYour job for ${ch.toUpperCase()}:\n${JOB_PROMPTS[ch]}`;
        const userPrompt = `Brief (JSON):\n${JSON.stringify(
          briefToUse,
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
          onStopCall={stopCall}
          onReset={handleResetAll}
          onBuildFromTyped={handleBuildFromTyped}
          isBuilding={isBuilding}
        />

        {/* Right Studio Grid: Multi-Platform Previews */}
        <StudioGrid
          content={generatedContent}
          status={channelStatus}
          isBuilding={isBuilding}
          onRegenerateChannel={handleRegenerateChannel}
        />
      </main>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <SocialConnectModal isOpen={isSocialsOpen} onClose={() => setIsSocialsOpen(false)} />
    </div>
  );
}
