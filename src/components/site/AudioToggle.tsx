"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Optional temple ambience (spec §5). NEVER autoplays with sound — audio only
 * starts on a deliberate user gesture.
 */
export function AudioToggle({
  url,
  label,
  defaultVolume = 0.4,
}: {
  url: string;
  label: string;
  defaultVolume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = Math.min(Math.max(defaultVolume, 0), 1);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [url, defaultVolume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-temple-gold/40 bg-temple-maroon/90 px-4 py-2 text-sm text-temple-cream shadow-lg backdrop-blur transition hover:bg-temple-maroon"
    >
      {playing ? (
        <Volume2 className="h-4 w-4 text-temple-gold" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
