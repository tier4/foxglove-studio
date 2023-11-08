// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Typography from "@mui/material/Typography";
import { useEffect, useState, useCallback, memo } from "react";

import { fromString } from "@foxglove/rostime";
import ErrorLogList from "@foxglove/studio-base/components/ErrorLogList/ErrorLogList";
import { ErrorLog } from "@foxglove/studio-base/components/ErrorLogList/ErrorLogListItem";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import Panel from "@foxglove/studio-base/components/Panel";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import Stack from "@foxglove/studio-base/components/Stack";

import FeedbackDialog from "./FeedbackDialog";
import { Config, FileType } from "./types";

const selectSeek = (ctx: MessagePipelineContext) => ctx.seekPlayback;
const selectPlay = (ctx: MessagePipelineContext) => ctx.startPlayback;
const selectStartTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.startTime;

type Props = {
  config: Config;
};

export function ErrorLogListPanel({ config }: Props): JSX.Element {
  const offsetSec = config.offsetSec ?? 0;
  const hiddenScore = config.hiddenScore ?? false;

  const play = useMessagePipeline(selectPlay);
  const seek = useMessagePipeline(selectSeek);
  const startTime = useMessagePipeline(selectStartTime);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [feedbackContentIds, setFeedbackContentIds] = useState<string[]>([]);
  const [selectedErrorContent, setSelectedErrorContent] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const bagUrl = params.get("ds.url") ?? "";
  const durationSec = Number(params.get("duration-sec") ?? 0);
  const errorLogUrl = params.get("error-log-url") ?? "";
  const feedbackContentsUrl = params.get("feedback-contents-url") ?? "";

  const bagFilename = bagUrl.split("/").pop() ?? "";
  const bagIndex = Number(bagFilename.replace(".mcap", "").split("_")[1] ?? 0);

  useEffect(() => {
    play?.();
  }, [play]);

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
      const contentIds = data.map((d) => d.name.replace(".png", ""));
      setFeedbackContentIds(contentIds);
    };
    getFeedbackContentIds(feedbackContentsUrl).catch(() => {
      setFeedbackContentIds([]);
    });
  }, [feedbackContentsUrl]);

  const handleClickItem = useCallback(
    (item: ErrorLog) => {
      const playbackTime = fromString(item.timestamp);
      if (playbackTime == undefined || startTime == undefined) {
        return;
      }
      const x = (playbackTime.sec - startTime.sec) / durationSec;
      const newBagIndex = bagIndex + (x < 0 ? Math.ceil(x) + 1 : Math.floor(x));
      if (newBagIndex !== bagIndex) {
        const newBagUrl = bagUrl.replace(`_${bagIndex}.mcap`, `_${newBagIndex}.mcap`);
        params.set("ds.url", newBagUrl);
        params.set("time", new Date(playbackTime.sec * 1000).toISOString());
        window.location.search = params.toString();
      } else {
        playbackTime.sec -= offsetSec;
        seek?.(playbackTime);
        play?.();
      }
    },
    [params, bagUrl, startTime, bagIndex, durationSec, offsetSec, play, seek],
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

  return (
    <Stack fullHeight>
      <PanelToolbar />
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
ErrorLogListPanel.defaultConfig = {
  offsetSec: 5,
  hiddenScore: false,
};

export default Panel(ErrorLogListPanel);
