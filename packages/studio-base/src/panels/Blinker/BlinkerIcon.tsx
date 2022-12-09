// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import ForwardIcon from "@mui/icons-material/Forward";
import { styled } from "@mui/material";

const BlinkForwardIcon = styled(ForwardIcon)({
  "@keyframes pulsate": {
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0,
    }
  },
  animation: "pulsate 0.6s infinite ease",
});

type BlinkerIconProps = {
  on: boolean;
  direction: string;
};

export default function BlinkerIcon({ on, direction }: BlinkerIconProps) {

  const style = {
    transform: (direction === "left") ? "scaleX(-1)" : null,
    fontSize: "3.5rem",
  };

  return ( on ?
    <BlinkForwardIcon sx={{ ...style, color: "yellow" }} />
    :
    <ForwardIcon sx={style} />
  );
}
