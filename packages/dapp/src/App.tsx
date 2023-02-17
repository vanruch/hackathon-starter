import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { Button } from "ui";

import { BrowserProvider, Interface } from 'ethers'
import {  executeBytecode } from "./abis/ByteCodeCaller";
import { flexiblePortfolioGetterAbi, flexiblePortfolioGetterBytecode } from "./abis/FlexiblePortfolioGetterAbi";

const ByteCodeCallerAddress = '0xdD356f178C3877972DfC52F02Fc5D280ACF2d560'

function App() {
  const [count, setCount] = useState(0);
  const [addresses, setAddresses] = useState('')
  const [portfolios, setPortfolio] = useState<any[]>([])

  useEffect(() => {
    let timeOut: NodeJS.Timeout;
    new Promise(async () => {
      const provider = new BrowserProvider((window as any).ethereum)
      const fpInterface = new Interface(flexiblePortfolioGetterAbi)
      const splitAddresses = addresses.split(',')
      
      const callData = fpInterface.encodeFunctionData('getPortfolios',[splitAddresses])
      const result = await executeBytecode(ByteCodeCallerAddress,flexiblePortfolioGetterBytecode,callData, provider)
      const decodedResult = fpInterface.decodeFunctionResult('getPortfolios', result)[0]

      setPortfolio(decodedResult)

      timeOut = setTimeout(() => setCount(count + 1), 5000)
    })
    return () => clearTimeout(timeOut)
  }, [count, addresses])

  return (
    <div className="App">
        <input style={{width: '70vw',fontSize:20}} value={addresses} onChange={(e) => setAddresses(e.target.value)}/>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      {portfolios.map((portfolio) => {
        return (
          <div>
              <div>name: {portfolio.name}</div>
              <div>fs: {portfolio.fs}</div>
              <div>liquidAssets: {portfolio.liquidAssets.toString()}</div>
              <div>managerFeeRate: {portfolio.managerFeeRate.toString()}</div>
              <div>pc: {portfolio.pc}</div>
              <div>protocolFeeRate: {portfolio.protocolFeeRate.toString()}</div>
              <div>totalAssets: {portfolio.totalAssets.toString()}</div>
              <div>virtualTokenBalance: {portfolio.virtualTokenBalance.toString()}</div>
            </div>
        )

      })}
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
