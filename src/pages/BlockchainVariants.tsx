import { Container } from '@mui/material';
import useWorkspace from '../utils/useWorkspace';

const BlockchainVariants = () => {
  const workspace = useWorkspace();
  return (
    <Container>
      <>
        <p>{workspace.wallet?.publicKey.toString()}</p>
        <p>{workspace.connection.commitment}</p>
        <p>{workspace.program.programId.toString()}</p>
        <p>{workspace.provider.wallet.publicKey.toString()}</p>
      </>
    </Container>
  );
};

export default BlockchainVariants;
