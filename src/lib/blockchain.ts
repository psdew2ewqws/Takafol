import { ethers } from 'ethers';

const CONTRACT_ABI = [
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

function getContract() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    return null;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
}

export type BlockchainResult = {
  txHash: string;
  blockNumber: number;
  explorerUrl: string;
} | null;

export async function logToBlockchain(
  method: string,
  ...args: unknown[]
): Promise<BlockchainResult> {
  try {
    const contract = getContract();
    if (!contract) {
      console.warn('Blockchain not configured, skipping TX log');
      return null;
    }

    const tx = await (contract as Record<string, (...a: unknown[]) => Promise<ethers.TransactionResponse>>)[method](...args);
    const receipt = await tx.wait();

    if (!receipt) return null;

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    };
  } catch (error) {
    console.error('Blockchain logging failed:', error);
    return null;
  }
}

export async function logZakatDonation(
  donationId: string,
  donorId: string,
  charityId: string,
  amount: string,
  currency: string
) {
  return logToBlockchain('logZakatDonation', donationId, donorId, charityId, amount, currency);
}

export async function logOffer(
  offerId: string,
  giverId: string,
  category: string,
  district: string,
  description: string
) {
  return logToBlockchain('logOffer', offerId, giverId, category, district, description);
}

export async function logConnection(
  connectionId: string,
  offerId: string,
  requestId: string,
  giverId: string,
  requesterId: string
) {
  return logToBlockchain('logConnection', connectionId, offerId, requestId, giverId, requesterId);
}

export async function logProof(connectionId: string, proofHash: string) {
  return logToBlockchain('logProof', connectionId, proofHash);
}

export async function logCompletion(connectionId: string, confirmedBy: string) {
  return logToBlockchain('logCompletion', connectionId, confirmedBy);
}

export async function logTaskCompleted(
  connectionId: string,
  giverRating: number,
  requesterRating: number
) {
  return logToBlockchain('logTaskCompleted', connectionId, giverRating, requesterRating);
}
