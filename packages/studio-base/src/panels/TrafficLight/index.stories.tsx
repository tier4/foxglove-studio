// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Story, StoryContext } from "@storybook/react";

import PanelSetup from "@foxglove/studio-base/stories/PanelSetup";

import TrafficLight from "./index";

export default {
  title: "panels/TrafficLight",
  component: TrafficLight,
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
  return <TrafficLight />;
};

const TrafficLightStory = (): JSX.Element => {
  return (
    <TrafficLight
      overrideConfig={{
        path: "/data.value",
      }}
    />
  );
};
export const Red = (): JSX.Element => <TrafficLightStory />;
Red.parameters = { panelSetup: { fixture: makeFixture(1) } };
export const Yellow = (): JSX.Element => <TrafficLightStory />;
Yellow.parameters = { panelSetup: { fixture: makeFixture(3) } };
export const Green = (): JSX.Element => <TrafficLightStory />;
Green.parameters = { panelSetup: { fixture: makeFixture(2) } };
export const Unknown = (): JSX.Element => <TrafficLightStory />;
Unknown.parameters = { panelSetup: { fixture: makeFixture(0) } };

export const MessagePathWithFilter = (): JSX.Element => {
  return (
    <TrafficLight
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
