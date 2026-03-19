// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { globalStore } from "@/app/store/jotaiStore";
import { atom, useAtomValue } from "jotai";
import { memo, useCallback, useMemo, useRef, useState } from "react";

interface GeneralVisualContentProps {
    model: WaveConfigViewModel;
}

interface SettingsConfig {
    "term:showcwdintab"?: boolean;
    "term:projectdefaultcwd"?: string;
}

const defaultSettings: SettingsConfig = {
    "term:showcwdintab": false,
    "term:projectdefaultcwd": "",
};

export const GeneralVisualContent = memo(({ model }: GeneralVisualContentProps) => {
    const settingsConfigAtom = useMemo(
        () =>
            atom<SettingsConfig>((get) => {
                try {
                    const contentValue = get(model.fileContentAtom);
                    if (contentValue && contentValue.trim()) {
                        const parsed = JSON.parse(contentValue);
                        return { ...defaultSettings, ...parsed } as SettingsConfig;
                    }
                } catch (e) {
                    console.warn("Failed to parse settings config:", e);
                }
                return defaultSettings;
            }),
        [model.fileContentAtom]
    );
    const settingsConfig = useAtomValue(settingsConfigAtom);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [localCwdValue, setLocalCwdValue] = useState<string | null>(null);
    const cwdInputRef = useRef<HTMLInputElement>(null);

    const setSettingsConfig = useCallback(
        (updatedSettings: SettingsConfig) => {
            const newContent = JSON.stringify(updatedSettings, null, 2);
            globalStore.set(model.fileContentAtom, newContent);
            model.markAsEdited();
        },
        [model]
    );

    const handleToggleShowCwdInTab = useCallback(() => {
        const updatedConfig = {
            ...settingsConfig,
            "term:showcwdintab": !settingsConfig["term:showcwdintab"],
        };
        setSettingsConfig(updatedConfig);
        model.saveFile();
    }, [settingsConfig, setSettingsConfig, model]);

    const handleSetProjectDefaultPath = useCallback(
        (path: string) => {
            const updatedConfig = {
                ...settingsConfig,
                "term:projectdefaultcwd": path,
            };
            setSettingsConfig(updatedConfig);
        },
        [settingsConfig, setSettingsConfig]
    );

    const handleCwdBlur = useCallback(() => {
        if (localCwdValue !== null) {
            handleSetProjectDefaultPath(localCwdValue);
            setLocalCwdValue(null);
            model.saveFile();
        }
    }, [localCwdValue, handleSetProjectDefaultPath, model]);

    const handleCwdKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                cwdInputRef.current?.blur();
            }
        },
        []
    );

    const handleRemoveProjectDefaultPath = useCallback(() => {
        const updatedConfig = { ...settingsConfig };
        delete updatedConfig["term:projectdefaultcwd"];
        setSettingsConfig(updatedConfig);
        setShowRemoveConfirm(false);
        model.saveFile();
    }, [settingsConfig, setSettingsConfig, model]);

    const hasProjectDefault = !!settingsConfig["term:projectdefaultcwd"];

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
            <div>
                <div className="text-lg font-semibold">General Settings</div>
                <div className="text-sm text-muted-foreground mt-1">
                    Configure terminal and application behavior
                </div>
            </div>

            {/* Show CWD in Tab Toggle */}
            <div className="bg-panel border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium">Show Current Directory in Tab</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Display the current working directory in terminal tab names
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settingsConfig["term:showcwdintab"] ?? false}
                            onChange={handleToggleShowCwdInTab}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </div>
            </div>

            {/* Default Terminal Path Section */}
            <div className="bg-panel border border-border rounded-lg p-4">
                <div className="text-sm font-semibold mb-1">Default Terminal Path</div>
                <div className="text-xs text-muted-foreground mb-4">
                    Set a default working directory for new terminals
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Project Default Path</div>
                        {hasProjectDefault && (
                            <button
                                onClick={() => setShowRemoveConfirm(true)}
                                className="text-xs text-error hover:text-error/80 transition-colors"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            ref={cwdInputRef}
                            type="text"
                            value={localCwdValue !== null ? localCwdValue : (settingsConfig["term:projectdefaultcwd"] || "")}
                            onChange={(e) => setLocalCwdValue(e.target.value)}
                            onBlur={handleCwdBlur}
                            onKeyDown={handleCwdKeyDown}
                            placeholder="e.g., /home/user/workspace"
                            className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                        />
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Default working directory for all new terminals
                    </div>
                </div>
            </div>

            {/* Remove Confirmation Modal */}
            {showRemoveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowRemoveConfirm(false)}
                    />
                    <div className="relative bg-panel border border-border rounded-lg p-5 max-w-sm mx-4 shadow-lg">
                        <div className="text-sm font-semibold mb-2">Remove Default Path?</div>
                        <div className="text-xs text-muted-foreground mb-4">
                            This will delete the default path setting. New terminals will use
                            the system default directory instead.
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowRemoveConfirm(false)}
                                className="px-3 py-1.5 text-xs border border-border rounded hover:bg-secondary/30 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveProjectDefaultPath}
                                className="px-3 py-1.5 text-xs bg-error text-white rounded hover:bg-error/90 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Panel */}
            <div className="bg-panel/50 border border-border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Path Priority</div>
                <div className="text-xs text-muted-foreground">
                    When new terminals are created, the working directory is determined in this order:
                    <ol className="list-decimal list-inside mt-1 space-y-0.5">
                        <li>Block-specific default path (if set via right-click menu)</li>
                        <li>Project default path (from settings)</li>
                        <li>System default (usually home directory)</li>
                    </ol>
                </div>
            </div>
        </div>
    );
});

GeneralVisualContent.displayName = "GeneralVisualContent";
