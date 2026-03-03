// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title TakafolTracker - Immutable audit log for Takafol charity platform
/// @notice Tracks donations, offers, requests, connections, and completions on-chain
/// @dev All data is emitted as events (cheap, permanent, searchable). No payments handled.
contract TakafolTracker {
    address public owner;

    // ========== EVENTS ==========

    event ZakatDonation(
        string donationId,
        string donorId,
        string charityId,
        string amount,
        string currency,
        uint256 timestamp
    );

    event OfferCreated(
        string offerId,
        string giverId,
        string category,
        string district,
        string description,
        uint256 timestamp
    );

    event RequestCreated(
        string requestId,
        string requesterId,
        string category,
        string district,
        string description,
        uint256 timestamp
    );

    event ConnectionMade(
        string connectionId,
        string offerId,
        string requestId,
        string giverId,
        string requesterId,
        uint256 timestamp
    );

    event ProofSubmitted(
        string connectionId,
        bytes32 proofHash,
        uint256 timestamp
    );

    event CompletionConfirmed(
        string connectionId,
        string confirmedBy,
        uint256 timestamp
    );

    event TaskCompleted(
        string connectionId,
        uint8 giverRating,
        uint8 requesterRating,
        uint256 timestamp
    );

    event CertificateIssued(
        string certificateId,
        string recipientId,
        bytes32 certHash,
        uint256 timestamp
    );

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;
    }

    // ========== FUNCTIONS ==========

    function logZakatDonation(
        string memory donationId,
        string memory donorId,
        string memory charityId,
        string memory amount,
        string memory currency
    ) external onlyOwner {
        emit ZakatDonation(donationId, donorId, charityId, amount, currency, block.timestamp);
    }

    function logOffer(
        string memory offerId,
        string memory giverId,
        string memory category,
        string memory district,
        string memory description
    ) external onlyOwner {
        emit OfferCreated(offerId, giverId, category, district, description, block.timestamp);
    }

    function logRequest(
        string memory requestId,
        string memory requesterId,
        string memory category,
        string memory district,
        string memory description
    ) external onlyOwner {
        emit RequestCreated(requestId, requesterId, category, district, description, block.timestamp);
    }

    function logConnection(
        string memory connectionId,
        string memory offerId,
        string memory requestId,
        string memory giverId,
        string memory requesterId
    ) external onlyOwner {
        emit ConnectionMade(connectionId, offerId, requestId, giverId, requesterId, block.timestamp);
    }

    function logProof(
        string memory connectionId,
        bytes32 proofHash
    ) external onlyOwner {
        emit ProofSubmitted(connectionId, proofHash, block.timestamp);
    }

    function logCompletion(
        string memory connectionId,
        string memory confirmedBy
    ) external onlyOwner {
        emit CompletionConfirmed(connectionId, confirmedBy, block.timestamp);
    }

    function logTaskCompleted(
        string memory connectionId,
        uint8 giverRating,
        uint8 requesterRating
    ) external onlyOwner {
        emit TaskCompleted(connectionId, giverRating, requesterRating, block.timestamp);
    }

    function logCertificate(
        string memory certificateId,
        string memory recipientId,
        bytes32 certHash
    ) external onlyOwner {
        emit CertificateIssued(certificateId, recipientId, certHash, block.timestamp);
    }
}
