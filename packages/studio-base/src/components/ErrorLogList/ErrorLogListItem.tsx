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
  const { onClick: onClickItem, onTouchEnd: onTouchEndItem } = clickOrTap(() =>
    handleClickItem(item, index),
  );
  const { onClick: onClickFeedback, onTouchEnd: onTouchEndFeedback } = clickOrTap(() =>
    handleClickFeedback(item.error_contents),
  );
  const style = isSelected ? { fontWeight: 900, color: red[500] } : {};

  return (
    <ListItem>
      <ListItemButton onClick={onClickItem} onTouchEnd={onTouchEndItem}>
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
            onTouchEnd={onTouchEndFeedback}
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

// https://gist.github.com/hanakla/37bc63cad897a51e8b7a4bd3d6610d44
function clickOrTap(
  handler:
    | ((event: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => void)
    | undefined,
) {
  return {
    onClick: (event: React.MouseEvent<HTMLInputElement>) => {
      if (typeof handler === "function") {
        handler(event);
      }
    },
    onTouchEnd: (event: React.TouchEvent<HTMLInputElement>) => {
      // during scrolling
      if (!event.cancelable) {
        return;
      }
      const touch = event.changedTouches[0];
      const bound = event.currentTarget.getBoundingClientRect();
      // outside of the element
      if (
        touch != undefined &&
        (touch.clientX < bound.left ||
          touch.clientX > bound.right ||
          touch.clientY < bound.top ||
          touch.clientY > bound.bottom)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (
        handler == undefined &&
        ["INPUT", "SELECT", "TEXTAREA"].includes(event.currentTarget.tagName)
      ) {
        event.currentTarget.focus();
      } else {
        if (typeof handler === "function") {
          handler(event);
        }
      }
    },
  };
}

export default React.memo(ErrorLogListItem);
