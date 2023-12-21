// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Replay10 as Replay10Icon,
  Replay30 as Replay30Icon,
  Forward10 as Forward10Icon,
  Forward30 as Forward30Icon,
} from "@mui/icons-material";
import { Stack, IconButton } from "@mui/material";
import React from "react";

export type ControlButtonsProps = {
  isPlaying: boolean;
  onClickPlayButton: () => void;
  onClickPauseButton: () => void;
  onClickSeekButton: (offset: number) => void;
  fontSize?: number;
};

function ControlButtons({
  isPlaying,
  onClickPlayButton,
  onClickPauseButton,
  onClickSeekButton,
  fontSize = 40,
}: ControlButtonsProps) {
  const seekBack10 = React.useCallback(() => onClickSeekButton(-10), [onClickSeekButton]);
  const seekBack30 = React.useCallback(() => onClickSeekButton(-30), [onClickSeekButton]);
  const seekForward10 = React.useCallback(() => onClickSeekButton(10), [onClickSeekButton]);
  const seekForward30 = React.useCallback(() => onClickSeekButton(30), [onClickSeekButton]);

  return (
    <Stack direction="row" spacing={2}>
      <IconButton onClick={seekBack30}>
        <Replay30Icon style={{ fontSize }} />
      </IconButton>
      <IconButton onClick={seekBack10}>
        <Replay10Icon style={{ fontSize }} />
      </IconButton>
      <IconButton
        onClick={isPlaying ? onClickPauseButton : onClickPlayButton}
        color={isPlaying ? "default" : "secondary"}
      >
        {isPlaying ? <PauseIcon style={{ fontSize }} /> : <PlayArrowIcon style={{ fontSize }} />}
      </IconButton>
      <IconButton onClick={seekForward10}>
        <Forward10Icon style={{ fontSize }} />
      </IconButton>
      <IconButton size="large" onClick={seekForward30}>
        <Forward30Icon style={{ fontSize }} />
      </IconButton>
    </Stack>
  );
}

export default React.memo(ControlButtons);
