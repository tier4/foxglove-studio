// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { produce } from "immer";
import { set } from "lodash";
import { useMemo } from "react";

import { useShallowMemo } from "@foxglove/hooks";
import { SettingsTreeAction, SettingsTreeNode, SettingsTreeNodes } from "@foxglove/studio";

import { Config } from "./types";

export function settingsActionReducer(prevConfig: Config, action: SettingsTreeAction): Config {
  return produce(prevConfig, (draft) => {
    switch (action.action) {
      case "perform-node-action":
        break;
      case "update":
        switch (action.payload.path[0]) {
          case "general":
            set(draft, [action.payload.path[1]!], action.payload.value);
            break;
          default:
            throw new Error(`Unexpected payload.path[0]: ${action.payload.path[0]}`);
        }
        break;
    }
  });
}

export function useSettingsTree(
  config: Config,
  pathParseError: string | undefined,
  error: string | undefined,
): SettingsTreeNodes {
  const { path, on, reverse } = config;
  const generalSettings: SettingsTreeNode = useMemo(
    () => ({
      error,
      fields: {
        path: {
          label: "Data",
          input: "messagepath",
          value: path,
          error: pathParseError,
        },
        on: {
          label: "On",
          input: "number",
          value: on,
        },
        reverse: {
          label: "Reverse",
          input: "boolean",
          value: reverse,
        },
      },
    }),
    [error, path, pathParseError, on, reverse],
  );

  return useShallowMemo({
    general: generalSettings,
  });
}
