// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useLayoutEffect, useState, memo } from "react";
import { fromString } from "@foxglove/rostime";
import { PanelExtensionContext } from "@foxglove/studio";
import ErrorLogList from "@foxglove/studio-base/components/ErrorLogList/ErrorLogList";
import { ErrorLog } from "@foxglove/studio-base/components/ErrorLogList/ErrorLogListItem";
import FeedbackDialog from "@foxglove/studio-base/components/FeedbackDialog";
import Stack from "@foxglove/studio-base/components/Stack";
import ThemeProvider from "@foxglove/studio-base/theme/ThemeProvider";

import { FileType } from "./types";

type Props = {
  context: PanelExtensionContext;
};

function getFilenameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return filename; // 拡張子なし
  }
  return filename.substring(0, lastDotIndex);
}

function insertDotAtNanoBoundary(s: string): string {
  if (s.length <= 9) {
    return "0." + s.padStart(9, "0");
  }
  const sec = s.slice(0, s.length - 9);
  const nanosec = s.slice(-9);
  return sec + "." + nanosec;
}

export function ErrorLogListForRosbagPlayer({ context }: Props): JSX.Element {
  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});
  const [colorScheme, setColorScheme] = useState<"dark" | "light" | undefined>();
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [feedbackFilenames, setFeedbackFilenames] = useState<string[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string | undefined>(undefined);
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [advertised, setAdvertised] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const offsetSec = Number(params.get("offset-sec") ?? 6);
  const selectedIndex = Number(params.get("selected-index") ?? -1);
  const hiddenScore = params.get("hidden-score") == "true";
  const errorLogUrl = params.get("error-log-url") ?? "";
  const feedbackContentsUrl = params.get("feedback-contents-url") ?? "";
  const isFixedMode = params.get("fixed") !== null;

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
    if (context.advertise && !advertised) {
      context.advertise?.("/marker/errors", "visualization_msgs/msg/MarkerArray", {});
      setAdvertised(true);
    }
  }, [context]);

  useEffect(() => {
    if (!isFixedMode) return; // ← fixed パラメータがない場合は何もしない

    const interval = setInterval(() => {
      if (!advertised || !context.publish || errorLogs.length === 0) return;

      const markers = errorLogs.flatMap((log, i) => {
        const stamp = fromString(insertDotAtNanoBoundary(log.timestamp));

        /* ------------------ 球体マーカー ------------------ */
        const sphere = {
          header: { frame_id: "map", stamp },
          ns: "error_logs",
          id: i * 2, // id は一意にする
          type: 2, // SPHERE
          action: 0,
          pose: {
            position: {
              x: Number(log["position.x"] ?? 0),
              y: Number(log["position.y"] ?? 0),
              z: Number(log["position.z"] ?? 0) + 1.0 + (i === highlightedIndex ? 2.0 : 1.0),
            },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
          },
          scale: { x: 4, y: 4, z: 4 },
          color: {
            r: i === highlightedIndex ? 1 : 1,
            g: i === highlightedIndex ? 0 : 1,
            b: i === highlightedIndex ? 0 : 0,
            a: i === highlightedIndex ? 1 : 0.7,
          },
          lifetime: { sec: 0, nanosec: 0 },
        };

        /* ------------------ テキストマーカー ------------------ */
        const text = {
          header: { frame_id: "map", stamp },
          ns: "error_logs",
          id: i * 2 + 1, // 別 ID
          type: 9, // TEXT_VIEW_FACING
          action: 0,
          pose: {
            position: {
              x: Number(log["position.x"] ?? 0) + 4.0,
              y: Number(log["position.y"] ?? 0) + 4.0,
              z: Number(log["position.z"] ?? 0) + 2.0 + (i === highlightedIndex ? 2.0 : 1.0),
            },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
          },
          scale: { x: 0.0, y: 0.0, z: 7.0 }, // z がフォントサイズ
          color: {
            r: i === highlightedIndex ? 1 : 1,
            g: i === highlightedIndex ? 0 : 1,
            b: i === highlightedIndex ? 0 : 1,
            a: 1,
          },
          lifetime: { sec: 0, nanosec: 0 },
          text: `${i + 1.0}`, // ← インデックス表示
        };

        return [sphere, text];
      });

      context.publish?.("/marker/errors", { markers });
    }, 250); // 1 秒ごとに更新

    return () => clearInterval(interval);
  }, [advertised, context, errorLogs, isFixedMode, highlightedIndex]);

  useEffect(() => {
    const getFeedbackFilenames = async (url: string) => {
      try {
        const res = await fetch(url);
        const data: FileType[] = await res.json();
        setFeedbackFilenames(data.map((d) => d.name));
      } catch (err) {
        setFeedbackFilenames([]);
      }
    };
    void getFeedbackFilenames(feedbackContentsUrl);
  }, [feedbackContentsUrl]);

  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      setColorScheme(renderState.colorScheme);
    };
    context.watch("colorScheme");
    context.watch("currentFrame");
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
    async (item: ErrorLog, _: number) => {
      const formatedTimestamp = insertDotAtNanoBoundary(item.timestamp);
      const playbackTime = fromString(formatedTimestamp);
      console.log(item.timestamp, "->", playbackTime);
      if (playbackTime == undefined) {
        return;
      }
      const seekMessage = {
        time: {
          sec: playbackTime.sec - offsetSec,
          nanosec: playbackTime.nsec,
        },
      };
      await callService("/rosbag2_player/seek", JSON.stringify(seekMessage));
      await callService("/rosbag2_player/resume", JSON.stringify({}));
    },
    [offsetSec, callService],
  );

  const handleClickItemWithFixedMode = useCallback(
    (_: ErrorLog, index: number) => {
      setHighlightedIndex(index);
    },
    [setHighlightedIndex],
  );

  const handleCloseFeedbackDialog = useCallback((): void => {
    setSelectedFilename(undefined);
  }, []);

  const handleClickFeedback = useCallback(
    (error_content: string) => {
      const feedbackFilename = feedbackFilenames.find(
        (filename) => getFilenameWithoutExtension(filename) === error_content,
      );
      setSelectedFilename(feedbackFilename);
    },
    [feedbackFilenames],
  );

  useEffect(() => {
    void callService("/rosbag2_player/resume", JSON.stringify({}));
  }, [callService]);

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
              handleClickItem={isFixedMode ? handleClickItemWithFixedMode : handleClickItem}
              feedbackContentIds={feedbackFilenames.map((filename) =>
                getFilenameWithoutExtension(filename),
              )}
              handleClickFeedback={handleClickFeedback}
              hiddenScore={hiddenScore}
              defaultIndex={selectedIndex}
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
          open={selectedFilename != undefined}
          contentUrl={`${feedbackContentsUrl}/${selectedFilename}`}
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
