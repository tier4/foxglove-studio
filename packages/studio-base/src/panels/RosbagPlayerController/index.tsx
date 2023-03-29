// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useEffect, useState, useCallback, useRef } from "react";

import roslib from "@foxglove/roslibjs";
import { toSec } from "@foxglove/rostime";
import Panel from "@foxglove/studio-base/components/Panel";
import PanelToolbar from "@foxglove/studio-base/components/PanelToolbar";
import Stack from "@foxglove/studio-base/components/Stack";
import ControlBussons from "@foxglove/studio-base/panels/RosbagPlayerController/ControlBussons";

type Clock = {
  secs: number;
  nsecs: number;
};

export function RosbagPlayerController(): JSX.Element {
  const rosClient = useRef<roslib.Ros | undefined>(undefined);
  const startTime = useRef(0);
  const currentTime = useRef(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const params = new URLSearchParams(window.location.search);
  const rosbridgeWebsocketUrl = params.get("ds.url") ?? "";

  const callSeekService = useCallback(
    (offsetSec: number) => {
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
        const time = Math.max(currentTime.current - startTime.current + offsetSec, 0);
        seekService.callService({ time }, console.log, console.error);
      } catch (error) {
        console.error(error);
      }
    },
    [rosClient, startTime, currentTime],
  );

  const callPlayService = useCallback(() => {
    try {
      if (rosClient.current == undefined) {
        throw new Error("rosClient is undefined");
      }
      const playService = new roslib.Service({
        ros: rosClient.current,
        name: "/rosbag_player/resume",
        serviceType: "std_srv/Trigger",
      });
      playService.callService(
        {},
        () => setIsPlaying(true),
        () => {
          throw new Error("再生に失敗しました");
        },
      );
    } catch (error) {
      console.error(error);
    }
  }, [rosClient]);

  const callPauseService = useCallback(() => {
    try {
      if (rosClient.current == undefined) {
        throw new Error("rosClient is undefined");
      }
      const pauseService = new roslib.Service({
        ros: rosClient.current,
        name: "/rosbag_player/pause",
        serviceType: "std_srv/Trigger",
      });
      pauseService.callService(
        {},
        () => setIsPlaying(false),
        () => {
          throw new Error("一時停止に失敗しました");
        },
      );
    } catch (error) {
      alert(error);
    }
  }, [rosClient]);

  useEffect(() => {
    const ros = new roslib.Ros({ url: rosbridgeWebsocketUrl, transportLibrary: "workersocket" });
    const playerEventListener = new roslib.Topic({
      ros,
      name: "/rosbag_player/rosbag_start_time",
      messageType: "rosgraph_msgs/Clock",
    });
    const statusListener = new roslib.Topic({
      ros,
      name: "/rosbag_player/playing",
      messageType: "std_msgs/Bool",
    });
    const clockListener = new roslib.Topic({
      ros,
      name: "/clock",
      messageType: "rosgraph_msgs/Clock",
    });
    ros.on("connection", () => {
      statusListener.subscribe(({ data }) => {
        setIsPlaying(data as boolean);
      });
      playerEventListener.subscribe(({ clock }) => {
        const { secs, nsecs } = clock as Clock;
        startTime.current = toSec({ sec: secs, nsec: nsecs });
      });
      clockListener.subscribe(({ clock }) => {
        const { secs, nsecs } = clock as Clock;
        currentTime.current = toSec({ sec: secs, nsec: nsecs });
      });
    });
    rosClient.current = ros;
    return () => {
      [playerEventListener, statusListener, clockListener].map((listener) =>
        listener.unsubscribe(),
      );
    };
  }, [rosbridgeWebsocketUrl]);

  return (
    <Stack fullHeight>
      <PanelToolbar />
      <Stack flexGrow={1} justifyContent="center" alignItems="center" overflow="hidden" padding={1}>
        <ControlBussons
          isPlaying={isPlaying}
          onClickPlayButton={callPlayService}
          onClickPauseButton={callPauseService}
          onClickSeekButton={callSeekService}
        />
      </Stack>
    </Stack>
  );
}

RosbagPlayerController.panelType = "ErrorMessageList";
RosbagPlayerController.defaultConfig = {};

export default Panel(RosbagPlayerController);
