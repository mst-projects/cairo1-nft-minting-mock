import {
  constants,
  Provider,
} from 'starknet';

export const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } })

export async function getChainId() {
  const chainId = await provider.getChainId();
  return chainId;
}