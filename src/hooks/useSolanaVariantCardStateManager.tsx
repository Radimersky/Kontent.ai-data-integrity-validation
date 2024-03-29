import { useEffect, useState } from 'react';
import hash from 'object-hash';
import { getVariant } from '../api/deliver/GetVariant';
import { DeliverVariantModel, DeliverVariant } from '../models/Variant';
import SolanaVariantDialog, {
  DialogContent
} from '../components/solanaVariantCard/SolanaVariantDialog';
import {
  areStringsEqual,
  issueTypeToSolanaVariantIntegrityMapper,
  makeSentence
} from '../utils/Utils';
import { DatabaseVariantWithId, getDatabaseVariantOrNull, IssueType } from '../utils/Firebase';
import {
  obsoleteSolanaVariantTemplate,
  deliverVariantNotFoundTemplate
} from '../templates/DialogTemplates';

export enum SolanaVariantIntegrityState {
  Compromised,
  Intact,
  Obsolete,
  NotFound,
  Unknown
}

export const useSolanaVariantCardStateManager = (
  variant: DeliverVariant,
  bearer: string,
  handleIntegrityViolation: () => void,
  handleRemove: () => void
) => {
  const [checkingIntegrity, setCheckingIntegrity] = useState(false);
  const [variantIntegrityInfoMessage, setVariantIntegrityInfoMessage] = useState(<></>);
  const [showDialog, setShowDialog] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [deliverVariantHash, setDeliverVariantHash] = useState('');
  const [databaseMetaData, setDatabaseMetaData] = useState<DatabaseVariantWithId | null>(null);
  const [dialogContent, setDialogContent] = useState<DialogContent>({
    title: '',
    body: <></>
  });
  const [variantIntegrityState, setVariantIntegrityState] = useState<SolanaVariantIntegrityState>(
    SolanaVariantIntegrityState.Unknown
  );

  // Set initaial state with data from database
  useEffect(() => {
    const fetchDatabaseVariant = async () => {
      return await getDatabaseVariantOrNull(variant.publicKey);
    };

    fetchDatabaseVariant()
      .then((data) => {
        setDatabaseMetaData(data);
        const issueType = data?.databaseVariant.issueType;
        const persistedState = issueTypeToSolanaVariantIntegrityMapper(issueType);
        setVariantIntegrityState(persistedState);

        if (issueType) {
          if (issueType === IssueType.Compromised) {
            setVariantIntegrityInfoMessage(
              <>
                <p>
                  <b>Compromised content item variant.</b>
                </p>
                <br></br>
                <p>Delivery content item variant hash:</p>
                <p>{databaseMetaData?.databaseVariant.compromisedHash}</p>
              </>
            );
          } else {
            setVariantIntegrityInfoMessage(<p>{makeSentence(issueType)}</p>);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const notifyVariantIsObsolete = (
    deliverVariantLastModified: Date,
    solanaVariantLastModified: Date
  ) => {
    setDialogContent(
      obsoleteSolanaVariantTemplate(deliverVariantLastModified, solanaVariantLastModified)
    );
    setVariantIntegrityState(SolanaVariantIntegrityState.Obsolete);
    setShowDialog(true);
  };

  const notifyVariantNotFound = (responseStatus: number) => {
    setVariantIntegrityState(SolanaVariantIntegrityState.NotFound);

    if (responseStatus === 401) {
      setVariantIntegrityInfoMessage(<p>Please enter bearer token to Delivery API</p>);
      setAuthRequired(true);
    } else {
      setDialogContent(deliverVariantNotFoundTemplate);
      setShowDialog(true);
    }
  };

  const moveToObsoleteState = () => {
    setShowDialog(false);
    if (SolanaVariantIntegrityState.Obsolete) {
      setVariantIntegrityInfoMessage(
        <p>
          Delivery contains updated version of this content item variant. You can remove this
          variant because it is obsolete.
        </p>
      );
    } else if (SolanaVariantIntegrityState.NotFound) {
      setVariantIntegrityInfoMessage(<p>Delivery content item variant was not found.</p>);
    }

    setVariantIntegrityState(SolanaVariantIntegrityState.Obsolete);
  };

  const moveToCompromisedState = (deliverHash: string) => {
    setVariantIntegrityInfoMessage(
      <>
        <p>Variant hash mismatch!</p>
        <p>
          The content item variant is inconsistent. Its data hash does not match the one saved on
          blockchain.
        </p>
        <br></br>
        <p>
          <b>Current hash of Delivery variant is:</b>
        </p>
        <p>{deliverHash}</p>
      </>
    );
    setVariantIntegrityState(SolanaVariantIntegrityState.Compromised);
    handleIntegrityViolation();
  };

  const moveToIntactState = () => {
    setVariantIntegrityState(SolanaVariantIntegrityState.Intact);
    setVariantIntegrityInfoMessage(
      <>
        <p>Delivery content item variant is consistent with the one on Solana blockchain</p>
      </>
    );
  };

  const removeVariant = () => {
    setVariantIntegrityInfoMessage(<p>Content item variant can be removed.</p>);
    setShowDialog(false);
    handleRemove();
  };

  const evaluateStateFromDeliverVariant = (deliverVariant: DeliverVariantModel) => {
    const deliverVariantLastModified = new Date(deliverVariant.system.last_modified);
    const solanaVariantLastModified = new Date(variant.lastModified);

    // We need to remove millis from the date, because they were lost when solanaVariantLastModified was converted from byte array (BN library) to date object.
    const areLastModifiedDatesEqual =
      deliverVariantLastModified.getTime() - deliverVariantLastModified.getMilliseconds() ===
      solanaVariantLastModified.getTime();

    const deliverVariantHash = hash(deliverVariant);
    const areVariantHashesEqual = areStringsEqual(deliverVariantHash, variant.variantHash);
    setDeliverVariantHash(deliverVariantHash);

    if (!areLastModifiedDatesEqual) {
      notifyVariantIsObsolete(deliverVariantLastModified, solanaVariantLastModified);
    } else if (!areVariantHashesEqual) {
      moveToCompromisedState(deliverVariantHash);
    } else {
      moveToIntactState();
    }
  };

  const checkIntegrity = () => {
    setCheckingIntegrity(true);

    setVariantIntegrityState(SolanaVariantIntegrityState.Unknown);
    setVariantIntegrityInfoMessage(<p>Checking integrity.</p>);

    getVariant(
      variant.projectId,
      variant.itemCodename,
      variant.variantId,
      bearer === '' ? undefined : bearer
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          notifyVariantNotFound(response.status);
          throw response;
        }
      })
      .then((deliverItem) => {
        evaluateStateFromDeliverVariant(deliverItem.item);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setCheckingIntegrity(false);
      });
  };

  const IntegrityCompromisationCheckDialog = () => (
    <SolanaVariantDialog
      open={showDialog}
      handleConfirm={removeVariant}
      handleDeny={moveToObsoleteState}
      dialogContent={dialogContent}
    />
  );

  return {
    checkIntegrity,
    checkingIntegrity,
    variantIntegrityState,
    IntegrityCompromisationCheckDialog,
    variantIntegrityInfoMessage,
    deliverVariantHash,
    authRequired
  };
};
