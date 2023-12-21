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
  disabled: boolean;
  onClickPlayButton: () => void;
  onClickPauseButton: () => void;
  onClickSeekButton: (offset: number) => void;
  fontSize?: number;
};

function ControlButtons({
  isPlaying,
  disabled,
  onClickPlayButton,
  onClickPauseButton,
  onClickSeekButton,
  fontSize = 40,
}: ControlButtonsProps) {
  return (
    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
      <IconButton
        disabled={disabled}
        onClick={() => {
          onClickSeekButton(-30);
        }}
      >
        <Replay30Icon style={{ fontSize }} />
      </IconButton>
      <IconButton
        disabled={disabled}
        onClick={() => {
          onClickSeekButton(-10);
        }}
      >
        <Replay10Icon style={{ fontSize }} />
      </IconButton>
      <IconButton disabled={disabled} onClick={isPlaying ? onClickPauseButton : onClickPlayButton}>
        {isPlaying ? <PauseIcon style={{ fontSize }} /> : <PlayArrowIcon style={{ fontSize }} />}
      </IconButton>
      <IconButton
        disabled={disabled}
        onClick={() => {
          onClickSeekButton(10);
        }}
      >
        <Forward10Icon style={{ fontSize }} />
      </IconButton>
      <IconButton
        disabled={disabled}
        onClick={() => {
          onClickSeekButton(30);
        }}
      >
        <Forward30Icon style={{ fontSize }} />
      </IconButton>
    </Stack>
  );
}

export default React.memo(ControlButtons);
