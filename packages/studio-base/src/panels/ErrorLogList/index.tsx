// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Typography from "@mui/material/Typography";
import { useEffect, useState, useCallback, memo } from "react";

import { fromString } from "@foxglove/rostime";
import ErrorLogList from "@foxglove/studio-base/components/ErrorLogList/ErrorLogList";
import { ErrorLog } from "@foxglove/studio-base/components/ErrorLogList/ErrorLogListItem";
import FeedbackDialog from "@foxglove/studio-base/components/FeedbackDialog";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import Panel from "@foxglove/studio-base/components/Panel";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import Stack from "@foxglove/studio-base/components/Stack";
import { PlayerPresence } from "@foxglove/studio-base/players/types";

import { Config, FileType } from "./types";

const selectPlayerPresence = (ctx: MessagePipelineContext) => ctx.playerState.presence;
const selectSeek = (ctx: MessagePipelineContext) => ctx.seekPlayback;
const selectPlay = (ctx: MessagePipelineContext) => ctx.startPlayback;
const selectStartTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.startTime;
const selectEndTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.endTime;

type Props = {
  config: Config;
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

export function ErrorLogListPanel(_: Props): JSX.Element {
  const playerPresence = useMessagePipeline(selectPlayerPresence);
  const play = useMessagePipeline(selectPlay);
  const seek = useMessagePipeline(selectSeek);
  const startTime = useMessagePipeline(selectStartTime);
  const endTime = useMessagePipeline(selectEndTime);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [feedbackFilenames, setFeedbackFilenames] = useState<string[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const offsetSec = Number(params.get("offset-sec") ?? 6);
  const selectedIndex = Number(params.get("selected-index") ?? -1);
  const hiddenScore = params.get("hidden-score") == "true";
  const errorLogUrl = params.get("error-log-url") ?? "";
  const feedbackContentsUrl = params.get("feedback-contents-url") ?? "";

  useEffect(() => {
    if (playerPresence === PlayerPresence.PRESENT) {
      play?.();
    }
  }, [play, playerPresence]);

  useEffect(() => {
    const getErrorLog = async (url: string) => {
      const res = await fetch(url);
      const data: ErrorLog[] = await res.json();
      const modifiedData = data.map((item, index) => ({ ...item, index, kind: "error" }));
      setErrorLogs(modifiedData);
    };
    getErrorLog(errorLogUrl).catch(() => {
      setErrorMessage("データの取得に失敗しました");
    });
  }, [errorLogUrl]);

  useEffect(() => {
    const getFeedbackContentIds = async (url: string) => {
      const res = await fetch(url);
      const data: FileType[] = await res.json();
      setFeedbackFilenames(data.map((d) => d.name));
    };
    getFeedbackContentIds(feedbackContentsUrl).catch(() => {
      setFeedbackFilenames([]);
    });
  }, [feedbackContentsUrl]);

  const handleClickItem = useCallback(
    (item: ErrorLog) => {
      const formatedTimestamp = insertDotAtNanoBoundary(item.timestamp);
      const playbackTime = fromString(formatedTimestamp);
      console.log(item.timestamp, "->", playbackTime);
      if (playbackTime == undefined || startTime == undefined || endTime == undefined) {
        return;
      }
      playbackTime.sec -= offsetSec;
      seek?.(playbackTime);
      play?.();
    },
    [startTime, endTime, offsetSec, play, seek],
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

  return (
    <Stack fullHeight>
      <PanelToolbar />
      {errorLogs.length > 0 ? (
        <Stack fullHeight gap={1} overflowY="scroll" paddingBottom={20}>
          <ErrorLogList
            errorLogs={errorLogs}
            handleClickItem={handleClickItem}
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

ErrorLogListPanel.panelType = "ErrorMessageList";
ErrorLogListPanel.defaultConfig = {};

export default Panel(ErrorLogListPanel);
