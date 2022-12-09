// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import BlinkerIcon from "./BlinkerIcon";

export default {
  title: "components/BlinkerIcon",
  component: BlinkerIcon,
};

export const LeftBlinkerStory = (): JSX.Element => {
  return (
    <BlinkerIcon
      on={true}
      direction="left"
    />
  );
};
