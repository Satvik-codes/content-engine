"use client";

import React, { useState, useEffect } from "react";
import { useBYOK } from "@/context/BYOKContext";
import {
  testGeminiConnection,
  fetchAvailableModels,
  resolveModelName,
  GeminiModelInfo
} from "@/lib/geminiEngine";
import { X, Key, Sparkles, CheckCircle2, AlertCircle, Radio, RefreshCw } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURATED_DEFAULT_MODELS: GeminiModelInfo[] = [
  {
    name: "gemini-3.1-pro-preview",
    displayName: "Gemini 3.1 Pro Preview (Latest Reasoning - Recommended)",
    isRecommended: true
  },
  {
    name: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash (Ultra-fast, ~1s)",
    isRecommended: true
  },
  {
    name: "gemini-3-flash-preview",
    displayName: "Gemini 3 Flash Preview (Agentic)",
    isRecommended: false
  }
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { config, updateConfig } = useBYOK();
  const [formData, setFormData] = useState({
    ...config,
    textModel: resolveModelName(config.textModel)
  });
  const [testingGemini, setTestingGemini] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; msg?: string } | null>(null);
  const [availableModels, setAvailableModels] = useState<GeminiModelInfo[]>(CURATED_DEFAULT_MODELS);
  const [fetchingModels, setFetchingModels] = useState(false);

  useEffect(() => {
    setFormData({
      ...config,
      textModel: resolveModelName(config.textModel)
    });
  }, [config]);

  // Auto-fetch available models if a key already exists
  useEffect(() => {
    if (isOpen && formData.geminiApiKey.trim()) {
      handleFetchLiveModels(formData.geminiApiKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchLiveModels = async (keyToUse?: string) => {
    const key = (keyToUse || formData.geminiApiKey).trim();
    if (!key) return;
    setFetchingModels(true);
    try {
      const models = await fetchAvailableModels(key);
      if (models.length > 0) {
        setAvailableModels(models);
        // If current model isn't in fetched list, keep or select recommended
        if (!models.some((m) => m.name === formData.textModel)) {
          const rec =
            models.find((m) => m.name === "gemini-3.1-pro-preview") ||
            models.find((m) => m.name === "gemini-2.5-flash") ||
            models[0];
          if (rec) {
            setFormData((prev) => ({ ...prev, textModel: rec.name }));
          }
        }
      }
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = () => {
    updateConfig({
      ...formData,
      textModel: resolveModelName(formData.textModel)
    });
    onClose();
  };

  const handleTestGemini = async () => {
    if (!formData.geminiApiKey.trim()) {
      setTestResult({ success: false, msg: "Please enter a Gemini API Key first." });
      return;
    }
    setTestingGemini(true);
    setTestResult(null);

    const modelToTest = resolveModelName(formData.textModel);
    const res = await testGeminiConnection(formData.geminiApiKey, modelToTest);
    setTestingGemini(false);

    if (res.success) {
      setTestResult({
        success: true,
        msg: `Connection verified using ${res.resolvedModel} in ${res.latencySec.toFixed(2)}s!`
      });
      // Also fetch live model list to populate dropdown
      handleFetchLiveModels(formData.geminiApiKey);
    } else {
      setTestResult({
        success: false,
        msg: res.error || "Connection test failed."
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">BYOK Settings</h2>
              <p className="text-xs text-slate-500">Keys stay on your device and are never stored on any server.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Creator Profile */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Creator Name</label>
              <input
                type="text"
                value={formData.creatorName}
                onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                placeholder="e.g. Ojas K"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role / Bio</label>
              <input
                type="text"
                value={formData.creatorRole}
                onChange={(e) => setFormData({ ...formData, creatorRole: e.target.value })}
                placeholder="e.g. Founder, Tech Builder"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
              />
            </div>
          </div>

          {/* Voice Interview Engine (Vapi) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                Vapi Voice Configuration
              </label>
              <a
                href="https://dashboard.vapi.ai"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-rose-600 hover:underline"
              >
                Get Vapi Key &rarr;
              </a>
            </div>
            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  value={formData.vapiPublicKey}
                  onChange={(e) => setFormData({ ...formData, vapiPublicKey: e.target.value })}
                  placeholder="Paste your Vapi Public Key (pk_...)"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Voice Persona</label>
                  <select
                    value={formData.voiceId}
                    onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white text-xs focus:outline-none"
                  >
                    <option value="Naina">Naina (Warm Indian English)</option>
                    <option value="Kavya">Kavya (Expressive Conversational)</option>
                    <option value="Aria">Aria (Modern Professional)</option>
                    <option value="Jenny">Jenny (Energetic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Custom Assistant ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.vapiAssistantId || ""}
                    onChange={(e) => setFormData({ ...formData, vapiAssistantId: e.target.value })}
                    placeholder="Leave empty for auto-agent"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Content Generation Engine (Gemini) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Google Gemini Engine (Interactions API)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-600 hover:underline"
              >
                Get Gemini Key &rarr;
              </a>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  placeholder="Paste your Google Gemini API Key"
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleTestGemini}
                  disabled={testingGemini}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  {testingGemini ? "Testing..." : "Test Key"}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.msg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-500">Text Generation Model</label>
                    <button
                      type="button"
                      onClick={() => handleFetchLiveModels()}
                      disabled={fetchingModels || !formData.geminiApiKey.trim()}
                      className="text-[10px] text-amber-600 hover:text-amber-700 flex items-center gap-1 disabled:opacity-40"
                      title="Fetch live model list from Google API"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${fetchingModels ? "animate-spin" : ""}`} />
                      {fetchingModels ? "Fetching..." : "Fetch Models"}
                    </button>
                  </div>
                  <select
                    value={formData.textModel}
                    onChange={(e) => setFormData({ ...formData, textModel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white text-xs focus:outline-none"
                  >
                    {availableModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Image Model</label>
                  <select
                    value={formData.imageModel}
                    onChange={(e) => setFormData({ ...formData, imageModel: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white text-xs focus:outline-none"
                  >
                    <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
                    <option value="gemini-2.0-flash-preview-image-generation">
                      Gemini 2.0 Flash Preview Image
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook & Scheduling */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              n8n / Distribution Webhook URL
            </label>
            <input
              type="text"
              value={formData.n8nWebhookUrl}
              onChange={(e) => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
              placeholder="https://your-n8n.railway.app/webhook/..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 text-xs font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
