// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { withStyles } from "tss-react/mui";

export const DiffSpan = withStyles("span", (theme) => ({
  root: {
    padding: theme.spacing(0, 0.5),
    textDecoration: "inherit",
    whiteSpace: "pre-line",
  },
}));
