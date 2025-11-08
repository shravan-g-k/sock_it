const express = require('express');
const { ethers } = require('ethers');
require("dotenv").config()


const app = express();
const PORT = process.env.PORT || 3000;

const factoryAbi = require('./artifacts/contracts/PropertyContract.sol/PropertyNFTFactory.json').abi;
const factoryAddress = '0x5C5FE61494e0A8c50cF6fbB994FE8c5D9d8c1770'; // Replace with deployed address

const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
// Note: You had 'signer = provider.getSigner()' which is for a browser/injected provider.
// Since you have a private key, 'builderWallet' is your signer. I've removed the unused 'signer' variable.
const builderWallet = new ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, provider);
const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, builderWallet);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Express server is running!');
});

/**
 * ==================================================================
 * UPDATED ROUTE
 * ==================================================================
 */
app.post('/create-property', async (req, res) => {
    const { owner, totalRooms, baseURI } = req.body;

    // Ensure totalRooms is treated as a number
    const numRooms = parseInt(totalRooms, 10);
    if (!numRooms || numRooms <= 0) {
        return res.status(400).json({ error: "Invalid totalRooms. Must be a number greater than 0." });
    }

    try {
        const tx = await factoryContract.createProperty(owner, numRooms, baseURI);
        const receipt = await tx.wait();

        // 1. Find the 'PropertyCreated' event in the receipt
        // This is more reliable than searching raw logs
        const event = receipt.events.find(e => e.event === 'PropertyCreated');

        if (!event) {
            throw new Error("PropertyCreated event not found in transaction receipt.");
        }

        // 2. Get the new NFT contract address from the event arguments
        const nftContractAddress = event.args.propertyContract;

        // 3. Generate the list of token IDs that were minted
        // The contract mints from 1 to totalRooms (inclusive)
        const mintedTokenIds = [];
        for (let i = 1; i <= numRooms; i++) {
            mintedTokenIds.push(i);
        }

        // 4. Print the details to the server console
        console.log("✅ --- New Property Created --- ✅");
        console.log(`Transaction Hash: ${tx.hash}`);
        console.log(`New NFT Contract Address: ${nftContractAddress}`);
        console.log(`Owner (Received NFTs): ${owner}`);
        console.log(`Total Rooms (Token Count): ${numRooms}`);
        console.log(`Minted Token IDs: ${mintedTokenIds.join(', ')}`);
        console.log("-----------------------------------");

        // 5. Send a detailed JSON response
        res.json({
            success: true,
            txHash: tx.hash,
            nftContractAddress: nftContractAddress,
            owner: owner,
            totalRooms: numRooms,
            mintedTokenIds: mintedTokenIds
        });

    } catch (err) {
        console.error("Error in /create-property:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * ==================================================================
 * END OF UPDATE
 * ==================================================================
 */

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});