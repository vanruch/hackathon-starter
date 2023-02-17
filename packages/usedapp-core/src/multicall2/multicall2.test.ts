import { Contract, ContractFactory, Provider, Wallet } from "ethers";
import { expect } from 'chai'
import { multicall } from ".";
import { ERC20Mock, MultiCall2 } from "../constants";
import { InterfaceAbi } from "ethers/types/abi";
import { JsonRpcProvider } from "ethers";

async function deployContract(deployer: Wallet, contract: { abi: InterfaceAbi, bytecode: string }, args: any[] = []): Promise<Contract> {
  const tx = await new ContractFactory(contract.abi, contract.bytecode, deployer).deploy(...args)
  return tx.waitForDeployment() as any
}

describe('Multicall2', () => {
  const mockProvider = new JsonRpcProvider('http://127.0.0.1:8545/')
  const deployer = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', mockProvider)
  let tokenContract: Contract
  let multicallContract: Contract

  before(async () => {
    const args = ['MOCKToken', 'MOCK', deployer.address, '10000']
    tokenContract = await deployContract(deployer, ERC20Mock, args)
    multicallContract = await deployContract(deployer, MultiCall2)
  })

      it('Retrieves token balance using tryAggregate', async () => {
        const call = {
          target: await tokenContract.getAddress(),
          abi: ERC20Mock.abi,
          method: 'balanceOf',
          params: [deployer.address],
        }
        const result = await multicall(mockProvider as any as Provider, [call], {
          overrideMulticallAddress: await multicallContract.getAddress()
        })
        const { value, success } = result[0]
        expect(success).to.be.true
        expect(value).to.eq(10000n)
      })

      it('Does not fail when doing multiple calls at once', async () => {
        const calls = [
          {
            target: await tokenContract.getAddress(),
            method: 'balanceOf',
            params: [deployer.address],
            abi: ERC20Mock.abi,
          },
          {
            target: await tokenContract.getAddress(),
            method: 'symbol',
            params: [],
            abi: ERC20Mock.abi,
          },
          {
            target: await tokenContract.getAddress(),
            method: 'balanceOf',
            params: [await tokenContract.getAddress()],
            abi: ERC20Mock.abi,
          },
        ]
        const result = await multicall(mockProvider, calls, {
          overrideMulticallAddress: await multicallContract.getAddress()
        })

        let { value, success } = result[0]
        expect(value).to.equal(10000n)
        expect(success).to.be.true
        ;({ value, success } = result[1] || {})
        expect(value).to.equal('MOCK')
        expect(success).to.be.true
        ;({ value, success } = result[2] || {})
        expect(value).to.equal(0n)
        expect(success).to.be.true
      })

      it('Does not fail when some of the calls fail', async () => {
        const calls = [
          {
            target: await tokenContract.getAddress(),
            method: 'balanceOf',
            params: [deployer.address],
            abi: ERC20Mock.abi,
          },
          {
            target: await tokenContract.getAddress(),
            method: 'transferFrom',
            params: [
              await multicallContract.getAddress(),
              deployer.address,
              10000n,
            ],
            abi: ERC20Mock.abi,
          },
          {
            target: await tokenContract.getAddress(),
            method: 'balanceOf',
            params: [await tokenContract.getAddress()],
            abi: ERC20Mock.abi,
          },
        ]

        const result = await multicall(mockProvider, calls, {
          overrideMulticallAddress: await multicallContract.getAddress()
        })

        let { value, success } = result[0]
        expect(value).to.equal(10000n)
        expect(success).to.be.true
        ;({ value, success } = result[1])
        expect(value).to.equal('ERC20: transfer amount exceeds balance')
        expect(success).to.be.false
        ;({ value, success } = result[2])
        expect(value).to.equal(0n)
        expect(success).to.be.true
      })
})
