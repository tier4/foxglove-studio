// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import List from '@mui/material/List';
import React, { useState, useMemo } from "react";

import ErrorLogListItem, { ErrorLog, ErrorLogListEmptyItem } from './ErrorLogListItem';

export type ErrorLogListProps = {
  errorLogs?: ErrorLog[],
  feedbackContentIds?: string[],
  handleClickItem?: (item: ErrorLog) => void,
  handleClickFeedback?: (error_content: string) => void,
  desc?: boolean,
}

function ErrorLogList({
  errorLogs = [],
  feedbackContentIds = [],
  handleClickItem = () => null,
  handleClickFeedback = () => null,
  desc = false,
}: ErrorLogListProps): React.ReactElement {

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const _handleClickItem = (item: any, index: number) => {
    setSelectedIndex(index);
    handleClickItem(item);
  }

  const sortByTimestamp = React.useCallback((a: ErrorLog, b: ErrorLog) => {
    const prevTime = parseInt(a.timestamp);
    const nextTime = parseInt(b.timestamp);
    if (desc) {
      return (prevTime > nextTime) ? -1 : ((nextTime > prevTime) ? 1 : 0);
    } else {
      return (prevTime > nextTime) ? 1 : ((nextTime > prevTime) ? -1 : 0);
    }
  }, [desc]);

  const sortedErrorLogs = useMemo(() => {
    return errorLogs.concat().sort(sortByTimestamp);
  }, [errorLogs, sortByTimestamp]);

  return (
    <List
      // sx={{ width: '100%', paddingBottom: 40 }}
    >
    { sortedErrorLogs.length > 0 ?
      sortedErrorLogs.map((item, index) => {
        const isSelected = selectedIndex === index;
        const hasFeedback = feedbackContentIds.includes(item.error_contents);
        return (
          <ErrorLogListItem
            key={index}
            index={index}
            isSelected={isSelected}
            item={item}
            hasFeedback={hasFeedback}
            handleClickItem={_handleClickItem}
            handleClickFeedback={handleClickFeedback}
          />
        );
      })
      :
      <ErrorLogListEmptyItem />
    }
    </List>
  )
}


export default React.memo(ErrorLogList);
