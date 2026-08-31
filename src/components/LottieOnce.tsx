"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";

const LAYOUT = { fit: "contain" as const, align: [0.5, 0.5] as [number, number] };

export function LottieOnce({
  src,
  onComplete,
  className = "h-full w-full",
}: {
  src: string;
  onComplete?: () => void;
  className?: string;
}) {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!dotLottie) return;

    let ignoreComplete = true;
    const ignoreTimer = window.setTimeout(() => {
      ignoreComplete = false;
    }, 80);

    const play = () => {
      dotLottie.setLoop(false);
      dotLottie.resetSegment();
      dotLottie.setFrame(0);
      dotLottie.play();
    };

    const handleComplete = () => {
      if (ignoreComplete) return;
      completeRef.current?.();
    };

    dotLottie.addEventListener("load", play);
    dotLottie.addEventListener("complete", handleComplete);
    play();

    return () => {
      window.clearTimeout(ignoreTimer);
      dotLottie.removeEventListener("load", play);
      dotLottie.removeEventListener("complete", handleComplete);
    };
  }, [dotLottie]);

  return (
    <DotLottieReact
      src={src}
      autoplay
      loop={false}
      backgroundColor="transparent"
      className={className}
      layout={LAYOUT}
      dotLottieRefCallback={setDotLottie}
    />
  );
}

export function LottieLoop({
  src,
  className = "h-full w-full",
}: {
  src: string;
  className?: string;
}) {
  return (
    <DotLottieReact
      src={src}
      autoplay
      loop
      backgroundColor="transparent"
      className={className}
      layout={LAYOUT}
    />
  );
}
