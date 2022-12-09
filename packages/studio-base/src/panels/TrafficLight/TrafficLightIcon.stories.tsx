// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import TrafficLightIcon from "./TrafficLightIcon";

export default {
  title: "components/TrafficLightIcon",
  component: TrafficLightIcon,
};

export const Green = (): JSX.Element => {
  return (
    <TrafficLightIcon type={2} />
  );
};

export const Yellow = (): JSX.Element => {
  return (
    <TrafficLightIcon type={3} />
  );
};

export const Led = (): JSX.Element => {
  return (
    <TrafficLightIcon type={1} />
  );
};

export const Unknown = (): JSX.Element => {
  return (
    <TrafficLightIcon type={0} />
  );
};
