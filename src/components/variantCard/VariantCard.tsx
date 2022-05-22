import { Grid, Paper, Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import StyledCardRow from './StyledCardRow';
import VariantDialog from '../VariantDetail';
import React from 'react';

interface IVariantCardProps {
  readonly id: string;
  readonly name: string;
  readonly codename: string;
  readonly language: string;
  readonly type: string;
  readonly collection: string;
  readonly sitemap_locations: never[];
  readonly last_modified: string;
  readonly workflow_step: string;
}

const VariantCard: React.FC<IVariantCardProps> = ({
  id,
  name,
  codename,
  last_modified,
  type,
  language
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Grid item xs={4} sx={{ minWidth: 400 }}>
        <Paper elevation={3}>
          <Box padding={2}>
            <h2>
              <b>{name}</b>
            </h2>
            <Box marginY={1}>
              <StyledCardRow name="Variant ID" value={id} />
              <StyledCardRow name="Codename" value={codename} />
              <StyledCardRow name="Last modified" value={last_modified} />
              <StyledCardRow name="Type" value={type} />
              <StyledCardRow name="Language" value={language} />
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
      <VariantDialog open={open} handleClose={handleClose} />
    </>
  );
};

export default VariantCard;
