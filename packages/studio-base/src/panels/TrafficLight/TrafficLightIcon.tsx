// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import React from "react";

import GreenLight from "./svg/Green.svg";
import RedLight from "./svg/Red.svg";
import UnknownLight from "./svg/Unknown.svg";
import YellowLight from "./svg/Yellow.svg";

type TrafficLightIconProps = {
  type: number;
};

function TrafficLightIcon({ type }: TrafficLightIconProps) {
  // type
  //   UNKNOWN=0
  //   RED=1
  //   GREEN=2
  //   YELLOW=3
  //   LEFT=4
  //   RIGHT=5
  //   UP=6
  //   DOWN=7
  return type === 2 ? (
    <GreenLight />
  ) : type === 3 ? (
    <YellowLight />
  ) : type === 1 ? (
    <RedLight />
  ) : (
    <UnknownLight />
  );
}

export default React.memo(TrafficLightIcon);
