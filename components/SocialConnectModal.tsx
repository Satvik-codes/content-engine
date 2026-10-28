"use client";

import React, { useState } from "react";
import { useBYOK } from "@/context/BYOKContext";
import { SocialPlatform } from "@/types";
import { X, Check, Share2, Key } from "lucide-react";
import { LinkedinIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from "./Icons";

interface SocialConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialConnectModal({ isOpen, onClose }: SocialConnectModalProps) {
  const { config, updateSocialAccount, disconnectSocialAccount } = useBYOK();
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | null>(null);
  const [inputToken, setInputToken] = useState("");
  const [inputUserId, setInputUserId] = useState("");
  const [accountHandle, setAccountHandle] = useState("");

  if (!isOpen) return null;

  const platforms: {
    id: SocialPlatform;
    name: string;
    icon: any;
    color: string;
    description: string;
    tokenLabel: string;
    needsUserId?: boolean;
    userIdLabel?: string;
  }[] = [
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: LinkedinIcon,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Auto-post thought leadership articles, images, and founder stories.",
      tokenLabel: "OAuth Access Token (w_member_social)",
      needsUserId: true,
      userIdLabel: "Person URN (e.g. 78aBcDeF)"
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: TwitterIcon,
      color: "text-slate-900 bg-slate-50 border-slate-200",
      description: "Auto-publish 6-tweet threaded stories with media attachments.",
      tokenLabel: "OAuth 2.0 User Access Token (tweet.write)"
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: InstagramIcon,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description: "Direct publish 5-slide visual carousels and story poll frames.",
      tokenLabel: "Meta Graph API User Token",
      needsUserId: true,
      userIdLabel: "Instagram Business Account ID"
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: YoutubeIcon,
      color: "text-red-600 bg-red-50 border-red-200",
      description: "Upload vertical Shorts with metadata, tags, and teleprompter captions.",
      tokenLabel: "Google OAuth 2.0 Token (youtube.upload)"
    }
  ];

  const handleOpenConnect = (p: SocialPlatform) => {
    setActivePlatform(p);
    const existing = config.socialAccounts[p];
    setInputToken(existing.accessToken || "");
    setInputUserId(existing.userId || "");
    setAccountHandle(existing.accountName || "");
  };

  const handleSaveConnection = () => {
    if (!activePlatform) return;
    updateSocialAccount(activePlatform, {
      accountName: accountHandle || `@${activePlatform}_user`,
      accessToken: inputToken.trim(),
      userId: inputUserId.trim()
    });
    setActivePlatform(null);
  };

  const handleSimulateQuickConnect = (p: SocialPlatform) => {
    updateSocialAccount(p, {
      accountName: `@${config.creatorName.toLowerCase().replace(/\s+/g, "")}_official`,
      accessToken: `simulated_token_${Date.now()}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Connect Social Accounts</h2>
              <p className="text-xs text-slate-500">Enable one-click publishing and scheduled auto-uploads.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const account = config.socialAccounts[platform.id];
            const isConnected = account?.connected;

            return (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${platform.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{platform.name}</h4>
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Connected ({account.accountName})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{platform.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <button
                      onClick={() => disconnectSocialAccount(platform.id)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSimulateQuickConnect(platform.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        title="Simulate connection without API token"
                      >
                        Demo Connect
                      </button>
                      <button
                        onClick={() => handleOpenConnect(platform.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
                      >
                        Add Token
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Token Input Drawer */}
          {activePlatform && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  Connect {platforms.find((p) => p.id === activePlatform)?.name}
                </span>
                <button
                  onClick={() => setActivePlatform(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Account Handle / Label</label>
                <input
                  type="text"
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  {platforms.find((p) => p.id === activePlatform)?.tokenLabel}
                </label>
                <input
                  type="password"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Paste OAuth access token"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none"
                />
              </div>

              {platforms.find((p) => p.id === activePlatform)?.needsUserId && (
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    {platforms.find((p) => p.id === activePlatform)?.userIdLabel}
                  </label>
                  <input
                    type="text"
                    value={inputUserId}
                    onChange={(e) => setInputUserId(e.target.value)}
                    placeholder="User / Page ID"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none"
                  />
                </div>
              )}

              <button
                onClick={handleSaveConnection}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Save & Link Account
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
