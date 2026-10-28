"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BYOKConfig, SocialPlatform, SocialAccount } from "@/types";

const DEFAULT_CONFIG: BYOKConfig = {
  vapiPublicKey: "",
  vapiAssistantId: "",
  geminiApiKey: "",
  openaiApiKey: "",
  creatorName: "Ojas K",
  creatorRole: "Founder",
  preferredTone: "founder",
  voiceId: "Naina",
  textModel: "gemini-2.5-flash",
  imageModel: "gemini-2.5-flash-image",
  n8nWebhookUrl: "https://n8n-production-d44b0.up.railway.app/webhook/content-engine",
  notificationEmail: "creator@example.com",
  socialAccounts: {
    linkedin: { connected: false },
    twitter: { connected: false },
    instagram: { connected: false },
    youtube: { connected: false }
  }
};

interface BYOKContextType {
  config: BYOKConfig;
  updateConfig: (newCfg: Partial<BYOKConfig>) => void;
  updateSocialAccount: (platform: SocialPlatform, account: Partial<SocialAccount>) => void;
  disconnectSocialAccount: (platform: SocialPlatform) => void;
  isReady: boolean;
  hasGeminiKey: boolean;
  hasVapiKey: boolean;
}

const BYOKContext = createContext<BYOKContextType>({
  config: DEFAULT_CONFIG,
  updateConfig: () => {},
  updateSocialAccount: () => {},
  disconnectSocialAccount: () => {},
  isReady: false,
  hasGeminiKey: false,
  hasVapiKey: false
});

const STORAGE_KEY = "byok_content_engine_v1";

export function BYOKProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BYOKConfig>(DEFAULT_CONFIG);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically migrate legacy models
        if (parsed.textModel === "gemini-2.5-pro" || parsed.textModel === "models/gemini-2.5-pro") {
          parsed.textModel = "gemini-3.1-pro-preview";
        }
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          socialAccounts: {
            ...DEFAULT_CONFIG.socialAccounts,
            ...(parsed.socialAccounts || {})
          }
        });
      }
    } catch (e) {
      console.error("Failed to load BYOK configuration:", e);
    }
    setIsReady(true);
  }, []);

  const updateConfig = (newCfg: Partial<BYOKConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newCfg };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist BYOK configuration:", e);
      }
      return updated;
    });
  };

  const updateSocialAccount = (platform: SocialPlatform, account: Partial<SocialAccount>) => {
    setConfig((prev) => {
      const updatedAccounts = {
        ...prev.socialAccounts,
        [platform]: {
          ...prev.socialAccounts[platform],
          ...account,
          connected: true
        }
      };
      const updated = { ...prev, socialAccounts: updatedAccounts };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist social accounts:", e);
      }
      return updated;
    });
  };

  const disconnectSocialAccount = (platform: SocialPlatform) => {
    setConfig((prev) => {
      const updatedAccounts = {
        ...prev.socialAccounts,
        [platform]: { connected: false }
      };
      const updated = { ...prev, socialAccounts: updatedAccounts };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist social accounts:", e);
      }
      return updated;
    });
  };

  return (
    <BYOKContext.Provider
      value={{
        config,
        updateConfig,
        updateSocialAccount,
        disconnectSocialAccount,
        isReady,
        hasGeminiKey: Boolean(config.geminiApiKey.trim()),
        hasVapiKey: Boolean(config.vapiPublicKey.trim())
      }}
    >
      {children}
    </BYOKContext.Provider>
  );
}

export const useBYOK = () => useContext(BYOKContext);
