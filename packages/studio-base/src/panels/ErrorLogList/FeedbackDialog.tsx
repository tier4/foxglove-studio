// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Dialog, DialogContent } from '@mui/material';
import React from 'react';

export type FeedbackDialogProps = {
  open: boolean;
  contentUrl: string;
  handleClose: (event: any) => void;
}

function FeedbackDialog({ open, contentUrl, handleClose }: FeedbackDialogProps) {

  return (
    <Dialog
      fullWidth={true}
      maxWidth="lg"
      open={open}
      onClose={handleClose}
    >
      <DialogContent sx={{ textAlign: 'center' }}>
      { open &&
        <img
          alt="feedback"
          src={contentUrl}
          style={{ objectFit: "contain", width: "100%" }}
        />
      }
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(FeedbackDialog);
