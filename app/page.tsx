"use client";

import React, { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { InterviewRail } from "@/components/InterviewRail";
import { StudioGrid } from "@/components/StudioGrid";
import { SettingsModal } from "@/components/SettingsModal";
import { SocialConnectModal } from "@/components/SocialConnectModal";
import { useBYOK } from "@/context/BYOKContext";
import { useVapiCall } from "@/hooks/useVapiCall";
import { BriefArgs, GeneratedWeek, ChannelStatus } from "@/types";
import { DEMO_DATA, JOB_PROMPTS, SCHEMAS, TONE_PROMPTS } from "@/constants/prompts";
import { gemJSON, gemImage, argsFromTranscript } from "@/lib/geminiEngine";

export default function Home() {
  const { config, hasGeminiKey } = useBYOK();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedWeek>({});
  const [channelStatus, setChannelStatus] = useState<Record<string, ChannelStatus>>({});
  const [isBuilding, setIsBuilding] = useState(false);

  // Parallel generation orchestrator
  const buildWeekContent = useCallback(
    async (brief: BriefArgs, source: string) => {
      setIsBuilding(true);

      // In DEMO mode or if no Gemini key is provided, load the realistic pre-computed demo set
      if (!hasGeminiKey) {
        setTimeout(() => {
          setGeneratedContent(DEMO_DATA.out);
          setIsBuilding(false);
        }, 1200);
        return;
      }

      const channels = ["li", "x", "car", "short", "story", "ads", "news", "cal"] as const;
      const toneInstruction = TONE_PROMPTS[config.preferredTone] || TONE_PROMPTS.founder;

      // Reset content
      setGeneratedContent({});

      await Promise.all(
        channels.map(async (ch) => {
          setChannelStatus((prev) => ({
            ...prev,
            [ch]: { writing: true, generatingImages: false, done: false }
          }));

          try {
            const systemPrompt = `You are the ${ch} writer in a content team for an Indian creator. Write ONLY from the interview and brief: keep their story, their numbers and their exact quotes; never invent facts, names, stats or results they did not say. India context. No emoji. No em dashes. ${toneInstruction}\n\nYour job: ${JOB_PROMPTS[ch]}`;

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
              [ch]: { writing: false, generatingImages: true, done: true }
            }));

            // Optional background image generation
            if (ch === "li" && result.image_prompt) {
              gemImage(config.geminiApiKey, config.imageModel, result.image_prompt, "16:9")
                .then((url) => {
                  setGeneratedContent((prev) => ({
                    ...prev,
                    li: { ...prev.li!, imageUrl: url }
                  }));
                })
                .catch(console.error);
            }
          } catch (e: any) {
            console.error(`Error generating ${ch}:`, e);
            setChannelStatus((prev) => ({
              ...prev,
              [ch]: { writing: false, generatingImages: false, done: false, error: e.message }
            }));
          }
        })
      );

      setIsBuilding(false);
    },
    [config, hasGeminiKey]
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
      // In demo/free mode
      setGeneratedContent(DEMO_DATA.out);
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
          brief={brief}
          onStartLive={handleStartLive}
          onPlayDemo={playDemo}
          onStopCall={stopCall}
          onReset={reset}
          onBuildFromTyped={handleBuildFromTyped}
          isBuilding={isBuilding}
        />

        {/* Right Studio Grid: 6 Platform Previews */}
        <StudioGrid content={generatedContent} status={channelStatus} />
      </main>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <SocialConnectModal isOpen={isSocialsOpen} onClose={() => setIsSocialsOpen(false)} />
    </div>
  );
}
