// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { getApi } from "@/app/store/global";
import { globalStore } from "@/app/store/jotaiStore";
import { cn } from "@/util/util";
import { atom, useAtomValue } from "jotai";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { base64ToString, stringToBase64 } from "@/util/util";
import { RpcApi } from "@/app/store/wshclientapi";
import { TabRpcClient } from "@/app/store/wshrpcutil";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

const ColorInput = memo(({ label, value, onChange, description }: ColorInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      setLocalValue(newValue);
    },
    [onChange, setLocalValue]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    },
    [setLocalValue]
  );

  const handleMouseDown = useCallback(() => {
    // If color input mode is needed, can be handled by parent component
  }, []);

  const handleTextBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const newValue = localValue.trim();
      if (!newValue) {
        onChange("#000000");
        setLocalValue("#000000");
      } else {
        onChange(newValue);
      }
    },
    [localValue, onChange, setLocalValue]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    []
  );

  return (
    <div className="flex flex-col gap-1.5" onMouseDown={handleMouseDown}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium truncate">{label}</label>
        <span
          className="text-xs font-mono text-muted-foreground bg-secondary/20 px-1.5 py-0.5 rounded"
          title="Color value"
        >
          {localValue}
        </span>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-8 shrink-0">
          <input
            type="color"
            value={rgbToHex(localValue)}
            onChange={handleColorChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-full h-full rounded border-2 border-border"
            style={{ backgroundColor: localValue }}
          />
        </div>
        <input
          type="text"
          value={localValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 px-2 py-1 text-sm font-mono rounded border border-border bg-transparent",
            "focus:outline-none focus:ring-1 focus:ring-accent/50"
          )}
          placeholder="Enter color value"
        />
      </div>
    </div>
  );
});

ColorInput.displayName = "ColorInput";

// Helper function to ensure color value works with input[type="color"]
const rgbToHex = (value: string): string => {
  // If it's already hex, return as-is
  if (value.startsWith("#") && (value.length === 7 || value.length === 4)) {
    return value;
  }

  // If it's rgb(), convert to hex
  const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // If it's rgba(), convert rgb part to hex
  const rgbaMatch = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // If it's an invalid format, return black as fallback
  return "#000000";
};

// Initialize theme from config file on app startup
export async function initializeThemeOnStartup() {
  try {
    const configDir = getApi().getConfigDir();
    const themeFilePath = `${configDir}/theme.json`;

    try {
      const fileData = await RpcApi.FileInfoCommand(TabRpcClient, {
        info: { path: themeFilePath },
      });

      // If file doesn't exist, use defaults
      if (fileData.notfound) {
        return;
      }

      // Read the file content
      const contentData = await RpcApi.FileReadCommand(TabRpcClient, {
        info: { path: themeFilePath },
      });

      const content = contentData?.data64 ? base64ToString(contentData.data64) : "";

      // Parse and apply the theme
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (parsed.colors && typeof parsed.colors === "object") {
          const themeColors = { ...defaultColors, ...parsed.colors } as ThemeColors;
          applyThemeFromConfig(themeColors);
          console.log("Theme initialized from config file:", themeFilePath);
        }
      }
    } catch (err) {
      console.warn("Failed to initialize theme on startup:", err);
    }
  } catch (err) {
    console.warn("Failed to initialize theme:", err);
  }
}

interface ThemeVisualContentProps {
  model: WaveConfigViewModel;
}

type ThemeColors = {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-hover": string;
  "accent-bg": string;
  error: string;
  warning: string;
  success: string;
  panel: string;
  hover: string;
  "hover-bg": string;
  border: string;
  "modal-bg": string;
  "modal-header-border": string;
  "modal-border": string;
  "modal-shadow": string;
  "modal-radius": string;
  "form-input-border": string;
  "form-input-bg": string;
  "form-input-focus": string;
  "scrollbar-thumb": string;
  "scrollbar-track": string;
  "selection-bg": string;
  "selection-text": string;
  "disabled-bg": string;
  "disabled-text": string;
  "focus-ring": string;
  "button-primary": string;
  "button-primary-hover": string;
  "button-secondary": string;
  "button-secondary-hover": string;
};

const defaultColors: ThemeColors = {
  background: "rgb(34, 34, 34)",
  foreground: "#f7f7f7",
  primary: "#f7f7f7",
  secondary: "rgb(195, 200, 194)",
  muted: "rgb(140, 145, 140)",
  "muted-foreground": "rgb(195, 200, 194)",
  accent: "rgb(88, 193, 66)",
  "accent-hover": "rgb(118, 223, 96)",
  "accent-bg": "rgba(88, 193, 66, 0.5)",
  error: "rgb(229, 77, 46)",
  warning: "rgb(224, 185, 86)",
  success: "rgb(78, 154, 6)",
  panel: "rgba(31, 33, 31, 0.5)",
  hover: "rgba(255, 255, 255, 0.1)",
  "hover-bg": "rgba(255, 255, 255, 0.2)",
  border: "rgba(255, 255, 255, 0.16)",
  "modal-bg": "#232323",
  "modal-header-border": "rgba(241, 246, 243, 0.15)",
  "modal-border": "rgba(255, 255, 255, 0.12)",
  "modal-shadow": "rgba(0, 0, 0, 0.8)",
  "modal-radius": "6px",
  "form-input-border": "rgba(241, 246, 243, 0.15)",
  "form-input-bg": "rgba(0, 0, 0, 0.3)",
  "form-input-focus": "rgba(88, 193, 66, 0.5)",
  "scrollbar-thumb": "rgba(255, 255, 255, 0.3)",
  "scrollbar-track": "rgba(0, 0, 0, 0.2)",
  "selection-bg": "rgba(88, 193, 66, 0.3)",
  "selection-text": "#f7f7f7",
  "disabled-bg": "rgba(255, 255, 255, 0.05)",
  "disabled-text": "rgba(255, 255, 255, 0.4)",
  "focus-ring": "rgba(88, 193, 66, 0.5)",
  "button-primary": "#f7f7f7",
  "button-primary-hover": "#e0e0e0",
  "button-secondary": "rgb(195, 200, 194)",
  "button-secondary-hover": "rgb(175, 180, 175)",
};

const colorDescriptions: Record<keyof ThemeColors, string> = {
  background: "Main application background",
  foreground: "Default text color",
  primary: "Primary text (headers, bold text)",
  secondary: "Secondary text color",
  muted: "Muted/faint text color",
  "muted-foreground": "Muted foreground text",
  accent: "Main accent color",
  "accent-hover": "Accent color on hover",
  "accent-bg": "Background with accent tint",
  error: "Error indication color",
  warning: "Warning indication color",
  success: "Success indication color",
  panel: "Panel background color",
  hover: "Hover state background",
  "hover-bg": "Background on hover",
  border: "Border and divider color",
  "modal-bg": "Modal/dialog background",
  "highlight-bg": "Highlighted item background",
  "modal-header-border": "Modal header bottom border",
  "modal-border": "Modal border",
  "modal-shadow": "Modal shadow",
  "modal-radius": "Modal border radius",
  "form-input-border": "Form input border",
  "form-input-bg": "Form input background",
  "form-input-focus": "Form input focus ring",
  "scrollbar-thumb": "Scrollbar thumb",
  "scrollbar-track": "Scrollbar track",
  "selection-bg": "Selection background",
  "selection-text": "Selection text",
  "disabled-bg": "Disabled element background",
  "disabled-text": "Disabled element text",
  "focus-ring": "Focus ring color",
  "button-primary": "Primary button background",
  "button-primary-hover": "Primary button hover background",
  "button-secondary": "Secondary button background",
  "button-secondary-hover": "Secondary button hover background",
};

// Helper function to apply theme colors to CSS variables immediately
export const applyThemeFromConfig = (themeConfig: ThemeColors) => {
  document.documentElement.style.setProperty("--main-bg-color", themeConfig.background);
  document.documentElement.style.setProperty("--main-text-color", themeConfig.foreground);
  document.documentElement.style.setProperty("--secondary-text-color", themeConfig.secondary);
  document.documentElement.style.setProperty("--grey-text-color", themeConfig.muted);
  document.documentElement.style.setProperty("--panel-bg-color", themeConfig.panel);
  document.documentElement.style.setProperty("--modal-bg-color", themeConfig["modal-bg"]);
  document.documentElement.style.setProperty("--highlight-bg-color", themeConfig["highlight-bg"]);
  document.documentElement.style.setProperty("--hover-bg-color", themeConfig["hover-bg"]);
  document.documentElement.style.setProperty("--border-color", themeConfig.border);
  document.documentElement.style.setProperty("--accent-color", themeConfig.accent);
  document.documentElement.style.setProperty("--accent-hover-color", themeConfig["accent-hover"]);
  document.documentElement.style.setProperty("--accent-bg-color", themeConfig["accent-bg"]);
  document.documentElement.style.setProperty("--error-color", themeConfig.error);
  document.documentElement.style.setProperty("--warning-color", themeConfig.warning);
  document.documentElement.style.setProperty("--success-color", themeConfig.success);
  document.documentElement.style.setProperty("--modal-header-border-color", themeConfig["modal-header-border"]);
  document.documentElement.style.setProperty("--modal-border-color", themeConfig["modal-border"]);
  document.documentElement.style.setProperty("--modal-shadow-color", themeConfig["modal-shadow"]);
  document.documentElement.style.setProperty("--modal-border-radius", themeConfig["modal-radius"]);
  document.documentElement.style.setProperty("--form-element-border-color", themeConfig["form-input-border"]);
  document.documentElement.style.setProperty("--form-element-bg-color", themeConfig["form-input-bg"]);
  document.documentElement.style.setProperty("--form-element-focus-color", themeConfig["form-input-focus"]);
  document.documentElement.style.setProperty("--scrollbar-thumb-color", themeConfig["scrollbar-thumb"]);
  document.documentElement.style.setProperty("--scrollbar-track-color", themeConfig["scrollbar-track"]);
  document.documentElement.style.setProperty("--selection-bg-color", themeConfig["selection-bg"]);
  document.documentElement.style.setProperty("--selection-text-color", themeConfig["selection-text"]);
  document.documentElement.style.setProperty("--disabled-bg-color", themeConfig["disabled-bg"]);
  document.documentElement.style.setProperty("--disabled-text-color", themeConfig["disabled-text"]);
  document.documentElement.style.setProperty("--focus-ring-color", themeConfig["focus-ring"]);
  document.documentElement.style.setProperty("--button-primary-color", themeConfig["button-primary"]);
  document.documentElement.style.setProperty("--button-primary-hover-color", themeConfig["button-primary-hover"]);
  document.documentElement.style.setProperty("--button-secondary-color", themeConfig["button-secondary"]);
  document.documentElement.style.setProperty("--button-secondary-hover-color", themeConfig["button-secondary-hover"]);
};

export const ThemeVisualContent = memo(({ model }: ThemeVisualContentProps) => {
  const themeConfigAtom = useMemo(
    () =>
      atom<ThemeColors>((get) => {
        try {
          const contentValue = get(model.fileContentAtom);
          if (contentValue && contentValue.trim()) {
            const parsed = JSON.parse(contentValue);
            if (parsed.colors && typeof parsed.colors === "object") {
              return { ...defaultColors, ...parsed.colors } as ThemeColors;
            }
          }
        } catch (e) {
          console.warn("Failed to parse theme config:", e);
        }
        return defaultColors;
      }),
    [model.fileContentAtom]
  );
  const themeConfig = useAtomValue(themeConfigAtom);

  const setThemeConfig = useCallback(
    (updatedColors: ThemeColors) => {
      const newContent = JSON.stringify({ colors: updatedColors }, null, 2);
      globalStore.set(model.fileContentAtom, newContent);
      model.markAsEdited();
    },
    [model]
  );

  // Apply theme colors to CSS variables
  const applyThemeToUI = useCallback((colors: ThemeColors) => {
    document.documentElement.style.setProperty("--main-bg-color", colors.background);
    document.documentElement.style.setProperty("--main-text-color", colors.foreground);
    document.documentElement.style.setProperty("--secondary-text-color", colors.secondary);
    document.documentElement.style.setProperty("--grey-text-color", colors.muted);
    document.documentElement.style.setProperty("--panel-bg-color", colors.panel);
    document.documentElement.style.setProperty("--modal-bg-color", colors["modal-bg"]);
    document.documentElement.style.setProperty("--highlight-bg-color", colors["highlight-bg"]);
    document.documentElement.style.setProperty("--hover-bg-color", colors["hover-bg"]);
    document.documentElement.style.setProperty("--border-color", colors.border);
    document.documentElement.style.setProperty("--accent-color", colors.accent);
    document.documentElement.style.setProperty("--accent-hover-color", colors["accent-hover"]);
    document.documentElement.style.setProperty("--accent-bg-color", colors["accent-bg"]);
    document.documentElement.style.setProperty("--error-color", colors.error);
    document.documentElement.style.setProperty("--warning-color", colors.warning);
    document.documentElement.style.setProperty("--success-color", colors.success);
    document.documentElement.style.setProperty("--modal-header-border-color", colors["modal-header-border"]);
    document.documentElement.style.setProperty("--modal-border-color", colors["modal-border"]);
    document.documentElement.style.setProperty("--modal-shadow-color", colors["modal-shadow"]);
    document.documentElement.style.setProperty("--modal-border-radius", colors["modal-radius"]);
    document.documentElement.style.setProperty("--form-element-border-color", colors["form-input-border"]);
    document.documentElement.style.setProperty("--form-element-bg-color", colors["form-input-bg"]);
    document.documentElement.style.setProperty("--form-element-focus-color", colors["form-input-focus"]);
    document.documentElement.style.setProperty("--scrollbar-thumb-color", colors["scrollbar-thumb"]);
    document.documentElement.style.setProperty("--scrollbar-track-color", colors["scrollbar-track"]);
    document.documentElement.style.setProperty("--selection-bg-color", colors["selection-bg"]);
    document.documentElement.style.setProperty("--selection-text-color", colors["selection-text"]);
    document.documentElement.style.setProperty("--disabled-bg-color", colors["disabled-bg"]);
    document.documentElement.style.setProperty("--disabled-text-color", colors["disabled-text"]);
    document.documentElement.style.setProperty("--focus-ring-color", colors["focus-ring"]);
    document.documentElement.style.setProperty("--button-primary-color", colors["button-primary"]);
    document.documentElement.style.setProperty("--button-primary-hover-color", colors["button-primary-hover"]);
    document.documentElement.style.setProperty("--button-secondary-color", colors["button-secondary"]);
    document.documentElement.style.setProperty("--button-secondary-hover-color", colors["button-secondary-hover"]);
  }, []);

  const handleColorChange = useCallback(
    (colorKey: keyof ThemeColors) => (value: string) => {
      const updatedConfig = {
        ...themeConfig,
        [colorKey]: value,
      };
      setThemeConfig(updatedConfig);

      // Apply to CSS variables immediately
      applyThemeToUI(updatedConfig);
    },
    [themeConfig, setThemeConfig, applyThemeToUI]
  );

  // Apply theme when it changes in the config file
  useEffect(() => {
    applyThemeToUI(themeConfig);
  }, [themeConfig, applyThemeToUI]);

  const colorGroups = [
    {
      title: "Base Colors",
      colors: ["background", "foreground", "primary", "secondary", "muted", "muted-foreground"] as const,
    },
    {
      title: "Accent Colors",
      colors: ["accent", "accent-hover", "accent-bg"] as const,
    },
    {
      title: "Status Colors",
      colors: ["error", "warning", "success"] as const,
    },
    {
      title: "UI Elements",
      colors: ["panel", "hover", "hover-bg", "border", "modal-bg", "highlight-bg"] as const,
    },
    {
      title: "Modal & Popups",
      colors: ["modal-bg", "modal-header-border", "modal-border", "modal-shadow", "modal-radius"] as const,
    },
    {
      title: "Form Elements",
      colors: ["form-input-border", "form-input-bg", "form-input-focus", "scrollbar-thumb", "scrollbar-track"] as const,
    },
    {
      title: "Interactive States",
      colors: ["selection-bg", "selection-text", "disabled-bg", "disabled-text", "focus-ring"] as const,
    },
    {
      title: "Buttons",
      colors: ["button-primary", "button-primary-hover", "button-secondary", "button-secondary-hover"] as const,
    },
  ];

  const handleResetToDefaults = useCallback(() => {
    setThemeConfig(defaultColors);
  }, [setThemeConfig]);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Theme</div>
          <div className="text-sm text-muted-foreground mt-1">
            Customize your application colors
          </div>
        </div>
        <button
          onClick={handleResetToDefaults}
          className="px-3 py-1.5 text-sm bg-secondary/20 hover:bg-secondary/30 rounded transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {colorGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-accent">{group.title}</h3>
            <div className="flex flex-col gap-4">
              {group.colors.map((colorKey) => (
                <ColorInput
                  key={colorKey}
                  label={colorKey}
                  value={themeConfig[colorKey]}
                  onChange={handleColorChange(colorKey)}
                  description={colorDescriptions[colorKey]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-panel border border-border rounded-lg">
        <div className="text-sm font-semibold mb-2">Preview Area</div>
        <p className="text-sm mb-2">
          Changes are applied locally. Click <span className="text-primary font-semibold">Save</span> to persist your changes to the config file.
        </p>
      </div>
    </div>
  );
});

ThemeVisualContent.displayName = "ThemeVisualContent";
