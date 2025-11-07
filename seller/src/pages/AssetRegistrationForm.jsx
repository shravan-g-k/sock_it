import React, { useState, useCallback } from 'react';

import { useAssetSC } from '../blockchain/hooks/useAssetSC.jsx';
import AssetCard from '../components/AssetCard.jsx';
import Asset3DPreview from '../components/Asset3DPreview.jsx';
import { 
    UploadCloud, 
    SimpleSpinner, 
    Wallet, 
    X
} from '../components/SharedIcons.jsx';

// Initial state for a new asset registration
const initialFormState = {
    name: '',
    assetType: 'Equipment', // Default
    estimatedValue: '',
    operationalStatus: 'Operational', // Default
    description: '',
    cadModelId: 'MOCK-CAD-102938' // Mocking a link to a CAD model in a separate system
};

/**
 * Main component for asset registration and display.
 */
const AssetRegistrationForm = ({ userId, assets, setAssets, appId, isDataLoading }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [txResult, setTxResult] = useState(null);

    // Custom hook for mock smart contract interaction
    const { connectWallet, registerAsset, isConnected, isConnecting, walletAddress } = useAssetSC();

    // --- FORM HANDLING ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.estimatedValue) {
            setModalContent({ 
                title: "Validation Error", 
                message: "Please fill in the Asset Name and Estimated Value.",
                type: 'error'
            });
            setModalOpen(true);
            return;
        }

        setIsSubmitting(true);
        setTxResult(null);

        try {
            // 1. MOCK: Connect Wallet
            if (!isConnected) {
                await connectWallet();
            }

            // 2. MOCK: Register asset on the smart contract
            setModalContent({ title: "Transaction Pending", message: "Registering asset on the simulated blockchain...", type: 'loading' });
            setModalOpen(true);

            const scResult = await registerAsset({
                ...formData,
                registeredBy: walletAddress,
                timestamp: new Date().toISOString()
            });

            setTxResult(scResult);
            setModalContent({ 
                title: "Transaction Successful!", 
                message: scResult.message,
                txHash: scResult.txHash,
                gasFee: scResult.gasFee,
                type: 'success' 
            });

            // 3. Save to local state
            const newAsset = {
                id: crypto.randomUUID(),
                ...formData,
                registeredBy: walletAddress,
                txHash: scResult.txHash,
                gasFee: scResult.gasFee,
                registeredAt: new Date().toISOString(),
            };
            
            setAssets(prevAssets => [newAsset, ...prevAssets]);

            // 4. Cleanup
            setFormData(initialFormState);
            
        } catch (error) {
            console.error("Submission failed:", error);
            setModalContent({ 
                title: "Transaction Failed", 
                message: `Blockchain registration failed: ${error.message || 'Unknown error.'}`, 
                type: 'error' 
            });
            // Keep modal open to show error
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- MODAL HANDLING ---
    const open3DPreviewModal = (asset) => {
        setModalContent({
            title: `3D Model for ${asset.name}`,
            // If asset contains a modelUrl (from upload), pass it. Fallback to empty to show placeholder.
            content: <Asset3DPreview modelUrl={asset.modelUrl || asset.gltfModelUrl || ''} />,
            type: '3d-preview'
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalContent(null);
    };

    // --- RENDER COMPONENTS ---

    const renderModalContent = () => {
        if (!modalContent) return null;

        if (modalContent.type === '3d-preview') {
            return (
                <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl relative p-4">
                    <button 
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{modalContent.title}</h3>
                    {modalContent.content}
                </div>
            );
        }

        const bgColor = modalContent.type === 'success' ? 'bg-green-100' : modalContent.type === 'error' ? 'bg-red-100' : 'bg-indigo-100';
        const textColor = modalContent.type === 'success' ? 'text-green-800' : modalContent.type === 'error' ? 'text-red-800' : 'text-indigo-800';
        const borderColor = modalContent.type === 'success' ? 'border-green-400' : modalContent.type === 'error' ? 'border-red-400' : 'border-indigo-400';

        return (
            <div className={`w-full max-w-md p-6 rounded-xl border-t-4 ${borderColor} ${bgColor} shadow-2xl relative`}>
                <button 
                    onClick={modalContent.type !== 'loading' ? closeModal : () => {}} // Cannot close while loading
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
                    disabled={modalContent.type === 'loading'}
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                    {modalContent.type === 'loading' && <SimpleSpinner className="w-6 h-6 border-indigo-500" />}
                    {modalContent.type === 'success' && <UploadCloud className="w-6 h-6 text-green-600" />}
                    {modalContent.type === 'error' && <X className="w-6 h-6 text-red-600" />}
                    <h3 className={`text-lg font-bold ${textColor}`}>{modalContent.title}</h3>
                </div>
                <p className="mt-4 text-sm text-gray-700">{modalContent.message}</p>
                
                {(modalContent.txHash || modalContent.gasFee) && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Transaction Details</p>
                        {modalContent.txHash && (
                            <p className="text-sm font-mono truncate">
                                Hash: <span className="text-indigo-600">{modalContent.txHash.substring(0, 30)}...</span>
                            </p>
                        )}
                        {modalContent.gasFee && (
                            <p className="text-sm font-mono">Gas Fee: {modalContent.gasFee}</p>
                        )}
                    </div>
                )}
                {modalContent.type !== 'loading' && (
                    <button
                        onClick={closeModal}
                        className={`mt-6 w-full py-2 rounded-lg font-semibold text-white transition duration-150 ${modalContent.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {modalContent.type === 'success' ? 'Done' : 'Close'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* --- REGISTRATION FORM COLUMN --- */}
            <div className="lg:col-span-1">
                <div className="card p-6 rust-shadow sticky top-20">
                    <h2 className="text-2xl font-extrabold text-[#943410] mb-6 border-b border-[#FFE5D9] pb-3">
                        Register New Digital Twin
                    </h2>
                    
                    {/* Wallet Status */}
                    <div className="p-3 mb-5 rounded-lg border flex items-center justify-between transition duration-200 
                        bg-[#FFF3EE] border-[#FFE5D9] text-[#943410]">
                        <span className="flex items-center text-sm font-medium">
                            <Wallet className="w-5 h-5 mr-2 text-[#B7410E]" />
                            Wallet Status:
                        </span>
                        <span className={`font-mono text-xs ${isConnected ? 'text-[#2F7A3C]' : 'text-[#B7410E]'}`}>
                            {isConnecting ? 'Connecting...' : (isConnected ? walletAddress.substring(0, 8) + '...' : 'Disconnected')}
                        </span>
                    </div>

                    <form onSubmit={handleFormSubmit}>
                        {/* Asset Name */}
                        <div className="input-group">
                            <label htmlFor="name" className="input-label">Asset Name (Required)</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="text-input"
                                placeholder="E.g., Turbine Rotor #4"
                                required
                            />
                        </div>

                        {/* Estimated Value */}
                        <div className="input-group">
                            <label htmlFor="estimatedValue" className="input-label">Estimated Value (USD)</label>
                            <input
                                type="number"
                                id="estimatedValue"
                                name="estimatedValue"
                                value={formData.estimatedValue}
                                onChange={handleChange}
                                className="text-input"
                                placeholder="E.g., 450000"
                                min="1"
                                required
                            />
                        </div>
                        
                        {/* Asset Type */}
                        <div className="input-group">
                            <label htmlFor="assetType" className="input-label">Asset Type</label>
                            <select
                                id="assetType"
                                name="assetType"
                                value={formData.assetType}
                                onChange={handleChange}
                                className="text-input appearance-none"
                            >
                                <option value="Equipment">Heavy Equipment</option>
                                <option value="Facility">Facility/Building</option>
                                <option value="Component">Small Component</option>
                                <option value="Software">Software Instance</option>
                            </select>
                        </div>

                        {/* Operational Status */}
                        <div className="input-group">
                            <label htmlFor="operationalStatus" className="input-label">Operational Status</label>
                            <select
                                id="operationalStatus"
                                name="operationalStatus"
                                value={formData.operationalStatus}
                                onChange={handleChange}
                                className="text-input appearance-none"
                            >
                                <option value="Operational">Operational</option>
                                <option value="Maintenance">Under Maintenance</option>
                                <option value="Decommissioned">Decommissioned</option>
                                <option value="Standby">Standby</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className="input-group">
                            <label htmlFor="description" className="input-label">Description / Location</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="text-input h-24"
                                placeholder="Brief location or function description."
                            />
                        </div>

                        {/* CAD Model ID (Mocked Input) */}
                        <div className="input-group">
                            <label htmlFor="cadModelId" className="input-label">Linked CAD Model ID (Mock)</label>
                            <input
                                type="text"
                                id="cadModelId"
                                name="cadModelId"
                                value={formData.cadModelId}
                                readOnly
                                className="text-input bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 mt-4 rounded-xl rust-gradient text-white font-bold text-lg 
                                hover:opacity-90 transition duration-300 shadow-lg flex items-center justify-center 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <SimpleSpinner className="w-6 h-6 border-white mr-2" />
                            ) : (
                                <UploadCloud className="w-6 h-6 mr-2" />
                            )}
                            {isSubmitting ? 'Processing Transaction...' : 'Tokenize & Register Asset'}
                        </button>
                    </form>
                </div>
            </div>

            {/* --- ASSET LIST COLUMN --- */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-extrabold text-[#943410] mb-6 pb-3 border-b border-[#FFE5D9]">
                    Registered Digital Assets ({assets.length})
                </h2>

                {isDataLoading && assets.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl rust-shadow flex flex-col items-center">
                        <SimpleSpinner className="w-8 h-8 border-[#B7410E]" />
                        <p className="mt-4 text-[#943410] font-semibold">Loading existing assets...</p>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl rust-shadow border-2 border-dashed border-[#FFE5D9]">
                        <p className="text-xl font-semibold text-[#B7410E]">No Assets Registered Yet</p>
                        <p className="mt-2 text-[#943410]">Use the form on the left to tokenize your first digital twin.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {assets.map(asset => (
                            <AssetCard 
                                key={asset.id} 
                                asset={asset} 
                                onDelete={(id) => setAssets(prevAssets => prevAssets.filter(a => a.id !== id))}
                                onPreview3D={open3DPreviewModal}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- CUSTOM MODAL --- */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
                    {renderModalContent()}
                </div>
            )}
        </div>
    );
};

export default AssetRegistrationForm;
