// SPDX-FileCopyrightText: Copyright (C) 2023-2025 Bayerische Motoren Werke Aktiengesellschaft (BMW AG)<lichtblick@bmwgroup.com>
// SPDX-License-Identifier: MPL-2.0

import { keyframes } from "@emotion/react";
import { makeStyles } from "tss-react/mui";

import { IndicatorStyle } from "@lichtblick/suite-base/panels/Indicator/types";

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

export const useStyles = makeStyles<Partial<{ style: IndicatorStyle; backgroundColor: string }>>()(
  ({ spacing }, { style, backgroundColor = "transparent" }) => ({
    indicatorStack: {
      flexGrow: 1,
      justifyContent: "space-around",
      alignItems: "center",
      overflow: "hidden",
      padding: spacing(1),
      backgroundColor: style === "background" ? backgroundColor : "transparent",
    },
    stack: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      width: "10vw",
      height: "10vw",
      display: "flex",
      justifyContent: "center",
    },
    bulb: {
      width: "clamp(10px, 2vw, 32px)",
      height: "clamp(10px, 2vw, 32px)",
      borderRadius: "50%",
      position: "relative",
      backgroundColor,
      backgroundImage: [
        `radial-gradient(transparent, transparent 55%, rgba(255,255,255,0.4) 80%, rgba(255,255,255,0.4))`,
        `radial-gradient(circle at 38% 35%, rgba(255,255,255,0.8), transparent 30%, transparent)`,
        `radial-gradient(circle at 46% 44%, transparent, transparent 61%, rgba(0,0,0,0.7) 74%, rgba(0,0,0,0.7))`,
      ].join(","),
    },
    typography: {
      fontWeight: 700,
      fontSize: "clamp(10px, min(1.5vw, 1.5vh), 52px)",
      whiteSpace: "pre",
      padding: spacing(0),
    },
    arrow: {
      width: "clamp(20px, 10vw, 128px)",
      height: "clamp(20px, 10vw, 128px)",
      color: backgroundColor,
    },
    blink: {
      animation: `${blink} 1s infinite`,
    },
    flip: {
      transform: "rotate(180deg)",
    },
  }),
);
