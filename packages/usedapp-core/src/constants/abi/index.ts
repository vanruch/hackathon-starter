import { Interface } from 'ethers'
import MultiCall from './MultiCall.json' assert { type: "json" }
import MultiCall2 from './MultiCall2.json' assert { type: "json" }
import ERC20 from './ERC20.json' assert { type: "json" }
import ERC20Mock from './ERC20Mock.json' assert { type: "json" }
import BlockNumberContract from './BlockNumber.json' assert { type: "json" }

const MultiCallABI = new Interface(MultiCall.abi)

export { MultiCall, MultiCallABI }

const MultiCall2ABI = new Interface(MultiCall2.abi)

export { MultiCall2, MultiCall2ABI }

const ERC20Interface = new Interface(ERC20.abi)

export { ERC20, ERC20Interface }

const ERC20MockInterface = new Interface(ERC20Mock.abi)

export { ERC20Mock, ERC20MockInterface }

export { BlockNumberContract }

export * from './doubler'
export * from './timestamp'
export * from './reverter'
