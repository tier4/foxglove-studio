// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/


import HelpIcon from '@mui/icons-material/Help';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Avatar,
} from '@mui/material';
import { red } from '@mui/material/colors';
import React from "react";


export type ErrorLog = {
  "timestamp": string;
  "error_contents":  string;
  "error_message": string;
  "error_score": string;
  "scenario_start_id"?: string;
  "scenario_end_id"?: string;
  "position.x"?: string;
  "position.y"?: string;
  "position.z"?: string;
  "orientation.x"?: string;
  "orientation.y"?: string;
  "orientation.z"?: string;
  "orientation.w"?: string;
  "error_id"?: string;
}


export type ErrorLogListItemProps = {
  index: number;
  isSelected: boolean;
  item: ErrorLog;
  hasFeedback: boolean;
  handleClickItem: (item: ErrorLog, index: number) => void;
  handleClickFeedback: (error_content: string) => void;
  hiddenScore?: boolean;
}


const ErrorLogListItem = React.memo(({
  index,
  isSelected,
  item,
  hasFeedback,
  handleClickItem,
  handleClickFeedback,
  hiddenScore = false,
}: ErrorLogListItemProps) => {

  return (
    <ListItem
      button
      selected={isSelected}
      {...clickOrTap(() => handleClickItem(item, index))}
    >
      <ListItemAvatar>
        <Avatar variant='circular' sx={{ bgcolor: red[800], fontSize: 20, color: 'white' }}>
          {index+1}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Typography
            variant="h6"
            sx={isSelected ? { fontWeight: 900, color: red[500], } : null}
          >
            {item.error_message}
          </Typography>
        }
        secondary={!hiddenScore &&
          <Typography
            variant="subtitle1"
            sx={isSelected ? { fontWeight: 900, color: red[500], } : null}
          >
            −{item.error_score}点
          </Typography>
        }
      />
      { hasFeedback &&
        <ListItemSecondaryAction>
          <IconButton
            sx={isSelected ? { fontWeight: 900, color: red[500], } : null}
            {...clickOrTap(() => handleClickFeedback(item.error_contents))}
          >
            <HelpIcon style={{ fontSize: 25 }} />
          </IconButton>
        </ListItemSecondaryAction>
      }
    </ListItem>
  );
});


// https://gist.github.com/hanakla/37bc63cad897a51e8b7a4bd3d6610d44
function clickOrTap(handler: any) {
  return {
    onClick: (event: any) => {
      if (typeof handler === 'function') {
        handler(event);
      }
    },
    onTouchEnd: (event: any) => {
      if (event.cancelable === false) {
        // スクロール時はcancellable === falseなのでハンドラーを呼ばない
        return;
      }

      const touch = event.changedTouches[0];
      const bound = event.currentTarget.getBoundingClientRect();

      if (
        touch.clientX < bound.left
        || touch.clientX > bound.right
        || touch.clientY < bound.top
        || touch.clientY > bound.bottom
      ) {
        // 領域外で指を離したらハンドラーを呼ばない
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (handler == null && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.currentTarget.tagName)) {
        event.currentTarget.focus();
      } else {
        if (typeof handler === 'function') {
          handler(event);
        }
      }
    },
  };
}

export default ErrorLogListItem;
