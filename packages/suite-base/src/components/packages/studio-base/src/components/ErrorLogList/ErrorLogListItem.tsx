// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import HelpIcon from "@mui/icons-material/Help";
import {
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Avatar,
  ListItem,
} from "@mui/material";
import { red, grey } from "@mui/material/colors";
import React from "react";

export type ErrorLog = {
  timestamp: string;
  error_contents: string;
  error_message: string;
  error_score: string;
  scenario_start_id?: string;
  scenario_end_id?: string;
  "position.x"?: string;
  "position.y"?: string;
  "position.z"?: string;
  "orientation.x"?: string;
  "orientation.y"?: string;
  "orientation.z"?: string;
  "orientation.w"?: string;
  error_id?: string;
};

export type ErrorLogListItemProps = {
  index: number;
  isSelected: boolean;
  item: ErrorLog;
  hasFeedback: boolean;
  handleClickItem: (item: ErrorLog, index: number) => void;
  handleClickFeedback: (error_content: string) => void;
  hiddenScore?: boolean;
};

const ErrorLogListItem = ({
  index,
  isSelected,
  item,
  hasFeedback,
  handleClickItem,
  handleClickFeedback,
  hiddenScore = false,
}: ErrorLogListItemProps) => {
  const style = isSelected ? { fontWeight: 900, color: red[500] } : {};

  const onClickItem = React.useCallback(() => {
    handleClickItem(item, index);
  }, [handleClickItem, item, index]);

  const onClickFeedback = React.useCallback(() => {
    handleClickFeedback(item.error_contents);
  }, [handleClickFeedback, item]);

  return (
    <ListItem>
      <ListItemButton onClick={onClickItem}>
        <ListItemAvatar>
          <Avatar
            variant="circular"
            // eslint-disable-next-line react/forbid-component-props
            sx={{ bgcolor: isSelected ? red[800] : grey[600], fontSize: 20, color: "white" }}
          >
            {index + 1}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <Typography
              variant="h6"
              // eslint-disable-next-line react/forbid-component-props
              sx={style}
            >
              {item.error_message}
            </Typography>
          }
          secondary={
            !hiddenScore && (
              <Typography
                variant="subtitle1"
                // eslint-disable-next-line react/forbid-component-props
                sx={style}
              >
                −{item.error_score}点
              </Typography>
            )
          }
        />
      </ListItemButton>
      {hasFeedback && (
        <ListItemSecondaryAction>
          <IconButton
            component="span"
            onClick={onClickFeedback}
            // eslint-disable-next-line react/forbid-component-props
            sx={style}
          >
            <HelpIcon style={{ fontSize: 25 }} />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default React.memo(ErrorLogListItem);
