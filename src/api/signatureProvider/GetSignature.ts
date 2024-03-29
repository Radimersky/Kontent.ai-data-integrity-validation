import { signatureProviderAPIBaseUrl } from '../../AppConfig';
import { DeliverVariantModel } from '../../models/Variant';

export const getSignature = async (deliverVariant: DeliverVariantModel) => {
  return fetch(signatureProviderAPIBaseUrl + 'sign/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deliverVariant)
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.error(e);
    });
};
