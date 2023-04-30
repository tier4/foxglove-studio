// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { StoryObj } from "@storybook/react";

import DiagnosticStatusPanel from "@foxglove/studio-base/panels/diagnostics/DiagnosticStatusPanel";
import { makeDiagnosticMessage } from "@foxglove/studio-base/panels/diagnostics/DiagnosticSummary.stories";
import { LEVELS } from "@foxglove/studio-base/panels/diagnostics/util";
import PanelSetup, { Fixture } from "@foxglove/studio-base/stories/PanelSetup";

export default {
  title: "panels/diagnostics/DiagnosticStatusPanel",
};

const fixture: Fixture = {
  topics: [{ name: "/diagnostics", schemaName: "diagnostic_msgs/DiagnosticArray" }],
  frame: {
    "/diagnostics": [
      makeDiagnosticMessage(LEVELS.OK, "name1", "hardware_id1", ["message 1", "message 2"]),
      makeDiagnosticMessage(
        LEVELS.OK,
        "name2",
        "hardware_id1",
        ["message 3"],
        [
          { key: "key", value: "value" },
          { key: "key <b>with html</b>", value: "value <tt>with html</tt>" },
        ],
      ),
      makeDiagnosticMessage(LEVELS.ERROR, "name1", "levels_id", ["error message"]),
      makeDiagnosticMessage(LEVELS.OK, "name2", "levels_id", ["ok message"]),
      makeDiagnosticMessage(LEVELS.STALE, "name3", "levels_id", ["stale message"]),
      makeDiagnosticMessage(LEVELS.WARN, "name4", "levels_id", ["warn message"]),
    ],
  },
};

export const Empty: StoryObj = {
  render: () => {
    return (
      <PanelSetup fixture={fixture}>
        <DiagnosticStatusPanel />
      </PanelSetup>
    );
  },
};

export const Default: StoryObj = {
  render: () => {
    return (
      <PanelSetup fixture={fixture}>
        <DiagnosticStatusPanel
          overrideConfig={{
            topicToRender: "/diagnostics",
            selectedHardwareId: "levels_id",
          }}
        />
      </PanelSetup>
    );
  },
};

export const WithSettings: StoryObj = {
  render: function Story() {
    return (
      <PanelSetup fixture={fixture} includeSettings>
        <DiagnosticStatusPanel
          overrideConfig={{
            topicToRender: "/diagnostics",
            selectedHardwareId: "hardware_id1",
            selectedName: "name2",
          }}
        />
      </PanelSetup>
    );
  },

  parameters: {
    colorScheme: "light",
  },
};

export const SelectedHardwareIDOnly: StoryObj = {
  render: () => {
    return (
      <PanelSetup fixture={fixture}>
        <DiagnosticStatusPanel
          overrideConfig={{
            topicToRender: "/diagnostics",
            selectedHardwareId: "hardware_id1",
            selectedName: undefined,
          }}
        />
      </PanelSetup>
    );
  },
};

export const SelectedName: StoryObj = {
  render: () => {
    return (
      <PanelSetup fixture={fixture}>
        <DiagnosticStatusPanel
          overrideConfig={{
            topicToRender: "/diagnostics",
            selectedHardwareId: "hardware_id1",
            selectedName: "name2",
          }}
        />
      </PanelSetup>
    );
  },
};

export const MovedDivider: StoryObj = {
  render: () => {
    return (
      <PanelSetup fixture={fixture}>
        <DiagnosticStatusPanel
          overrideConfig={{
            topicToRender: "/diagnostics",
            selectedHardwareId: "hardware_id1",
            selectedName: undefined,
            splitFraction: 0.25,
          }}
        />
      </PanelSetup>
    );
  },
};
