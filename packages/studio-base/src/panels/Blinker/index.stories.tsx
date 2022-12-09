// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Story, StoryContext } from "@storybook/react";

import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import Blinker from "./index";

export default {
  title: "panels/Blinker",
  component: Blinker,
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
  return <Blinker />;
};

const LeftBlinkerStory = (): JSX.Element => {
  return (
    <Blinker
      overrideConfig={{
        path: "/data.value",
        on: 1,
        reverse: false,
      }}
    />
  );
};
export const LeftOff = (): JSX.Element => <LeftBlinkerStory />;
LeftOff.parameters = { panelSetup: { fixture: makeFixture(0) } };
export const LeftOn = (): JSX.Element => <LeftBlinkerStory />;
LeftOn.parameters = { panelSetup: { fixture: makeFixture(1) } };

const RightBlinkerStory = (): JSX.Element => {
  return (
    <Blinker
      overrideConfig={{
        path: "/data.value",
        on: 1,
        reverse: true,
      }}
    />
  );
};
export const RightOff = (): JSX.Element => <RightBlinkerStory />;
RightOff.parameters = { panelSetup: { fixture: makeFixture(0) } };
export const RightOn = (): JSX.Element => <RightBlinkerStory />;
RightOn.parameters = { panelSetup: { fixture: makeFixture(1) } };

export const MessagePathWithFilter = (): JSX.Element => {
  return (
    <Blinker
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
            message: { id: "a", value: 0 },
          },
          {
            topic: "/data",
            receiveTime: { sec: 123, nsec: 456 },
            message: { id: "b", value: 1 },
          },
          {
            topic: "/data",
            receiveTime: { sec: 123, nsec: 456 },
            message: { id: "c", value: 0 },
          },
        ],
      },
    },
  },
};
