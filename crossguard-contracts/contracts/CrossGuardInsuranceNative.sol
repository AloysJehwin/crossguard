// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrossGuard Insurance Protocol (Native STT)
 * @notice Smart contract insurance on Somnia testnet using native STT
 * @dev Deployed to Somnia testnet for DeFi protocol protection
 */
contract CrossGuardInsuranceNative is ReentrancyGuard, Ownable {
    
    struct Policy {
        address holder;
        address protocolAddress;
        uint256 coverageAmount;
        uint256 premiumPaid;
        uint256 startTime;
        uint256 duration;
        uint256 riskScore;
        bool isActive;
        bool claimProcessed;
    }
    
    struct Claim {
        uint256 policyId;
        uint256 claimAmount;
        string exploitTxHash;
        string exploitDetails;
        uint256 claimTime;
        bool approved;
        bool paid;
    }
    
    // State variables
    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public userPolicies;
    mapping(address => uint256[]) public protocolPolicies;
    
    uint256 public nextPolicyId = 1;
    uint256 public nextClaimId = 1;
    uint256 public totalPoolBalance;
    uint256 public totalCoverageLiability;
    
    // Constants
    uint256 public constant MIN_COVERAGE = 1000 * 10**18; // 1000 STT
    uint256 public constant MAX_COVERAGE = 10000000 * 10**18; // 10M STT
    uint256 public constant MIN_DURATION = 30 days;
    uint256 public constant MAX_DURATION = 365 days;
    uint256 public constant MAX_RISK_SCORE = 100;
    
    // Events
    event PolicyPurchased(
        uint256 indexed policyId, 
        address indexed holder, 
        address indexed protocolAddress,
        uint256 coverageAmount,
        uint256 premium
    );
    
    event ClaimSubmitted(
        uint256 indexed claimId, 
        uint256 indexed policyId, 
        uint256 claimAmount
    );
    
    event ClaimApproved(uint256 indexed claimId);
    event ClaimPaid(uint256 indexed claimId, uint256 amount);
    event ClaimRejected(uint256 indexed claimId, string reason);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Purchase insurance for a smart contract using native STT
     * @param _protocolAddress Address of the contract to insure
     * @param _coverageAmount Amount of coverage in STT
     * @param _duration Coverage duration in seconds
     * @param _riskScore Risk score from vulnerability scanner (0-100)
     */
    function purchaseInsurance(
        address _protocolAddress,
        uint256 _coverageAmount,
        uint256 _duration,
        uint256 _riskScore
    ) external payable nonReentrant returns (uint256 policyId) {
        require(_protocolAddress != address(0), "Invalid protocol address");
        require(_coverageAmount >= MIN_COVERAGE && _coverageAmount <= MAX_COVERAGE, "Coverage out of range");
        require(_duration >= MIN_DURATION && _duration <= MAX_DURATION, "Duration out of range");
        require(_riskScore <= MAX_RISK_SCORE, "Invalid risk score");
        require(_riskScore < 80, "Risk too high for coverage");
        
        // Check if protocol already has active policy
        require(!hasActivePolicy(_protocolAddress), "Protocol already has active policy");
        
        uint256 premium = calculatePremium(_coverageAmount, _duration, _riskScore);
        
        // Verify payment amount
        require(msg.value >= premium, "Insufficient payment for premium");
        
        // Create new policy
        policyId = nextPolicyId++;
        policies[policyId] = Policy({
            holder: msg.sender,
            protocolAddress: _protocolAddress,
            coverageAmount: _coverageAmount,
            premiumPaid: premium,
            startTime: block.timestamp,
            duration: _duration,
            riskScore: _riskScore,
            isActive: true,
            claimProcessed: false
        });
        
        // Update mappings
        userPolicies[msg.sender].push(policyId);
        protocolPolicies[_protocolAddress].push(policyId);
        
        // Update pool stats
        totalPoolBalance += premium;
        totalCoverageLiability += _coverageAmount;
        
        // Refund excess payment if any
        if (msg.value > premium) {
            (bool success, ) = msg.sender.call{value: msg.value - premium}("");
            require(success, "Refund failed");
        }
        
        emit PolicyPurchased(policyId, msg.sender, _protocolAddress, _coverageAmount, premium);
    }
    
    /**
     * @notice Calculate insurance premium based on risk factors
     */
    function calculatePremium(
        uint256 _coverageAmount,
        uint256 _duration,
        uint256 _riskScore
    ) public pure returns (uint256) {
        // Base premium: 2.5% annually
        uint256 basePremium = (_coverageAmount * 25) / 1000;
        
        // Risk adjustment: 0-8% additional based on risk score
        uint256 riskAdjustment = (_coverageAmount * _riskScore * 8) / (100 * 100);
        
        // Duration adjustment
        uint256 annualPremium = basePremium + riskAdjustment;
        uint256 premium = (annualPremium * _duration) / 365 days;
        
        return premium;
    }
    
    /**
     * @notice Submit an insurance claim
     */
    function submitClaim(
        uint256 _policyId,
        uint256 _claimAmount,
        string memory _exploitTxHash,
        string memory _exploitDetails
    ) external nonReentrant returns (uint256 claimId) {
        Policy storage policy = policies[_policyId];
        
        require(policy.holder == msg.sender, "Not policy holder");
        require(policy.isActive, "Policy not active");
        require(!policy.claimProcessed, "Claim already processed");
        require(block.timestamp <= policy.startTime + policy.duration, "Policy expired");
        require(_claimAmount > 0 && _claimAmount <= policy.coverageAmount, "Invalid claim amount");
        
        claimId = nextClaimId++;
        claims[claimId] = Claim({
            policyId: _policyId,
            claimAmount: _claimAmount,
            exploitTxHash: _exploitTxHash,
            exploitDetails: _exploitDetails,
            claimTime: block.timestamp,
            approved: false,
            paid: false
        });
        
        emit ClaimSubmitted(claimId, _policyId, _claimAmount);
    }
    
    /**
     * @notice Approve and pay out a claim (owner only)
     */
    function approveClaim(uint256 _claimId) external onlyOwner nonReentrant {
        Claim storage claim = claims[_claimId];
        require(!claim.approved, "Claim already approved");
        require(!claim.paid, "Claim already paid");
        
        Policy storage policy = policies[claim.policyId];
        require(policy.isActive, "Policy not active");
        require(address(this).balance >= claim.claimAmount, "Insufficient pool balance");
        
        // Mark claim as approved
        claim.approved = true;
        emit ClaimApproved(_claimId);
        
        // Process payout
        claim.paid = true;
        policy.claimProcessed = true;
        policy.isActive = false;
        
        totalPoolBalance -= claim.claimAmount;
        totalCoverageLiability -= policy.coverageAmount;
        
        // Transfer claim amount to policy holder in native STT
        (bool success, ) = policy.holder.call{value: claim.claimAmount}("");
        require(success, "Claim payment failed");
        
        emit ClaimPaid(_claimId, claim.claimAmount);
    }
    
    /**
     * @notice Reject a claim (owner only)
     */
    function rejectClaim(uint256 _claimId, string memory _reason) external onlyOwner {
        Claim storage claim = claims[_claimId];
        require(!claim.approved, "Claim already approved");
        require(!claim.paid, "Claim already paid");
        
        Policy storage policy = policies[claim.policyId];
        policy.claimProcessed = true;
        
        emit ClaimRejected(_claimId, _reason);
    }
    
    /**
     * @notice Check if a protocol has an active policy
     */
    function hasActivePolicy(address _protocol) public view returns (bool) {
        uint256[] memory policyIds = protocolPolicies[_protocol];
        
        for (uint256 i = 0; i < policyIds.length; i++) {
            Policy memory policy = policies[policyIds[i]];
            if (policy.isActive && block.timestamp <= policy.startTime + policy.duration) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @notice Get user's policy IDs
     */
    function getUserPolicies(address _user) external view returns (uint256[] memory) {
        return userPolicies[_user];
    }
    
    /**
     * @notice Get protocol's policy IDs
     */
    function getProtocolPolicies(address _protocol) external view returns (uint256[] memory) {
        return protocolPolicies[_protocol];
    }
    
    /**
     * @notice Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 poolBalance,
        uint256 coverageLiability,
        uint256 availableFunds
    ) {
        poolBalance = address(this).balance;
        coverageLiability = totalCoverageLiability;
        availableFunds = poolBalance > coverageLiability ? poolBalance - coverageLiability : 0;
    }
    
    /**
     * @notice Deposit funds to insurance pool (owner only)
     */
    function depositFunds() external payable onlyOwner {
        require(msg.value > 0, "Must deposit funds");
        totalPoolBalance += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw funds from insurance pool (owner only)
     */
    function withdrawFunds(uint256 _amount) external onlyOwner nonReentrant {
        require(address(this).balance >= _amount, "Insufficient balance");
        require(address(this).balance - _amount >= totalCoverageLiability, "Cannot withdraw below liability");
        
        totalPoolBalance -= _amount;
        (bool success, ) = owner().call{value: _amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), _amount);
    }
    
    /**
     * @notice Emergency withdrawal (owner only) - only when no active policies
     */
    function emergencyWithdraw() external onlyOwner {
        require(totalCoverageLiability == 0, "Active policies exist");
        
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Emergency withdrawal failed");
        
        emit FundsWithdrawn(owner(), balance);
    }
    
    /**
     * @notice Receive function to accept STT deposits
     */
    receive() external payable {
        totalPoolBalance += msg.value;
    }
}