/**
 * Deploy TakafolTracker.sol to Sepolia testnet using ethers.js
 *
 * Usage:
 *   SEPOLIA_RPC_URL=https://... SERVER_WALLET_PRIVATE_KEY=0x... npx tsx blockchain/deploy.ts
 *
 * Or set these in takafol/.env and run from project root:
 *   npx tsx blockchain/deploy.ts
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Compiled bytecode and ABI for TakafolTracker
// To get these, compile TakafolTracker.sol in Remix IDE and copy the bytecode
// Or use solc: solcjs --bin --abi TakafolTracker.sol

const CONTRACT_ABI = [
  "constructor()",
  "function owner() view returns (address)",
  "function logZakatDonation(string donationId, string donorId, string charityId, string amount, string currency) external",
  "function logOffer(string offerId, string giverId, string category, string district, string description) external",
  "function logRequest(string requestId, string requesterId, string category, string district, string description) external",
  "function logConnection(string connectionId, string offerId, string requestId, string giverId, string requesterId) external",
  "function logProof(string connectionId, bytes32 proofHash) external",
  "function logCompletion(string connectionId, string confirmedBy) external",
  "function logTaskCompleted(string connectionId, uint8 giverRating, uint8 requesterRating) external",
  "event ZakatDonation(string donationId, string donorId, string charityId, string amount, string currency, uint256 timestamp)",
  "event OfferCreated(string offerId, string giverId, string category, string district, string description, uint256 timestamp)",
  "event RequestCreated(string requestId, string requesterId, string category, string district, string description, uint256 timestamp)",
  "event ConnectionMade(string connectionId, string offerId, string requestId, string giverId, string requesterId, uint256 timestamp)",
  "event ProofSubmitted(string connectionId, bytes32 proofHash, uint256 timestamp)",
  "event CompletionConfirmed(string connectionId, string confirmedBy, uint256 timestamp)",
  "event TaskCompleted(string connectionId, uint8 giverRating, uint8 requesterRating, uint256 timestamp)",
];

// Bytecode placeholder - replace with compiled bytecode from Remix IDE
// Steps to get bytecode:
// 1. Open https://remix.ethereum.org
// 2. Create new file, paste TakafolTracker.sol
// 3. Compile with Solidity 0.8.19+
// 4. Go to "Compilation Details" → copy "bytecode" → "object" field
const BYTECODE_FILE = path.join(__dirname, 'TakafolTracker.bin');

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error('Missing environment variables:');
    if (!rpcUrl) console.error('  - SEPOLIA_RPC_URL');
    if (!privateKey) console.error('  - SERVER_WALLET_PRIVATE_KEY');
    console.error('\nSet them in takafol/.env or pass as environment variables');
    process.exit(1);
  }

  // Check for compiled bytecode
  let bytecode: string;
  if (fs.existsSync(BYTECODE_FILE)) {
    bytecode = '0x' + fs.readFileSync(BYTECODE_FILE, 'utf-8').trim();
  } else {
    console.error(`Bytecode file not found: ${BYTECODE_FILE}`);
    console.error('\nTo compile the contract:');
    console.error('1. Open https://remix.ethereum.org');
    console.error('2. Paste TakafolTracker.sol and compile');
    console.error('3. Copy bytecode object and save to TakafolTracker.bin');
    console.error('\nOr use: solcjs --bin TakafolTracker.sol');
    process.exit(1);
  }

  console.log('Connecting to Sepolia testnet...');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === BigInt(0)) {
    console.error('\nInsufficient balance. Get Sepolia ETH from:');
    console.error('  - https://sepoliafaucet.com');
    console.error('  - https://faucets.chain.link/sepolia');
    process.exit(1);
  }

  console.log('\nDeploying TakafolTracker...');
  const factory = new ethers.ContractFactory(CONTRACT_ABI, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\nContract deployed successfully!`);
  console.log(`Address: ${address}`);
  console.log(`Explorer: https://sepolia.etherscan.io/address/${address}`);
  console.log(`\nAdd to your .env:`);
  console.log(`CONTRACT_ADDRESS=${address}`);

  // Save deployment info
  const deploymentInfo = {
    network: 'sepolia',
    address,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    explorerUrl: `https://sepolia.etherscan.io/address/${address}`,
  };

  fs.writeFileSync(
    path.join(__dirname, 'deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('\nDeployment info saved to blockchain/deployment.json');
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
