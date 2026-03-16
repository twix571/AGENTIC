// Copyright 2026, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WaveConfigViewModel } from "@/app/view/waveconfig/waveconfig-model";
import { globalStore } from "@/app/store/jotaiStore";
import { cn } from "@/util/util";
import { atom, useAtom, useAtomValue } from "jotai";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

const ColorInput = memo(({ label, value, onChange, description }: ColorInputProps) => {
  const [localValue, setLocalValue] = useAtom(atom(value));
  const isColorInputMode = useRef<boolean>(true);

  useEffect(() => {
    setLocalValue(value);
  }, [value, setLocalValue]);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      setLocalValue(newValue);
      isColorInputMode.current = false;
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
    isColorInputMode.current = true;
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
  "highlight-bg": string;
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
  "highlight-bg": "rgba(255, 255, 255, 0.2)",
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
    document.documentElement.style.setProperty("--form-element-primary-color", colors.accent);
    document.documentElement.style.setProperty("--toggle-checked-bg-color", colors.accent);
    document.documentElement.style.setProperty("--error-color", colors.error);
    document.documentElement.style.setProperty("--warning-color", colors.warning);
    document.documentElement.style.setProperty("--success-color", colors.success);
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
