import { useCallback, useState } from "react";
import { DEFAULT_SETTINGS } from "../utils/constants";
import type { StoryboardSettings } from "../types/storyboard";

export function useStoryboardSettings() {
  const [settings, setSettings] = useState<StoryboardSettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((patch: Partial<StoryboardSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
