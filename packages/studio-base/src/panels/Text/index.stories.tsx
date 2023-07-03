// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Story, StoryContext } from "@storybook/react";

import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import Text from "./index";

export default {
  title: "panels/Text",
  component: Text,
  decorators: [
    (StoryComponent: Story, { parameters }: StoryContext): JSX.Element => {
      return (
        <PanelSetup fixture={parameters.panelSetup?.fixture}>
          <StoryComponent />
        </PanelSetup>
      );
    },
  ],
};

function makeFixture(value: number) {
  return {
    topics: [{ name: "/data", datatype: "foo_msgs/Bar" }],
    frame: {
      "/data": [
        {
          topic: "/data",
          receiveTime: { sec: 123, nsec: 456 },
          message: { value },
        },
      ],
    },
  };
}

export const EmptyState = (): JSX.Element => {
  return <Text />;
};

const NumberStory = (): JSX.Element => {
  return (
    <Text
      overrideConfig={{
        path: "/data.value",
      }}
    />
  );
};
export const NumberNegative = (): JSX.Element => <NumberStory />;
NumberNegative.parameters = { panelSetup: { fixture: makeFixture(-1) } };
export const NumberZero = (): JSX.Element => <NumberStory />;
NumberZero.parameters = { panelSetup: { fixture: makeFixture(0) } };
export const NumberPositive = (): JSX.Element => <NumberStory />;
NumberPositive.parameters = { panelSetup: { fixture: makeFixture(1) } };

export const MessagePathWithFilter = (): JSX.Element => {
  return (
    <Text
      overrideConfig={{
        path: `/data{id=="b"}.value`,
      }}
    />
  );
};
MessagePathWithFilter.parameters = {
  panelSetup: {
    fixture: {
      topics: [{ name: "/data", datatype: "foo_msgs/Bar" }],
      frame: {
        "/data": [
          {
            topic: "/data",
            receiveTime: { sec: 123, nsec: 456 },
            message: { id: "a", value: 10.0 },
          },
          {
            topic: "/data",
            receiveTime: { sec: 123, nsec: 456 },
            message: { id: "b", value: 20.4 },
          },
          {
            topic: "/data",
            receiveTime: { sec: 123, nsec: 456 },
            message: { id: "c", value: 30.5 },
          },
        ],
      },
    },
  },
};
