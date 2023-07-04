// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import List from "@mui/material/List";
import React, { useState, useMemo } from "react";

import ErrorLogListItem, { ErrorLog } from "./ErrorLogListItem";

export type ErrorLogListProps = {
  errorLogs?: ErrorLog[];
  feedbackContentIds?: string[];
  handleClickItem: (item: ErrorLog) => void;
  handleClickFeedback: (error_content: string) => void;
  desc?: boolean;
  hiddenScore?: boolean;
};

const ErrorLogList = ({
  errorLogs = [],
  feedbackContentIds = [],
  handleClickItem,
  handleClickFeedback,
  desc = false,
  hiddenScore = false,
}: ErrorLogListProps): React.ReactElement => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const handleClickErrorLog = React.useCallback(
    (item: ErrorLog, index: number) => {
      setSelectedIndex(index);
      handleClickItem(item);
    },
    [handleClickItem],
  );

  const sortByTimestamp = React.useCallback(
    (a: ErrorLog, b: ErrorLog) => {
      const prevTime = parseInt(a.timestamp);
      const nextTime = parseInt(b.timestamp);
      if (desc) {
        return prevTime > nextTime ? -1 : nextTime > prevTime ? 1 : 0;
      } else {
        return prevTime > nextTime ? 1 : nextTime > prevTime ? -1 : 0;
      }
    },
    [desc],
  );

  const sortedErrorLogs = useMemo(() => {
    return errorLogs.concat().sort(sortByTimestamp);
  }, [errorLogs, sortByTimestamp]);

  return (
    <List>
      {sortedErrorLogs.map((item, index) => {
        const isSelected = selectedIndex === index;
        const hasFeedback = feedbackContentIds.includes(item.error_contents);
        return (
          <ErrorLogListItem
            key={index}
            index={index}
            isSelected={isSelected}
            item={item}
            hiddenScore={hiddenScore}
            hasFeedback={hasFeedback}
            handleClickItem={handleClickErrorLog}
            handleClickFeedback={handleClickFeedback}
          />
        );
      })}
    </List>
  );
};

export default React.memo(ErrorLogList);
