"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { hackingChallenges } from "@/lib/100-days-data";

export function use100DaysProgress() {
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProgress({});
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/progress/me");
        const days: Array<{ dayNumber: number }> = res.data?.data?.days ?? [];

        const newProgress: Record<number, boolean> = {};
        for (const day of days) {
          newProgress[day.dayNumber] = true;
        }
        setProgress(newProgress);
      } catch (error) {
        console.error("Error fetching 100 days progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const toggleChallenge = async (challengeId: number) => {
    if (!user) return;

    // Optimistic UI update
    const isCurrentlyCompleted = !!progress[challengeId];
    const newProgress = { ...progress };

    if (isCurrentlyCompleted) {
      delete newProgress[challengeId];
    } else {
      newProgress[challengeId] = true;
    }

    setProgress(newProgress);

    // Sync to backend API — PATCH /api/v1/progress/days/:dayNumber
    try {
      const challenge = hackingChallenges.find((c) => c.id === challengeId);
      const roomName = challenge?.title ?? `Day ${challengeId}`;

      await api.patch(`/progress/days/${challengeId}`, { roomName });
    } catch (error) {
      console.error("Error updating progress:", error);
      // Revert on failure
      setProgress(progress);
    }
  };

  return { progress, toggleChallenge, isLoading };
}
