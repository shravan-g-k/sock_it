// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title PropertyNFT - Implementation Contract
 * @notice Minimal NFT contract where each token represents a room
 * @dev Metadata stored on IPFS to minimize gas costs
 */
contract PropertyNFT is ERC721 {
    string private _baseTokenURI;
    uint256 public totalRooms;
    address public owner;
    bool private initialized;
    
    event PropertyInitialized(address indexed owner, uint256 totalRooms);
    
    constructor() ERC721("Property", "PROP") {
        // Implementation contract - not initialized
    }
    
    /**
     * @notice Initialize the cloned contract
     * @param _owner Address receiving all NFTs
     * @param _totalRooms Number of rooms in property
     * @param baseURI IPFS base URI (e.g., "ipfs://QmHash/")
     */
    function initialize(
        address _owner,
        uint256 _totalRooms,
        string memory baseURI
    ) external {
        require(!initialized, "Already initialized");
        require(_owner != address(0), "Invalid owner address");
        require(_totalRooms > 0, "Need at least 1 room");
        
        initialized = true;
        owner = _owner;
        totalRooms = _totalRooms;
        _baseTokenURI = baseURI;

        // Mint all room NFTs to owner
        for (uint256 i = 1; i <= _totalRooms; i++) {
            _mint(_owner, i);
        }

        emit PropertyInitialized(_owner, _totalRooms);
    }
    
    /**
     * @notice Returns base URI for token metadata
     * @dev Token URI will be: baseURI + tokenId + ".json"
     * Example: ipfs://QmHash/1.json, ipfs://QmHash/2.json, etc.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Returns the full token URI for a given token
     * @param tokenId The token ID
     * @return The complete URI pointing to the token's metadata JSON
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
            : "";
    }
    
    /**
     * @notice Check if contract is initialized
     */
    function isInitialized() external view returns (bool) {
        return initialized;
    }
    
    /**
     * @dev Converts uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

/**
 * @title PropertyNFTFactory - Clone Factory
 * @notice Creates minimal proxy clones for each property using ERC-1167
 */
contract PropertyNFTFactory {                     
    using Clones for address;
    
    address public immutable implementation;
    address[] public allProperties;
    
    mapping(address => address[]) public builderProperties;
    
    event PropertyCreated(
        address indexed propertyContract,
        address indexed builder,
        uint256 totalRooms,
        uint256 timestamp
    );
    
    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation");
        implementation = _implementation;
    }
    
    /**
     * @notice Create a new property NFT contract
     * @param totalRooms Number of rooms/units in property
     * @param baseURI IPFS base URI for metadata
     * @return propertyContract Address of the new property contract
     * 
     * @dev baseURI should be formatted as: "ipfs://QmYourHash/"
     * The contract will append tokenId.json to create full URIs:
     * - Token 1: ipfs://QmYourHash/1.json
     * - Token 2: ipfs://QmYourHash/2.json
     * - etc.
     */
    function createProperty(
        address _owner,
        uint256 totalRooms,
        string memory baseURI
    ) external returns (address propertyContract) {

        require(_owner != address(0), "Invalid owner address");
        // Clone the implementation
        propertyContract = implementation.clone();
        
        // Initialize the clone
        PropertyNFT(propertyContract).initialize(
            _owner,
            totalRooms,
            baseURI
        );
        
        // Track the property
        allProperties.push(propertyContract);
        builderProperties[_owner].push(propertyContract);
        
        emit PropertyCreated(propertyContract, _owner, totalRooms, block.timestamp);
        
        return propertyContract;
    }
    
    /**
     * @notice Get all properties created by a builder
     */
    function getBuilderProperties(address builder) external view returns (address[] memory) {
        return builderProperties[builder];
    }
    
    /**
     * @notice Get total number of properties
     */
    function getTotalProperties() external view returns (uint256) {
        return allProperties.length;
    }
    
    /**
     * @notice Get property contract at index
     */
    function getPropertyAtIndex(uint256 index) external view returns (address) {
        require(index < allProperties.length, "Index out of bounds");
        return allProperties[index];
    }
}

 