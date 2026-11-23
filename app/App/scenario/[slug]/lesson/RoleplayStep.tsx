"use client";

import { useRef, useState } from "react";
import type { Turn } from "../../../lib/types";
import { judge } from "../../../lib/leo";
import { SpeakButton } from "../../../components/SpeakButton";
import styles from "./lessonSteps.module.css";

type Done = { turnIndex: number; attempts: number; done: boolean };

export function RoleplayStep({
  turns,
  saved,
  onTurnDone,
  onDone,
}: {
  turns: Turn[];
  saved: Done[];
  onTurnDone: (turnIndex: number) => void;
  onDone: () => void;
}) {
  const [turnIndex, setTurnIndex] = useState(saved.length);
  const [input, setInput] = useState("");
  const [nudgesUsed, setNudgesUsed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [forced, setForced] = useState(false);
  const [history, setHistory] = useState<{ leo: string; you?: string }[]>(
    turns.slice(0, saved.length).map((turn) => ({ leo: turn.leo })),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const turn = turns[turnIndex];

  if (!turn) {
    return (
      <div className={styles.step}>
        <p className={styles.kicker}>۴ · گفت‌وگو</p>
        <h2 className={styles.title}>نوبت‌ها تمام شد</h2>
        <p className={styles.hint}>همهٔ پاسخ‌ها ثبت شد.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onDone}>
            دیدن نتیجه
          </button>
        </div>
      </div>
    );
  }

  const advance = (answer: string) => {
    setHistory((current) => [
      ...current.slice(0, turnIndex).map((item) =>
        item.you ? item : item,
      ),
      { leo: turn.leo, you: answer },
    ]);
    onTurnDone(turnIndex);

    if (turnIndex + 1 >= turns.length) {
      onDone();
      return;
    }

    setTurnIndex(turnIndex + 1);
    setNudgesUsed(0);
    setHint(null);
    setForced(false);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submit = () => {
    const text = input.trim();

    /* خالی یا کوتاه‌تر از دو کلمه: راهنما، بدون مصرف ناج */
    if (text.split(/\s+/).filter(Boolean).length < 2) {
      setHint(turn.nudges[0]);
      return;
    }

    if (forced) {
      advance(text);
      return;
    }

    const verdict = judge(text, turn);

    if (verdict === "accept") {
      advance(text);
      return;
    }

    if (verdict === "off") {
      setHint("با این جمله شروع کن:");
      return;
    }

    /* close: ناج بعدی. اگر دو ناج مصرف شد، پاسخ هدف نشان داده می‌شود. */
    const nextNudges = nudgesUsed + 1;
    setNudgesUsed(nextNudges);

    if (nextNudges >= 2) {
      setForced(true);
      setHint(null);
      return;
    }

    setHint(turn.nudges[Math.min(nextNudges, turn.nudges.length - 1)]);
  };

  const chips = [
    turn.target.split(" ").slice(0, 2).join(" "),
    "Could I",
    "I'd like",
  ];

  return (
    <div className={styles.step}>
      <p className={styles.kicker}>۴ · گفت‌وگو</p>
      <h2 className={styles.title}>با لئو حرف بزن</h2>

      <div className={styles.chat}>
        {history.map((item, index) => (
          <div key={index} className={styles.chatBlock}>
            <div className={`${styles.bubbleRowStatic} ${styles.leo}`}>
              <span className={styles.bubble}>
                <span className={styles.bubbleEn} dir="ltr">
                  {item.leo}
                </span>
              </span>
            </div>
            {item.you ? (
              <div className={`${styles.bubbleRowStatic} ${styles.mine}`}>
                <span className={styles.bubble}>
                  <span className={styles.bubbleEn} dir="ltr">
                    {item.you}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        ))}

        <div className={`${styles.bubbleRowStatic} ${styles.leo}`}>
          <span className={styles.bubble}>
            <span className={styles.bubbleEn} dir="ltr">
              {turn.leo}
            </span>
            {turnIndex === 0 || turn.leoFa ? (
              <span className={styles.bubbleFa}>{turn.leoFa}</span>
            ) : null}
          </span>
          <SpeakButton text={turn.leo} compact />
        </div>
      </div>

      {forced ? (
        <div className={styles.targetCard}>
          <p className={styles.targetLabel}>اینجوری بگو</p>
          <p className={styles.targetText} dir="ltr">
            {turn.target}
          </p>
          <p className={styles.targetHint}>همین جمله را تایپ کن و بفرست.</p>
        </div>
      ) : null}

      {hint ? <p className={styles.note}>{hint}</p> : null}

      {!forced ? (
        <div className={styles.chipsRow} dir="ltr">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={styles.chipButton}
              onClick={() => setInput((current) => (current ? `${current} ${chip}` : chip))}
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.inputRow} dir="ltr">
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="Type your answer…"
          autoComplete="off"
          autoFocus
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={submit}>
          بفرست
        </button>
      </div>
    </div>
  );
}
