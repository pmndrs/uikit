import { Container, ComponentInternals } from "@react-three/uikit";
import { colors } from "./defaults.js";
import { ComponentPropsWithoutRef, useMemo, useRef, useState } from "react";
import { EventHandlers, ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { Vector3 } from "three";

const vectorHelper = new Vector3();

export function Slider({
  disabled = false,
  value: providedValue,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: {
  disabled?: boolean;
  value?: number;
  defaultValue?: number;
  onValueChange?(value: number): void;
  min?: number;
  max?: number;
  step?: number;
} & Omit<ComponentPropsWithoutRef<typeof Container>, "children">) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = providedValue ?? uncontrolled ?? 50;
  const percentage = `${value}%` as const;
  const ref = useRef<ComponentInternals>(null);
  const onChange = useRef(onValueChange);
  onChange.current = onValueChange;
  const handler = useMemo(() => {
    let down: boolean = false;
    function setValue(e: ThreeEvent<PointerEvent>) {
      if (ref.current == null) {
        return;
      }
      vectorHelper.copy(e.point);
      ref.current.interactionPanel.worldToLocal(vectorHelper);
      const newValue = Math.min(
        Math.max(Math.round(((vectorHelper.x + 0.5) * (max - min) + min) / step) * step, min),
        max,
      );
      if (providedValue == null) {
        setUncontrolled(newValue);
      }
      onChange.current?.(newValue);
      e.stopPropagation();
    }
    return {
      onPointerDown(e) {
        down = true;
        setValue(e);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      },
      onPointerMove(e) {
        if (!down) {
          return;
        }
        setValue(e);
      },
      onPointerUp(e) {
        if (!down) {
          return;
        }
        down = false;
        e.stopPropagation();
      },
    } satisfies EventHandlers;
  }, []);
  return (
    <Container
      ref={ref}
      {...(disabled ? {} : handler)}
      positionType="relative"
      height={8}
      width="100%"
      alignItems="center"
      {...props}
    >
      <Container
        height={8}
        positionType="absolute"
        positionLeft={0}
        positionRight={0}
        flexGrow={1}
        borderRadius={1000}
        backgroundColor={colors.secondary}
      >
        <Container
          height="100%"
          width={percentage}
          borderRadius={1000}
          backgroundColor={colors.primary}
        />
      </Container>
      <Container
        zIndexOffset={2}
        positionType="absolute"
        positionLeft={percentage}
        transformTranslateX={-10}
        transformTranslateY={-6}
        cursor="pointer"
        borderOpacity={disabled ? 0.5 : undefined}
        backgroundOpacity={disabled ? 0.5 : undefined}
        height={20}
        width={20}
        border={2}
        borderRadius={1000}
        borderColor={colors.primary}
        backgroundColor={colors.background}
      />
    </Container>
  );
}
