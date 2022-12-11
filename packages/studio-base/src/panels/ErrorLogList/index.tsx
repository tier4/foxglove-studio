// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Typography from "@mui/material/Typography";
import { useEffect, useState, useCallback } from "react";

import { Time, fromNanoSec } from "@foxglove/rostime";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import Panel from "@foxglove/studio-base/components/Panel";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import Stack from "@foxglove/studio-base/components/Stack";

import ErrorLogList from "./ErrorLogList";
import { ErrorLog } from "./ErrorLogListItem";
import FeedbackDialog from "./FeedbackDialog";
import helpContent from "./index.help.md";
import { Config, FileType } from "./types";

const selectSeek = (ctx: MessagePipelineContext) => ctx.seekPlayback;
const selectPlay = (ctx: MessagePipelineContext) => ctx.startPlayback;

type Props = {
  config: Config;
};

export function ErrorLogListPanel({ config }: Props): JSX.Element {

  const offsetSec = config.offsetSec ?? 0;
  const hiddenScore = config.hiddenScore ?? false;

  const play = useMessagePipeline(selectPlay);
  const seek = useMessagePipeline(selectSeek);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [feedbackContentIds, setFeedbackContentIds] = useState<string[]>([]);
  const [selectedErrorContent, setSelectedErrorContent] = useState<string|undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const errorLogUrl = params.get("error-log-url") ?? "";
  const feedbackContentsUrl = params.get("feedback-contents-url") ?? "";

  useEffect(() => {
    const getErrorLog = async (url: string) => {
      const res = await fetch(url);
      const data: ErrorLog[] = await res.json();
      const modifiedData = data.map((item, index) => ({ ...item, index, kind: 'error' }))
      setErrorLogs(modifiedData);
    }
    getErrorLog(errorLogUrl).catch(() => setErrorMessage("データの取得に失敗しました"));
  }, [errorLogUrl]);

  useEffect(() => {
    const getFeedbackContentIds = async (url: string) => {
      const res = await fetch(url);
      const data: FileType[] = await res.json();
      const contentIds = data.map(d => d.name.replace('.png', ''));
      setFeedbackContentIds(contentIds);
    }
    getFeedbackContentIds(feedbackContentsUrl).catch(() => setFeedbackContentIds([]));
  }, [feedbackContentsUrl]);

  const handleClickItem = useCallback((item: ErrorLog) => {
    const timestamp = BigInt(item.timestamp);
    const playbackTime: Time = fromNanoSec(timestamp);
    playbackTime.sec -= offsetSec;
    seek?.(playbackTime);
    play?.();
  }, [offsetSec, play, seek]);

  const handleCloseFeedbackDialog = useCallback((event: any) => {
    event.preventDefault();
    setSelectedErrorContent(undefined);
  }, []);

  const handleClickFeedback = useCallback((error_content: string) => {
    setSelectedErrorContent(error_content);
  }, []);

  return (
    <Stack fullHeight>
      <PanelToolbar helpContent={helpContent} />
      { errorLogs.length > 0 ?
        <Stack
          fullHeight
          gap={1}
          overflowY="scroll"
          paddingBottom={20}
        >
          <ErrorLogList
            errorLogs={errorLogs}
            handleClickItem={handleClickItem}
            feedbackContentIds={feedbackContentIds}
            handleClickFeedback={handleClickFeedback}
            hiddenScore={hiddenScore}
          />
        </Stack>
        : errorMessage == undefined ?
        <Stack
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
          padding={1}
        >
          <EmptyMessage message="減点はありません" />
        </Stack>
        :
        <Stack
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
          padding={1}
        >
          <ErrorMessage message={errorMessage} />
        </Stack>
      }
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
}

const ErrorMessage = ({ message }: MessageProps) => {
  return (
    <Typography variant="h5" color="error" align="center">
      {message}
    </Typography>
  );
}


const EmptyMessage = ({ message }: MessageProps) => {
  return (
    <Typography variant="h5" color="secondary" align="center">
      {message}
    </Typography>
  );
}


ErrorLogListPanel.panelType = "ErrorMessageList";
ErrorLogListPanel.defaultConfig = {
  offsetSec: 5,
  hiddenScore: false,
};

export default Panel(ErrorLogListPanel);
