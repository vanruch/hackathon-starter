import {BytesLike, Interface, Provider} from 'ethers'

export const byteCodeCallerAbi = [
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "callData",
          "type": "bytes"
        }
      ],
      "name": "executeBytecode",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "returnData",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const

export function encodeExecuteBytecode(bytecode: BytesLike, calldata: BytesLike) {
    const executorInterface = new Interface(byteCodeCallerAbi)
    return executorInterface.encodeFunctionData('executeBytecode', [bytecode, calldata]) 
}

export function decodeExecuteBytecode(result: BytesLike) {
    const executorInterface = new Interface(byteCodeCallerAbi)
    return executorInterface.decodeFunctionResult('executeBytecode', result)[0]
}

export async function executeBytecode(ByteCodeCallerAddress: string,bytecode: BytesLike, callData: BytesLike, provider: Provider){
    const executorCallData = encodeExecuteBytecode(bytecode, callData)
    const result = await provider.call({
      to: ByteCodeCallerAddress,
      data: executorCallData
    })
    return decodeExecuteBytecode(result)
}