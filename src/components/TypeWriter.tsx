"use client";

import { useState, useEffect, useRef } from "react";

export default function TypeWriter({
  text,
  speed = 40,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        i++;
        setDisplayed(text.slice(0, i));
      } else {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  const isComplete = displayed.length === text.length;

  return (
    <>
      {displayed}
      {!isComplete && <span className="cursor-blink">|</span>}
    </>
  );
}
