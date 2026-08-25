"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";

export type KitchenStage = "idle" | "cook" | "serve";

const COOK_START = 20;
const COOK_END = 405;
const SERVE_END = 758;
const SPEED = 1.75;
const KITCHEN_LAYOUT = { fit: "contain" as const, align: [0.5, 0.5] as [number, number] };

export function FoodKitchen({
  stage,
  onStageComplete,
}: {
  stage: KitchenStage;
  onStageComplete?: () => void;
}) {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const stageRef = useRef(stage);
  const completeRef = useRef(onStageComplete);

  useEffect(() => {
    stageRef.current = stage;
    completeRef.current = onStageComplete;
  }, [stage, onStageComplete]);

  useEffect(() => {
    if (!dotLottie) return;

    let ignoreComplete = false;
    let ignoreTimer = 0;

    const applyStage = () => {
      ignoreComplete = true;
      window.clearTimeout(ignoreTimer);
      dotLottie.setLoop(false);
      dotLottie.setSpeed(SPEED);
      if (stage === "idle") {
        dotLottie.pause();
        dotLottie.resetSegment();
        dotLottie.setFrame(COOK_START);
      } else if (stage === "cook") {
        dotLottie.setSegment(COOK_START, COOK_END);
        dotLottie.setFrame(COOK_START);
        dotLottie.play();
      } else {
        dotLottie.setSegment(COOK_END, SERVE_END);
        dotLottie.setFrame(COOK_END);
        dotLottie.play();
      }
      ignoreTimer = window.setTimeout(() => {
        ignoreComplete = false;
      }, 80);
    };

    const onComplete = () => {
      if (ignoreComplete) return;
      if (stageRef.current === "idle") return;
      completeRef.current?.();
    };

    const onLoad = () => applyStage();

    dotLottie.addEventListener("load", onLoad);
    dotLottie.addEventListener("complete", onComplete);
    applyStage();

    return () => {
      window.clearTimeout(ignoreTimer);
      dotLottie.removeEventListener("load", onLoad);
      dotLottie.removeEventListener("complete", onComplete);
    };
  }, [dotLottie, stage]);

  return (
    <DotLottieReact
      src="/animations/food.lottie"
      autoplay={false}
      loop={false}
      speed={SPEED}
      backgroundColor="transparent"
      className="h-full w-full"
      layout={KITCHEN_LAYOUT}
      dotLottieRefCallback={setDotLottie}
    />
  );
}
