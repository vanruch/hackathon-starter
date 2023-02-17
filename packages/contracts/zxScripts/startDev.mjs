import "zx/globals";
import { spinner } from "zx/experimental";
import fs from "fs/promises";

const rpcs = {
  31337: "http://127.0.0.1:8545",
};

$`anvil`;

await spinner("Waiting for anvil to be ready", () => sleep(1000));

const chainId = argv.chainId ?? 31337;
const scriptName = (argv.scriptName ?? "Deploy") + ".s.sol";
const scriptPath = path.join(__dirname, `../script/${scriptName}`);

await $`forge script ${scriptPath} --rpc-url ${rpcs[chainId]} --broadcast`;

const transactionsPath = path.join(
  __dirname,
  `../broadcast/${scriptName}/${chainId}/run-latest.json`
);

const { transactions } = JSON.parse(
  await fs.readFile(transactionsPath, "utf-8")
);

const deployments = Object.fromEntries(
  transactions
    .filter((tx) => tx.transactionType === "CREATE")
    .map((tx) => [
      tx.contractName,
      {
        txHash: tx.hash,
        address: tx.contractAddress,
      },
    ])
);

await fs.writeFile(
  path.join(__dirname, `../deployments/${chainId}.json`),
  JSON.stringify(deployments, null, 2)
);
