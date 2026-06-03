"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, doc, getDocs, setDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export function use100DaysProgress() {
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const db = getFirestore(app);

  useEffect(() => {
    if (!user) {
      setProgress({});
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const progressRef = collection(db, `users/${user.id}/progress`);
        const snapshot = await getDocs(progressRef);
        const newProgress: Record<number, boolean> = {};
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.completed) {
            newProgress[parseInt(docSnap.id)] = true;
          }
        });
        
        setProgress(newProgress);
      } catch (error) {
        console.error("Error fetching 100 days progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user, db]);

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

    // Sync to Firestore
    try {
      const docRef = doc(db, `users/${user.id}/progress`, challengeId.toString());
      if (isCurrentlyCompleted) {
        await deleteDoc(docRef); // If toggling off, remove the document
      } else {
        await setDoc(docRef, {
          completed: true,
          completedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error("Error updating progress in Firestore:", error);
      // Revert on failure
      setProgress(progress);
    }
  };

  return { progress, toggleChallenge, isLoading };
}
