"use client";

import { useEffect, useRef, useState } from "react";

import { Notice } from "@/components/primitives";
import { usePrefersReducedMotion } from "@/components/layout/ThemeController";
import { formatDuration } from "@/lib/format";
import type { EducationVideo } from "@/lib/types";

/**
 * WHY THIS IS NOT AN <video> ELEMENT
 * ----------------------------------
 * Counterframe holds no video asset for this explainer, and fabricating one —
 * a stock clip, a synthesised voice, an AI-generated presenter — would put
 * invented material on a platform whose whole premise is that you can check
 * where things came from.
 *
 * So the explainer is what it actually is: timed text, played back on a
 * transport that behaves like a video player. Everything the brief requires of
 * a video is real here rather than decorative — captions are the timed track
 * driving playback, the transcript is complete, the poster is a rendered title
 * card, playback is fully keyboard-operable, and a motion-free equivalent is
 * published below. Nothing is available only in the timed version.
 */
export function ExplainerPlayer({
  video,
  title,
}: {
  video: EducationVideo;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime((t) => {
        const next = t + 0.25;
        if (next >= video.durationSeconds) {
          setPlaying(false);
          return video.durationSeconds;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(id);
  }, [playing, video.durationSeconds]);

  const cue =
    video.captions.find((c) => time >= c.start && time < c.end) ??
    (time >= video.durationSeconds ? video.captions[video.captions.length - 1] : undefined);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.key === "k") {
      event.preventDefault();
      toggle();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setTime((t) => Math.min(video.durationSeconds, t + 5));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setTime((t) => Math.max(0, t - 5));
    } else if (event.key === "Home") {
      event.preventDefault();
      setTime(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setTime(video.durationSeconds);
      setPlaying(false);
    }
  };

  const toggle = () => {
    setStarted(true);
    setPlaying((p) => !p);
  };

  return (
    <div>
      <div
        className="player"
        ref={regionRef}
        role="group"
        aria-label={`Timed explainer: ${title}`}
        onKeyDown={onKeyDown}
      >
        <div className="player-stage">
          {!started ? (
            // Poster: a rendered title card rather than a stock still.
            <div>
              <p className="eyebrow">Timed explainer · no audio track</p>
              <p
                className="player-slide"
                style={{ marginBlockStart: "var(--s-3)", fontWeight: 600 }}
              >
                {title}
              </p>
              <p className="meta" style={{ marginBlockStart: "var(--s-4)" }}>
                {video.posterAlt}
              </p>
            </div>
          ) : (
            <p className="player-slide" key={cue?.start ?? "end"}>
              {cue?.text ?? ""}
            </p>
          )}
        </div>

        <div className="player-controls">
          <button type="button" className="btn" data-variant="primary" onClick={toggle}>
            {playing ? "Pause" : started ? "Play" : "Play explainer"}
          </button>

          <label className="sr-only" htmlFor="player-scrub">
            Playback position
          </label>
          <input
            id="player-scrub"
            className="player-scrub"
            type="range"
            min={0}
            max={video.durationSeconds}
            step={1}
            value={Math.round(time)}
            onChange={(e) => {
              setStarted(true);
              setTime(Number(e.target.value));
            }}
            aria-valuetext={`${Math.round(time)} of ${video.durationSeconds} seconds`}
          />

          <span className="meta" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatDuration(time * 1000)} / {formatDuration(video.durationSeconds * 1000)}
          </span>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setTime(0);
              setPlaying(false);
              setStarted(false);
            }}
          >
            Restart
          </button>
        </div>

        <div className="captions">
          <p className="eyebrow" style={{ marginBlockEnd: "var(--s-2)" }}>
            Captions
          </p>
          <p role="status" aria-live="polite">
            {started ? (cue?.text ?? "—") : "Captions appear here during playback."}
          </p>
        </div>
      </div>

      <p className="meta" style={{ marginBlockStart: "var(--s-3)" }}>
        Keyboard: Space or K play and pause · Left and Right arrows seek five seconds · Home returns
        to the start · End jumps to the finish.
      </p>

      {reduceMotion && (
        <div style={{ marginBlockStart: "var(--s-4)" }}>
          <Notice tone="olive">
            <strong>Reduced motion is on.</strong> The static version below carries the same
            material. Nothing in this explainer is available only in the timed playback.
          </Notice>
        </div>
      )}

      <section style={{ marginBlockStart: "var(--s-6)" }}>
        <div className="section-head">
          <h3>Static version</h3>
        </div>
        <div className="prose" style={{ maxWidth: "44rem" }}>
          {video.reducedMotionSummary.split(/\n{2,}/).map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </section>

      <section style={{ marginBlockStart: "var(--s-6)" }}>
        <div className="section-head">
          <h3>Full transcript</h3>
        </div>
        <div className="transcript">
          {video.transcript.split(/\n{2,}/).map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </section>

      <section style={{ marginBlockStart: "var(--s-6)" }}>
        <div className="section-head">
          <h3>Caption track</h3>
          <p className="meta">{video.captions.length} cues</p>
        </div>
        <div className="table-scroll">
          <table className="data">
            <caption className="sr-only">Timed caption cues for this explainer</caption>
            <thead>
              <tr>
                <th scope="col">Start</th>
                <th scope="col">End</th>
                <th scope="col">Caption</th>
              </tr>
            </thead>
            <tbody>
              {video.captions.map((c) => (
                <tr key={c.start}>
                  <td className="num">{c.start}s</td>
                  <td className="num">{c.end}s</td>
                  <td>
                    <button
                      type="button"
                      className="btn"
                      data-variant="link"
                      onClick={() => {
                        setStarted(true);
                        setTime(c.start);
                      }}
                    >
                      {c.text}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
