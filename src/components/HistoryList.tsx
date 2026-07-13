import React, { useMemo } from 'react';
import { History, Trash2 } from 'lucide-react';
import { HistoryItem, ViewType } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onClear: () => void;
  isDarkMode: boolean;
  activeView: ViewType;
}

export default function HistoryList({ history, onClear, isDarkMode, activeView }: HistoryListProps) {
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      switch (activeView) {
        case "cps":
          return item.testType === "Standard Left Click";
        case "spacebar":
          return item.testType === "Spacebar Counter";
        case "rightclick":
          return item.testType === "Right Click Test" || item.testType === "Right Click CPS";
        case "polling":
          return item.testType === "Mouse Polling Rate";
        case "ghosting":
          return item.testType === "Key Rollover" || item.testType === "Key Ghosting";
        case "jitter":
          return item.testType === "Jitter Click Coach" || item.testType === "Technique Trainer";
        case "butterfly":
          return item.testType === "Butterfly Click Coach";
        case "reaction":
          return item.testType === "Reaction Time Test";
        case "kohi":
          return item.testType === "Kohi Retro Test";
        case "dragclick":
          return item.testType === "Drag Click Test" || item.testType === "Drag Left Click" || item.testType === "Drag Right Click";
        case "doubleclick":
          return item.testType === "Double Click Test";
        case "aim":
          return item.testType === "Aim Trainer";
        case "scroll":
          return item.testType === "Scroll Speed Test";
        default:
          return false;
      }
    });
  }, [history, activeView]);

  const randomEmptyMessage = useMemo(() => {
    const messages = [
      "🦗 Crickets chirping... Your clicks are so silent we can hear dust landing. Give it a tap!",
      "🏜️ Looks like a ghost town here. Are you even holding a mouse, or just pointing at the screen?",
      "💨 Zero signs of mechanical life here. Did your fingers take a sabbatical?",
      "🫙 This history list is emptier than a gamer's fridge at 4 AM. Let's make some noise!",
      "🕸️ Spiders have started web-developing in this tab. Sweep 'em away with some taps!",
      "🛌 Current activity level: hibernating koala. Wake up those muscles!",
      "🧊 Frozen in time. Let's break the ice and start clicking already!",
      "🧘 Deep, meditative stillness... but we're here for speed! Get clicking!",
      "🛸 No signals received. Are your clicks lost in deep space? Initiate the thrusters!",
      "📉 An absolute flatline. Quick, grab your peripheral and resuscitate this dashboard!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [activeView]);

  const formatScore = (item: HistoryItem) => {
    if (item.testType === "Mouse Polling Rate") {
      return `${item.score.toFixed(0)} Hz`;
    }
    if (item.testType === "Key Rollover" || item.testType === "Key Ghosting") {
      return `${item.score.toFixed(0)} Keys`;
    }
    if (item.testType === "Reaction Time Test" || item.testType === "Double Click Test") {
      return `${item.score.toFixed(1)} ms`;
    }
    if (item.testType === "Aim Trainer") {
      return `${item.score.toFixed(0)} Hits`;
    }
    if (item.testType === "Scroll Speed Test") {
      return `${item.score.toFixed(0)} Steps`;
    }
    return item.score.toFixed(2);
  };

  const handleClearFiltered = () => {
    // Only clear filtered items if needed, or clear all as before.
    // The previous behavior was clearing everything. Let's clear everything but only show button when active items exist.
    onClear();
  };

  if (activeView === "dragclick") {
    const leftDragHistory = filteredHistory.filter(item => item.testType === "Drag Left Click");
    const rightDragHistory = filteredHistory.filter(item => item.testType === "Drag Right Click");

    const renderDragTable = (title: string, items: HistoryItem[]) => (
      <div className={`flex-1 overflow-hidden rounded-2xl border transition-all ${
        isDarkMode
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white shadow-xs"
      }`}>
        <div className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b ${
          isDarkMode ? "border-white/10 text-slate-400 bg-white/[0.02]" : "border-slate-200 text-slate-500 bg-slate-50"
        }`}>
          {title}
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center min-h-[140px]">
            <p className="text-xs italic text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              No activity recorded
            </p>
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className={`border-b font-semibold ${
                  isDarkMode 
                    ? "border-white/5 text-slate-400 bg-white/[0.01]" 
                    : "border-slate-100 text-slate-500 bg-slate-50/50"
                }`}>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">CPS</th>
                  <th className="px-3 py-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const date = new Date(item.timestamp);
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr
                      key={item.id}
                      className={`border-b last:border-0 transition-colors ${
                        isDarkMode 
                          ? "border-white/5 text-slate-300 hover:bg-white/[0.02]" 
                          : "border-slate-100 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-3 py-2 font-medium">
                        {item.duration > 0 ? `${Number.isInteger(item.duration) ? item.duration : item.duration.toFixed(1)}s` : "Manual"}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        <span className="theme-text-from-dynamic">{formatScore(item)}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal ml-1">
                          ({item.rating})
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-slate-500 dark:text-slate-400">
                        <span>{timeStr}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );

    return (
      <section className="w-full animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 theme-text-from" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Recent Activity
            </h2>
          </div>
          {filteredHistory.length > 0 && (
            <button
              onClick={handleClearFiltered}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                isDarkMode 
                  ? "text-slate-400 hover:text-red-400 hover:bg-white/5" 
                  : "text-slate-600 hover:text-red-600 hover:bg-slate-100"
              }`}
              title="Clear all recent test scores"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderDragTable("Left Click Drag", leftDragHistory)}
          {renderDragTable("Right Click Drag", rightDragHistory)}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 theme-text-from" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Recent Activity
          </h2>
        </div>
        {filteredHistory.length > 0 && (
          <button
            onClick={handleClearFiltered}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
              isDarkMode 
                ? "text-slate-400 hover:text-red-400 hover:bg-white/5" 
                : "text-slate-600 hover:text-red-600 hover:bg-slate-100"
            }`}
            title="Clear all recent test scores"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-2xl border ${
          isDarkMode
            ? "border-white/10 bg-white/5"
            : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center min-h-[140px]">
            <p className="text-xs italic text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto">
              "{randomEmptyMessage}"
            </p>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className={`border-b font-semibold ${
                  isDarkMode 
                    ? "border-white/10 text-slate-400 bg-white/[0.02]" 
                    : "border-slate-200 text-slate-500 bg-slate-50"
                }`}>
                  <th className="px-4 py-3">Test Mode</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const date = new Date(item.timestamp);
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  
                  return (
                    <tr
                      key={item.id}
                      className={`border-b last:border-0 transition-colors ${
                        isDarkMode 
                          ? "border-white/5 text-slate-300 hover:bg-white/[0.02]" 
                          : "border-slate-100 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">
                        <span>{item.testType}</span>
                        {item.duration > 0 && (
                          <span className="ml-1.5 text-[10px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-semibold uppercase">
                            {Number.isInteger(item.duration) ? item.duration : item.duration.toFixed(2)}s
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        <span className="theme-text-from-dynamic">{formatScore(item)}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal ml-1">
                          ({item.rating})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500 dark:text-slate-400">
                        <span>{dateStr}, {timeStr}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
