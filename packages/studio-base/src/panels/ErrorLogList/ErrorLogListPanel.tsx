// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Alert, Typography } from "@mui/material";
import { useEffect, useState, useCallback } from "react";

import { Time, fromNanoSec } from "@foxglove/rostime";
import { PanelExtensionContext } from "@foxglove/studio";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import Stack from "@foxglove/studio-base/components/Stack";

import ErrorLogList from "./ErrorLogList";
import { ErrorLog } from "./ErrorLogListItem";
import FeedbackDialog from "./FeedbackDialog";
import { Config, FileType } from "./types";


const selectSeek = (ctx: MessagePipelineContext) => ctx.seekPlayback;
const selectPlay = (ctx: MessagePipelineContext) => ctx.startPlayback;

type Props = {
  context: PanelExtensionContext;
};

export function ErrorLogListPanel({ context }: Props): JSX.Element {

  // panel extensions must notify when they've completed rendering
  // onRender will setRenderDone to a done callback which we can invoke after we've rendered
  const [renderDone, setRenderDone] = useState<() => void>(() => () => {});

  const [config, setConfig] = useState(() => ({
    ...(context.initialState as Partial<Config>),
  }));

  useEffect(() => {
    context.saveState(config);
  }, [config, context]);

  useEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
    };
    context.watch("currentFrame");
    context.watch("didSeek");
    return () => {
      context.onRender = undefined;
    };
  }, [context]);

  // Indicate render is complete - the effect runs after the dom is updated
  useEffect(() => {
    renderDone();
  }, [renderDone]);

  // const { offsetSec } = (context.initialState as Partial<Config>);
  const offsetSec = 0;

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
    getErrorLog(errorLogUrl).catch(() => setErrorMessage("減点一覧が取得できません"));
  }, [errorLogUrl]);

  // useEffect(() => {
  //   const getFeedbackContentIds = async (url: string) => {
  //     const res = await fetch(url);
  //     const data: FileType[] = await res.json();
  //     const contentIds = data.map(d => d.name.replace('.png', ''));
  //     setFeedbackContentIds(contentIds);
  //   }
  //   getFeedbackContentIds(feedbackContentsUrl).catch(() => setFeedbackContentIds([]));
  // }, [feedbackContentsUrl]);

  // const handleClickItem = useCallback((item: ErrorLog) => {
  //   const timestamp = BigInt(item.timestamp);
  //   const playbackTime: Time = fromNanoSec(timestamp);
  //   playbackTime.sec -= offsetSec;
  //   if (seek) {
  //     seek(playbackTime);
  //   }
  //   if (play) {
  //     play();
  //   }
  // }, [offsetSec, play, seek]);

  // const handleCloseFeedbackDialog = useCallback((event: any) => {
  //   event.preventDefault();
  //   setSelectedErrorContent(undefined);
  // }, []);

  // const handleClickFeedback = useCallback((error_content: string) => {
  //   setSelectedErrorContent(error_content);
  // }, []);

  return (
    <Stack fullHeight>
      <Stack
        flexGrow={1}
        justifyContent="space-around"
        alignItems="center"
        overflow="hidden"
        padding={1}
      >
        { errorMessage == undefined ?
          <ErrorLogList
            errorLogs={errorLogs}
            // handleClickItem={handleClickItem}
            // feedbackContentIds={feedbackContentIds}
            // handleClickFeedback={handleClickFeedback}
          />
          :
          <Alert severity="error">
            <Typography variant="h5">{errorMessage}</Typography>
          </Alert>
        }
      </Stack>
      {/* <FeedbackDialog
        open={selectedErrorContent != undefined}
        contentUrl={`http://localhost:8000/AIDS.bioka/system/feedback/${selectedErrorContent}.png`}
        handleClose={handleCloseFeedbackDialog}
      /> */}
    </Stack>
  );
}
