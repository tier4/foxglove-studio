// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Typography from "@mui/material/Typography";
import { useEffect, useState, useCallback, useRef, memo } from "react";

import roslib from "@foxglove/roslibjs";
import { Time, fromNanoSec, toSec } from "@foxglove/rostime";
import ErrorLogList from "@foxglove/studio-base/components/ErrorLogList/ErrorLogList";
import { ErrorLog } from "@foxglove/studio-base/components/ErrorLogList/ErrorLogListItem";
import Panel from "@foxglove/studio-base/components/Panel";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import Stack from "@foxglove/studio-base/components/Stack";

import FeedbackDialog from "./FeedbackDialog";
import { Config, FileType } from "./types";

type Clock = {
  secs: number;
  nsecs: number;
};

type Props = {
  config: Config;
};

export function ErrorLogListForRosbagPlayer({ config }: Props): JSX.Element {
  const offsetSec = config.offsetSec ?? 0;
  const hiddenScore = config.hiddenScore ?? false;

  const rosClient = useRef<roslib.Ros | undefined>(undefined);
  const startTime = useRef(0);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [feedbackContentIds, setFeedbackContentIds] = useState<string[]>([]);
  const [selectedErrorContent, setSelectedErrorContent] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const errorLogUrl = params.get("error-log-url") ?? "";
  const feedbackContentsUrl = params.get("feedback-contents-url") ?? "";
  const rosbridgeWebsocketUrl = params.get("ds.url") ?? "";

  const seekPlayback = useCallback(
    (playbackTime: number) => {
      try {
        if (rosClient.current == undefined) {
          throw new Error("rosClient is undefined");
        }
        const ros = rosClient.current;
        const seekService = new roslib.Service({
          ros,
          name: "/rosbag_player/seek_and_play",
          serviceType: "rosbridge_rosbag_player/Seek",
        });
        const time = playbackTime - startTime.current - offsetSec;
        seekService.callService({ time }, console.log, console.error);
      } catch (error) {
        console.error(error);
      }
    },
    [rosClient, startTime, offsetSec],
  );

  useEffect(() => {
    const ros = new roslib.Ros({ url: rosbridgeWebsocketUrl, transportLibrary: "workersocket" });
    const playerEventListener = new roslib.Topic({
      ros,
      name: "/rosbag_player/rosbag_start_time",
      messageType: "rosgraph_msgs/Clock",
    });
    ros.on("connection", () =>
      playerEventListener.subscribe(({ clock }) => {
        const { secs, nsecs } = clock as Clock;
        startTime.current = toSec({ sec: secs, nsec: nsecs });
      }),
    );
    ros.on("close", () => playerEventListener.unsubscribe());
    rosClient.current = ros;
    return () => playerEventListener.unsubscribe();
  }, [rosbridgeWebsocketUrl]);

  useEffect(() => {
    const getErrorLog = async (url: string) => {
      const res = await fetch(url);
      const data: ErrorLog[] = await res.json();
      const modifiedData = data.map((item, index) => ({ ...item, index, kind: "error" }));
      setErrorLogs(modifiedData);
    };
    getErrorLog(errorLogUrl).catch(() => setErrorMessage("データの取得に失敗しました"));
  }, [errorLogUrl]);

  useEffect(() => {
    const getFeedbackContentIds = async (url: string) => {
      const res = await fetch(url);
      const data: FileType[] = await res.json();
      const contentIds = data.map((d) => d.name.replace(".png", ""));
      setFeedbackContentIds(contentIds);
    };
    getFeedbackContentIds(feedbackContentsUrl).catch(() => setFeedbackContentIds([]));
  }, [feedbackContentsUrl]);

  const handleClickItem = useCallback(
    (item: ErrorLog) => {
      const timestamp = BigInt(item.timestamp);
      const playbackTime: Time = fromNanoSec(timestamp);
      seekPlayback(playbackTime.sec);
    },
    [seekPlayback],
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

ErrorLogListForRosbagPlayer.panelType = "ErrorMessageList";
ErrorLogListForRosbagPlayer.defaultConfig = {
  offsetSec: 5,
  hiddenScore: false,
};

export default Panel(ErrorLogListForRosbagPlayer);
