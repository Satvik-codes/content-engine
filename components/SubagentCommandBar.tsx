"use client";

import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  Clock,
  Zap,
  Users,
  Layers,
  ArrowRight
} from "lucide-react";

export interface SubagentTask {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "idle" | "working" | "done";
  detail: string;
  doneDetail: string;
  durationMs?: number;
}

interface SubagentCommandBarProps {
  isBuilding: boolean;
  tasks: SubagentTask[];
  onSkip?: () => void;
}

export function SubagentCommandBar({
  isBuilding,
  tasks,
  onSkip
}: SubagentCommandBarProps) {
  if (!isBuilding && !tasks.some((t) => t.status === "working")) {
    return null;
  }

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Bar: Fleet Status & Overall Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-xs">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Autonomous Subagent Fleet</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold uppercase">
                  {completedCount === totalCount ? "Finalizing Assets" : "Parallel Execution"}
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              9 specialized AI agents orchestrating across channels simultaneously
            </p>
          </div>
        </div>

        {/* Progress & Skip Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-right">
            <div>
              <span className="text-xs font-bold text-slate-900 font-mono">
                {completedCount}/{totalCount}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">Complete</span>
            </div>
            <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {onSkip && completedCount < totalCount && (
            <button
              onClick={onSkip}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              title="Skip animation and display finished outputs immediately"
            >
              <span>Instant Finish</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 9-Agent Concurrency Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3.5">
        {tasks.map((agent) => {
          const isDone = agent.status === "done";
          const isWorking = agent.status === "working";

          return (
            <div
              key={agent.id}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 transition-all ${
                isDone
                  ? "bg-emerald-50/40 border-emerald-200/60 text-slate-800"
                  : isWorking
                  ? "bg-rose-50/30 border-rose-200/80 text-slate-900 shadow-2xs"
                  : "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm select-none shrink-0">{agent.avatar}</span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[11px] text-slate-900 truncate">
                      {agent.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono truncate">
                      {agent.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    {isDone ? agent.doneDetail : isWorking ? agent.detail : "Standing by..."}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0 flex items-center">
                {isDone ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Done</span>
                  </span>
                ) : isWorking ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded-md">
                    <Loader2 className="w-3 h-3 text-rose-600 animate-spin" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
