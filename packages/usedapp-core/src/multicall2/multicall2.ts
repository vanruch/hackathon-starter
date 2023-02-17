import { Interface, Provider } from "ethers";
import { decodeTryAggregate } from './decoder'
import { encodeTryAggregate } from './encoder'
import { ChainId, DEFAULT_SUPPORTED_CHAINS } from "../constants";
import { InterfaceAbi } from "ethers/types/abi";

const errorInterface = new Interface(['function Error(string)'])

export interface RawCall {
  /**
   * address of a contract to call
   */
  address: string
  /**
   * calldata of the call that encodes function call
   */
  data: string
  /**
   * chain id of the chain to perform the call on
   */
  chainId: ChainId
  /**
   * Whether the call is static (not expected to change between calls). Used for optimizations.
   */
  isStatic?: boolean
  /**
   * number of last updated block
   */
  lastUpdatedBlockNumber?: number
  /**
   * number of blocks to wait before updating the call
   */
  refreshPerBlocks?: number
}

export type RawCallResult =
  | {
  value: string
  success: boolean
}
  | undefined

type ChainState = {
  [address: string]:
    | {
    [data: string]: RawCallResult
  }
    | undefined
}

export const getChainById = (chainId: ChainId) =>
  DEFAULT_SUPPORTED_CHAINS.find((network) => network.chainId === chainId)

export type MulticallOpts = {
  blockNumber?: number
  overrideMulticallAddress?: string
}

export async function multicall(
  provider: Provider,
  calls: {
    target: string,
    abi: InterfaceAbi,
    method: string,
    params: any[]
  }[],
  { overrideMulticallAddress, blockNumber}: MulticallOpts,
) {
  const chainId = Number((await provider.getNetwork()).chainId)
  const multicallAddress = overrideMulticallAddress ?? getChainById(chainId)?.multicall2Address
  if (!multicallAddress) throw new Error('Unsupported chainId: ' + chainId)
  const rawCalls = calls.map(({abi, method, params, target}) => {
    const iface = new Interface(abi)
    const data = iface.encodeFunctionData(method, params)
    return {
      address: target,
      data,
      chainId
    }
  })
  const results = await fastEncodingMulticall2(provider, multicallAddress, blockNumber, rawCalls)
  return calls.map(({abi, method, params, target}) => {
    const iface = new Interface(abi)
    const data = iface.encodeFunctionData(method, params)
    const { success, value } = results[target]![data]!
    if (!success) {
      return {
        success,
        value: errorInterface.decodeFunctionData('Error', value)[0]
      }
    } else {
      return {
        success,
        value: iface.decodeFunctionResult(method, value)[0]
      }
    }
  })
}

/**
 * @public
 */
export async function fastEncodingMulticall2(
  provider: Provider,
  address: string,
  blockNumber: number | undefined,
  requests: RawCall[]
): Promise<ChainState> {
  if (requests.length === 0) {
    return {}
  }
  const response = await provider.call(
    {
      to: address,
      data: encodeTryAggregate(
        false,
        requests.map(({ address, data }) => [address, data])
      ),
      blockTag: blockNumber
    }
  )
  const [results] = decodeTryAggregate(response)
  return decodeResult(results, requests)
}

function decodeResult(results: [boolean, string][], requests: RawCall[]) {
  const state: ChainState = {}
  for (let i = 0; i < requests.length; i++) {
    const { address, data } = requests[i]
    const [success, value] = results[i]
    const stateForAddress = state[address] ?? {}
    stateForAddress[data] = { success, value }
    state[address] = stateForAddress
  }
  return state
}
