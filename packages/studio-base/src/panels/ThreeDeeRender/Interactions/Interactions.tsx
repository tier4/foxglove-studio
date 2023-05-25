// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2018-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import { Cursor24Regular } from "@fluentui/react-icons";
import DownloadIcon from "@mui/icons-material/Download";
import { Button, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

import Logger from "@foxglove/log";
import type { LayoutActions } from "@foxglove/studio";
import ExpandingToolbar, {
  ToolGroup,
  ToolGroupFixedSizePane,
} from "@foxglove/studio-base/components/ExpandingToolbar";
import { downloadFiles } from "@foxglove/studio-base/util/download";

import ObjectDetails from "./ObjectDetails";
import TopicLink from "./TopicLink";
import { InteractionData } from "./types";
import { Pose } from "../transforms";

const log = Logger.getLogger(__filename);

// ts-prune-ignore-next
export const OBJECT_TAB_TYPE = "Selected object";
export type TabType = typeof OBJECT_TAB_TYPE;

export type SelectionObject = {
  object: {
    pose: Pose;
    interactionData?: InteractionData;
  };
  instanceIndex: number | undefined;
};

type Props = {
  interactionsTabType?: TabType;
  setInteractionsTabType: (arg0?: TabType) => void;
  addPanel: LayoutActions["addPanel"];
  selectedObject?: SelectionObject;
  timezone: string | undefined;
  /** Override default downloading behavior, used for Storybook */
  onDownload?: (blob: Blob, fileName: string) => void;
};

const InteractionsBaseComponent = React.memo<Props>(function InteractionsBaseComponent({
  addPanel,
  selectedObject,
  interactionsTabType,
  setInteractionsTabType,
  timezone,
  onDownload,
}: Props) {
  const selectedInteractionData = selectedObject?.object.interactionData;
  const originalMessage = selectedInteractionData?.originalMessage;
  const instanceDetails = selectedInteractionData?.instanceDetails;

  const { enqueueSnackbar } = useSnackbar();

  return (
    <ExpandingToolbar
      tooltip="Inspect objects"
      icon={<Cursor24Regular />}
      selectedTab={interactionsTabType}
      onSelectTab={(newSelectedTab) => setInteractionsTabType(newSelectedTab)}
    >
      <ToolGroup name={OBJECT_TAB_TYPE}>
        <ToolGroupFixedSizePane>
          {originalMessage ? (
            <>
              {selectedInteractionData.topic && (
                <TopicLink addPanel={addPanel} topic={selectedInteractionData.topic} />
              )}
              {instanceDetails ? (
                <ObjectDetails selectedObject={instanceDetails} timezone={timezone} />
              ) : (
                <></>
              )}
              <ObjectDetails
                selectedObject={originalMessage}
                interactionData={selectedInteractionData}
                timezone={timezone}
              />
              {selectedInteractionData.downloader && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    void selectedInteractionData
                      .downloader?.()
                      .then((result) => {
                        if (!result) {
                          return;
                        }
                        if (onDownload) {
                          onDownload(result.blob, result.fileName);
                        } else {
                          downloadFiles([result]);
                        }
                      })
                      .catch((err) => {
                        enqueueSnackbar((err as Error).message, { variant: "error" });
                        log.error(err);
                      });
                  }}
                >
                  Download
                </Button>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.disabled" gutterBottom>
              Click an object in the 3D view to select it.
            </Typography>
          )}
        </ToolGroupFixedSizePane>
      </ToolGroup>
    </ExpandingToolbar>
  );
});

// Wrap the Interactions so that we don't rerender every time any part of the PanelContext config changes, but just the
// one value that we care about.
export default function Interactions(props: Props): JSX.Element {
  return <InteractionsBaseComponent {...props} />;
}
