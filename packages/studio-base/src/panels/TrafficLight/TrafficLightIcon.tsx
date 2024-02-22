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
  // https://github.com/autowarefoundation/autoware_msgs/blob/main/autoware_perception_msgs/msg/TrafficSignalElement.msg
  return type === 3 ? (
    <GreenLight />
  ) : type === 2 ? (
    <YellowLight />
  ) : type === 1 ? (
    <RedLight />
  ) : (
    <UnknownLight />
  );
}

export default React.memo(TrafficLightIcon);
