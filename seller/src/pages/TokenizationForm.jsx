import React, { useState } from 'react';
import FractionalShareInput from '../components/FractionalShareInput';
import DocumentUploader from '../components/DocumentUploader';
import Asset3DPreview from '../components/Asset3DPreview';
import CadUploader from '../components/CadUploader.jsx'; // <-- NEW (explicit extension to avoid casing conflicts)
import { useAssetSC } from '../blockchain/hooks/useAssetSC';

const TokenizationForm = () => {
    // Use the Web3 hook to manage deployment state
    const { deployContract, txStatus, contractAddress, error } = useAssetSC();

    const [assetDetails, setAssetDetails] = useState({
        name: 'Park Avenue Tower', 
        location: '432 Park Ave, New York, NY', 
        listingPrice: '50000000', 
        assetType: 'Commercial',
        isFractional: true, 
        gltfModelUrl: '', // Will store the local object URL from CadUploader
        gltfModelFileName: null, // <-- NEW state to track file name
        documentHash: null,
        revenueSplit: 'proportional', 
        votingQuorum: '51', 
        tokenStandard: 'ERC-20'
    });

    const [shares, setShares] = useState([{ tokens: '100000', symbol: 'RET-A' }]);
    
    // Handler for regular text/checkbox inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAssetDetails(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    // NEW Handler Function for the CadUploader
    const handleModelUpload = (url, fileName, file) => {
        setAssetDetails(prev => {
            // Revoke previous object URL if replacing
            try {
                if (prev.gltfModelUrl && prev.gltfModelUrl !== url) {
                    URL.revokeObjectURL(prev.gltfModelUrl);
                }
            } catch (e) {
                // ignore
            }

            return {
                ...prev,
                gltfModelUrl: url || '',
                gltfModelFileName: fileName || null,
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (txStatus === 'deploying') return; // Prevent double submission
        
        if (assetDetails.isFractional && shares.length === 0) {
            alert("Please define at least one fractional share class.");
            return;
        }
        
        // In a real app, you would upload the GLTF model to IPFS here
        // and pass the resulting IPFS hash to deployContract
        
        // Call the Web3 hook function
        deployContract(assetDetails, shares);
    };

    // Determine button text and style based on transaction status
    const getButtonState = () => {
        if (txStatus === 'deploying') return { text: "⏳ Deploying Smart Contract...", disabled: true, className: 'submit-btn final-action action-pending' };
        if (txStatus === 'success') return { text: "✅ Contract Deployed! View Asset", disabled: false, className: 'submit-btn final-action action-success' };
        return { text: "🚀 Tokenize Asset & Initiate SC Deployment", disabled: false, className: 'submit-btn final-action' };
    };
    
    const buttonState = getButtonState();

    return (
        <div className="seller-dashboard-layout">
            
            <header className="dashboard-header">
                <h1>✨ Asset Digitization & Token Launchpad</h1>
                <p>Define your asset, upload its digital twin, and set the immutable Smart Contract rules.</p>
            </header>

            <form onSubmit={handleSubmit} className="tokenization-grid">
                
                {/* LEFT COLUMN: ASSET IDENTITY & DIGITAL TWIN */}
                <div className="column left-column">
                    <div className="card step-card">
                        <h2>1. Core Asset Details & Valuation</h2>
                        
                        {/* --- Core Asset Details Inputs (Simplified) --- */}
                        <label className="input-label">Asset Name</label>
                        <input type="text" name="name" placeholder="e.g., Park Avenue Tower" value={assetDetails.name} onChange={handleChange} />
                        
                        <label className="input-label">Location</label>
                        <input type="text" name="location" placeholder="e.g., New York, NY" value={assetDetails.location} onChange={handleChange} />
                        
                        <label className="input-label">Asset Type</label>
                        <select name="assetType" value={assetDetails.assetType} onChange={handleChange}>
                            <option value="Commercial">Commercial Real Estate</option>
                            <option value="Residential">Residential Real Estate</option>
                        </select>
                        
                        <label className="input-label">Total Asset Valuation (Target Listing Price)</label>
                        <input type="number" name="listingPrice" value={assetDetails.listingPrice} onChange={handleChange} />
                        
                        <h3 className="sub-heading">Legal Document Hashing (Optional)</h3>
                        <p className="note-small">Store the document hash on-chain for verification (Deed, Valuation, etc.)</p>
                        <DocumentUploader 
                            onHashChange={(hash) => setAssetDetails(p => ({...p, documentHash: hash}))} 
                            currentHash={assetDetails.documentHash} 
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: TOKENOMICS & SMART CONTRACT LOGIC */}
                <div className="column right-column">
                    <div className="card step-card tokenomics-card">
                        <h2>3. Tokenomics & Smart Contract Setup</h2>
                        
                        {/* --- Tokenomics Inputs (Simplified) --- */}
                        <label>
                            <input type="checkbox" name="isFractional" checked={assetDetails.isFractional} onChange={handleChange} />
                            Enable **Fractional** Ownership (Tokenization)
                        </label>
                        
                        <label className="input-label">Token Standard</label>
                        <select name="tokenStandard" value={assetDetails.tokenStandard} onChange={handleChange}>
                            <option value="ERC-20">ERC-20 (Basic Fungible Shares)</option>
                            <option value="ERC-721">ERC-721 (Unique Asset Token)</option>
                        </select>
                        
                        <FractionalShareInput shares={shares} setShares={setShares} />
                        
                    </div>
                    
                    {/* Transaction Status Display */}
                    {error && <div className="tx-status-box error-box">**Error:** {error}</div>}
                    {contractAddress && (
                        <div className="tx-status-box success-box">
                            Contract Deployed! Address: <code>{contractAddress.substring(0, 10)}...</code>
                        </div>
                    )}

                    {/* Final Action Button (Uses calculated state) */}
                    <button type="submit" disabled={buttonState.disabled} className={buttonState.className}>
                        {buttonState.text}
                    </button>
                </div>
            </form>
            
            {/* CENTRAL SECTION: Digital Twin (Moved out of grid for a centered, full-width look) */}
            <div className="card step-card centered-3d-card">
                <h2>2. Digital Twin & 3D Model Review</h2>
                <p className="note-small">Upload your final digital twin (GLB format) for real-time verification.</p>
                
                {/* REPLACED: Simple text input */}
                <CadUploader 
                    onModelChange={handleModelUpload}
                    currentFileName={assetDetails.gltfModelFileName}
                />
                
                {/* The Asset3DPreview component uses the local object URL */}
                <Asset3DPreview modelUrl={assetDetails.gltfModelUrl} />
            </div>

        </div>
    );
};

export default TokenizationForm;