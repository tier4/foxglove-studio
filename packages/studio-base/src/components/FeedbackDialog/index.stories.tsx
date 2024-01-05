// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { StoryObj } from "@storybook/react";

import FeedbackDialog, { FeedbackDialogProps } from ".";

export default {
  component: FeedbackDialog,
  title: "components/FeedbackDialog",
};

export const Default: StoryObj<FeedbackDialogProps> = {
  args: {
    contentUrl: "https://placekitten.com/400/300",
    handleClose: () => {},
    open: true,
  },
  render: (props) => <FeedbackDialog {...props} />,
};
