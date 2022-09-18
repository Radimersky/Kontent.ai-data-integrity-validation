import { Container, Divider, Grid } from '@mui/material';
import { Box } from '@mui/system';
import DeliverVariantImport from '../components/DeliverVariantImport';
import { useState } from 'react';
import React from 'react';
import useFetchDeliverVariants, { DeliverVariantCards } from '../hooks/useFetchDeliverVariants';
import { Loader } from '../components/Loader';
import {
  variantIdFilter,
  projectIdFilter,
  itemCodenameFilter,
  fetchVariants
} from '../api/solana/FetchVariants';

const flexCenterStyle = { display: 'flex', justifyContent: 'center' };

const DeliverVariants = () => {
  const [projectId, setProjectId] = useState('');
  const { variantCards, isFetching, errorMessage } = useFetchDeliverVariants(projectId);

  const loadVariants = (projectId: string) => {
    setProjectId(projectId);
  };

  return (
    <Container maxWidth={false}>
      <Box marginTop={3} sx={flexCenterStyle}>
        <h1>Variants from Deliver</h1>
      </Box>
      <DeliverVariantImport onSubmit={loadVariants} error={false} importing={isFetching} />
      <Box color={'red'}>{errorMessage}</Box>
      {isFetching && <Loader />}

      {variantCards?.map((variantCard: DeliverVariantCards) => {
        return (
          <React.Fragment key={variantCard.language}>
            <Box marginTop={4} marginBottom={1} sx={flexCenterStyle}>
              <h2>{variantCard.language}</h2>
            </Box>
            <Grid container spacing={4}>
              {variantCard.variantCards}
            </Grid>
            <Divider style={{ width: '100%', paddingTop: '50px' }} />
          </React.Fragment>
        );
      })}
    </Container>
  );
};

export default DeliverVariants;
