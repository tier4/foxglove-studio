// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Story } from "@storybook/react";

import ControlBussons, {
  ControlButtonsProps,
} from "@foxglove/studio-base/panels/RosbagPlayerController/ControlBussons";

export default {
  component: ControlBussons,
  title: "components/ControlButtons",
};

const Template: Story<ControlButtonsProps> = (args: ControlButtonsProps) => (
  <ControlBussons {...args} />
);

export const Default = Template.bind({});
Default.args = {
  isPlaying: false,
  onClickPlayButton: () => {},
  onClickPauseButton: () => {},
  onClickSeekButton: () => {},
};
