import { Grid, Paper, Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import StyledCardRow from '../StyledCardRow';
import DeliverVariantCardDetail from './DeliverVariantCardDetail';
import React from 'react';
import { DeliverVariantModel } from '../../models/Variant';

export type IDeliverVariantCardProps = {
  readonly deliverVariant: DeliverVariantModel;
  readonly projectId: string;
};

const DeliverVariantCard: React.FC<IDeliverVariantCardProps> = ({ deliverVariant, projectId }) => {
  const [open, setOpen] = React.useState(false);
  const { system } = { ...deliverVariant };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Grid item xs={3} sx={{ minWidth: 300 }}>
        <Paper elevation={3}>
          <Box padding={2}>
            <h2>
              <b>{system.name}</b>
            </h2>
            <Box marginY={1}>
              <StyledCardRow name="Item ID" value={system.id} />
              <StyledCardRow name="Codename" value={system.codename} />
              <StyledCardRow name="Last modified" value={system.last_modified} />
              <StyledCardRow name="Type" value={system.type} />
              <StyledCardRow name="Language" value={system.language} />
            </Box>
            <Box display={'flex'} justifyContent={'space-between'}>
              <Button variant="contained" startIcon={<ReadMoreIcon />} onClick={handleClickOpen}>
                Detail
              </Button>
              <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
                Delete
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
      <DeliverVariantCardDetail
        open={open}
        handleClose={handleClose}
        deliverVariant={deliverVariant}
        projectId={projectId}
      />
    </>
  );
};

export default DeliverVariantCard;