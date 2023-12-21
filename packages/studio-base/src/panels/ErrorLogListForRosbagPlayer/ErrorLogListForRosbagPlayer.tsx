// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, memo } from "react";

import { Time, fromString } from "@foxglove/rostime";
import { PanelExtensionContext, MessageEvent } from "@foxglove/studio";
import ErrorLogList from "@foxglove/studio-base/components/ErrorLogList/ErrorLogList";
import { ErrorLog } from "@foxglove/studio-base/components/ErrorLogList/ErrorLogListItem";
import FeedbackDialog from "@foxglove/studio-base/components/FeedbackDialog";
import Stack from "@foxglove/studio-base/components/Stack";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";

import { FileType } from "./types";

type Props = {
  context: PanelExtensionContext;
};

type ClockMsg = {
  clock: Time;
};

export function ErrorLogListForRosbagPlayer({ context }: Props): JSX.Element {
  // panel extensions must notify when they've completed rendering
  // onRender will setRenderDone to a done callback which we can invoke after we've rendered
  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [colorScheme, setColorScheme] = useState<"dark" | "light" | undefined>();
  const [message, setMessage] = useState<MessageEvent | undefined>();
  const clockRef = useRef<Time>();
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [feedbackContentIds, setFeedbackContentIds] = useState<string[]>([]);
  const [selectedErrorContent, setSelectedErrorContent] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const offsetSec = Number(params.get("offset-sec") ?? 6);
  const hiddenScore = params.get("hidden-score") == undefined;
  const errorLogUrl = params.get("error-log-url") ?? "";
  const feedbackContentsUrl = params.get("feedback-contents-url") ?? "";

  useEffect(() => {
    const getErrorLog = async (url: string) => {
      try {
        const res = await fetch(url);
        const data: ErrorLog[] = await res.json();
        const modifiedData = data.map((item, index) => ({ ...item, index, kind: "error" }));
        setErrorLogs(modifiedData);
      } catch (err) {
        setErrorMessage("データの取得に失敗しました");
      }
    };
    void getErrorLog(errorLogUrl);
  }, [errorLogUrl]);

  useEffect(() => {
    const getFeedbackContentIds = async (url: string) => {
      try {
        const res = await fetch(url);
        const data: FileType[] = await res.json();
        const contentIds = data.map((d) => d.name.replace(".png", ""));
        setFeedbackContentIds(contentIds);
      } catch (err) {
        setFeedbackContentIds([]);
      }
    };
    void getFeedbackContentIds(feedbackContentsUrl);
  }, [feedbackContentsUrl]);

  // Every time we get a new image message draw it to the canvas.
  useEffect(() => {
    if (message) {
      clockRef.current = (message.message as ClockMsg).clock;
    }
  }, [message]);

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
        setErrorMessage("データソースがサービスをサポートしていません");
        return;
      }
      try {
        await context.callService(serviceName, JSON.parse(requestPayload!));
      } catch (err) {
        setErrorMessage("サービスの呼び出しに失敗しました");
      }
    },
    [context],
  );

  const handleClickItem = useCallback(
    async (item: ErrorLog) => {
      const playbackTime = fromString(item.timestamp);
      if (playbackTime == undefined) {
        return;
      }
      const seekMessage = {
        time: {
          sec: playbackTime.sec + offsetSec,
          nanosec: playbackTime.nsec,
        },
      };
      await callService("/rosbag2_player/seek", JSON.stringify(seekMessage));
      await callService("/rosbag2_player/resume", JSON.stringify({}));
    },
    [offsetSec, callService],
  );

  const handleCloseFeedbackDialog = useCallback(
    (event: React.MouseEvent<HTMLInputElement>): void => {
      event.preventDefault();
      setSelectedErrorContent(undefined);
    },
    [],
  );

  const handleClickFeedback = useCallback((error_content: string) => {
    setSelectedErrorContent(error_content);
  }, []);

  useEffect(() => {
    renderDone();
  }, [renderDone]);

  return (
    <ThemeProvider isDark={colorScheme === "dark"}>
      <Stack flex="auto" gap={1} position="relative" fullHeight>
        {errorLogs.length > 0 ? (
          <Stack fullHeight gap={1} overflowY="scroll" paddingBottom={20}>
            <ErrorLogList
              errorLogs={errorLogs}
              handleClickItem={handleClickItem}
              feedbackContentIds={feedbackContentIds}
              handleClickFeedback={handleClickFeedback}
              hiddenScore={hiddenScore}
            />
          </Stack>
        ) : errorMessage == undefined ? (
          <Stack
            flexGrow={1}
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            padding={1}
          >
            <EmptyMessage message="減点はありません" />
          </Stack>
        ) : (
          <Stack
            flexGrow={1}
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            padding={1}
          >
            <ErrorMessage message={errorMessage} />
          </Stack>
        )}
        <FeedbackDialog
          open={selectedErrorContent != undefined}
          contentUrl={`${feedbackContentsUrl}${selectedErrorContent}.png`}
          handleClose={handleCloseFeedbackDialog}
        />
      </Stack>
    </ThemeProvider>
  );
}

type MessageProps = {
  message: string;
};

const ErrorMessage = memo(function ErrorMessage({ message }: MessageProps) {
  return (
    <Typography variant="h5" color="error" align="center">
      {message}
    </Typography>
  );
});

const EmptyMessage = memo(function EmptyMessage({ message }: MessageProps) {
  return (
    <Typography variant="h5" color="secondary" align="center">
      {message}
    </Typography>
  );
});
