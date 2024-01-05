// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import React from "react";

export type FeedbackDialogProps = {
  open: boolean;
  contentUrl: string;
  handleClose: () => void;
};

function FeedbackDialog({ open, contentUrl, handleClose }: FeedbackDialogProps) {
  return (
    <Dialog fullWidth={true} maxWidth="md" open={open} onClose={handleClose}>
      <DialogContent>
        <Box textAlign="center">
          {open && (
            <img alt="feedback" src={contentUrl} style={{ objectFit: "contain", width: "100%" }} />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" startIcon={<CloseIcon />} onClick={handleClose}>
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(FeedbackDialog);
