// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import Log from "@foxglove/log";
import { Time } from "@foxglove/rostime";
import { PanelExtensionContext, MessageEvent } from "@foxglove/studio";
import Stack from "@foxglove/studio-base/components/Stack";
import ControlBussons from "@foxglove/studio-base/panels/RosbagPlayerController/ControlBussons";
import { Config } from "@foxglove/studio-base/panels/RosbagPlayerController/types";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";

import { defaultConfig } from "./settings";

const log = Log.getLogger(__dirname);

type Props = {
  context: PanelExtensionContext;
};

type State = {
  status: "requesting" | "error" | "success";
  value: string;
};

type ClockMsg = {
  clock: Time;
};

export function RosbagPlayerController({ context }: Props): JSX.Element {
  // panel extensions must notify when they've completed rendering
  // onRender will setRenderDone to a done callback which we can invoke after we've rendered
  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [colorScheme, setColorScheme] = useState<"dark" | "light" | undefined>();
  const [message, setMessage] = useState<MessageEvent | undefined>();
  const clockRef = useRef<Time>();
  const [state, setState] = useState<State | undefined>();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [config, setConfig] = useState<Config>(() => ({
    ...defaultConfig,
    ...(context.initialState as Partial<Config>),
  }));

  // Every time we get a new image message draw it to the canvas.
  useEffect(() => {
    if (message) {
      clockRef.current = (message.message as ClockMsg).clock;
    }
  }, [message]);

  useEffect(() => {
    context.saveState(config);
    context.setDefaultPanelTitle(
      config.serviceName ? `Call service ${config.serviceName}` : undefined,
    );
  }, [config, context]);

  useLayoutEffect(() => {
    context.watch("colorScheme");
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      setColorScheme(renderState.colorScheme);
      // Save the most recent message on our image topic.
      if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        setMessage(renderState.currentFrame[renderState.currentFrame.length - 1]);
      }
    };
    context.watch("currentFrame");
    context.subscribe([{ topic: "/clock" }]);

    return () => {
      context.onRender = undefined;
    };
  }, [context]);

  const callService = useCallback(
    async (serviceName: string, requestPayload: string | undefined) => {
      if (!context.callService) {
        setState({ status: "error", value: "The data source does not allow calling services" });
        return;
      }

      try {
        setState({ status: "requesting", value: `Calling ${serviceName}...` });
        const response = await context.callService(serviceName, JSON.parse(requestPayload!));
        setState({ status: "success", value: JSON.stringify(response, undefined, 2) ?? "" });
      } catch (err) {
        setState({ status: "error", value: (err as Error).message });
        log.error(err);
      }
    },
    [context],
  );

  const pauseButtonClicked = useCallback(async () => {
    await callService("/rosbag2_player/pause", JSON.stringify({}));
    setIsPlaying(false);
  }, [callService]);

  const resumeButtonClicked = useCallback(async () => {
    await callService("/rosbag2_player/resume", JSON.stringify({}));
    setIsPlaying(true);
  }, [callService]);

  const seekButtonClicked = useCallback(
    async (offsetSec: number) => {
      if (!clockRef.current) {
        return;
      }
      const seekMessage = {
        time: {
          sec: clockRef.current.sec + offsetSec,
          nanosec: clockRef.current.nsec,
        },
      };
      await callService("/rosbag2_player/seek", JSON.stringify(seekMessage));
    },
    [callService],
  );

  useEffect(() => {
    renderDone();
  }, [renderDone]);

  return (
    <ThemeProvider isDark={colorScheme === "dark"}>
      <Stack flex="auto" gap={1} padding={1.5} position="relative" fullHeight>
        <ControlBussons
          isPlaying={isPlaying}
          disabled={state?.status === "requesting"}
          onClickPlayButton={resumeButtonClicked}
          onClickPauseButton={pauseButtonClicked}
          onClickSeekButton={seekButtonClicked}
        />
      </Stack>
    </ThemeProvider>
  );
}
