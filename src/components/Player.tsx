import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const STREAM_URL = "https://stream.zeno.fm/0r0xa792kwzuv";

export default function Player() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [nowPlaying, setNowPlaying] = useState("Радио Генезия — в эфире");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    audio.addEventListener("waiting", () => setLoading(true));
    audio.addEventListener("playing", () => {
      setLoading(false);
      setPlaying(true);
    });
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("error", () => {
      setLoading(false);
      setPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing || loading) {
      audio.pause();
      audio.src = "";
      setPlaying(false);
      setLoading(false);
    } else {
      setLoading(true);
      audio.src = STREAM_URL;
      audio.load();
      audio.play().catch(() => {
        setLoading(false);
      });
    }
  };

  return (
    <div
      className="sticky bottom-0 z-50 border-t"
      style={{
        background: "rgba(15,11,9,0.97)",
        backdropFilter: "blur(16px)",
        borderColor: "var(--radio-surface2)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
        {/* Play button */}
        <button
          onClick={togglePlay}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "var(--radio-red)",
            color: "#fff",
          }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon name={playing ? "Pause" : "Play"} size={18} />
          )}
        </button>

        {/* Waveform + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-end gap-0.5 h-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`waveform-bar${playing ? "" : " paused"}`}
              />
            ))}
          </div>
          <div className="min-w-0">
            <div
              className="text-xs font-display tracking-widest uppercase truncate"
              style={{ color: "var(--radio-red)" }}
            >
              {playing ? "В ЭФИРЕ" : "НЕ В ЭФИРЕ"}
            </div>
            <div
              className="text-sm truncate"
              style={{ color: "var(--radio-text)" }}
            >
              {nowPlaying}
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <Icon
            name={volume === 0 ? "VolumeX" : volume < 0.5 ? "Volume1" : "Volume2"}
            size={16}
            style={{ color: "var(--radio-muted)" }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="volume-slider w-24"
          />
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="live-dot" />
          <span
            className="text-xs font-display tracking-widest uppercase hidden sm:block"
            style={{ color: "var(--radio-muted)" }}
          >
            Live
          </span>
        </div>
      </div>
    </div>
  );
}
