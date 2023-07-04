// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Story } from "@storybook/react";

import FeedbackDialog, { FeedbackDialogProps } from "./FeedbackDialog";

export default {
  component: FeedbackDialog,
  title: 'components/FeedbackDialog',
};

const Template: Story<FeedbackDialogProps> = (args: FeedbackDialogProps) => <FeedbackDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  contentUrl: "",
  handleClose: console.log
};
