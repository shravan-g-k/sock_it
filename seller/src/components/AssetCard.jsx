import React, { useState } from 'react';
import { 
    CheckCircle, Trash2, Home, DollarSign, Edit, Wallet, TrendingUp, SimpleSpinner 
} from './SharedIcons.jsx';


/**
 * Utility function to format date objects.
 */
const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error("Failed to format timestamp:", e);
        return 'Invalid Date';
    }
};

/**
 * Component to display a single registered asset's details.
 */
const AssetCard = ({ asset, onDelete, onPreview3D }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    /**
     * Handles the deletion of the asset.
     */
    const handleDelete = async () => {
        // Use custom modal instead of window.confirm
        const isConfirmed = window.confirm(`Are you sure you want to delete the asset: ${asset.name}? This action is irreversible.`);
        
        if (!isConfirmed) return;

        setIsDeleting(true);
        try {
            await onDelete(asset.id);
            console.log(`Asset ${asset.id} successfully deleted.`);
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to delete asset. Check console for details.");
        } finally {
            setIsDeleting(false);
        }
    };

    const details = [
        { icon: Home, label: 'Type', value: asset.assetType },
        { icon: TrendingUp, label: 'Status', value: asset.operationalStatus },
        { icon: DollarSign, label: 'Value', value: `$${asset.estimatedValue}` },
        { icon: Edit, label: 'Last Update', value: formatTimestamp(asset.registeredAt) },
    ];

    const transactionDetails = [
        { label: 'TX Hash', value: asset.txHash || 'N/A', isHash: true },
        { label: 'Gas Fee', value: asset.gasFee || 'N/A' },
        { label: 'Registered By', value: asset.registeredBy?.substring(0, 8) + '...' || 'Unknown' },
    ];

    return (
        <div className="card p-6 rust-shadow hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5 flex flex-col h-full">
            {/* Header and Status */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#FFE5D9]">
                <div>
                    <h2 className="text-2xl font-bold text-[#943410] truncate" title={asset.name}>
                        {asset.name}
                    </h2>
                    <p className="text-sm font-mono text-[#B7410E] bg-[#FFF3EE] inline-block px-2 py-0.5 rounded-full mt-1 border border-[#FFE5D9]">
                        Asset ID: {asset.id.substring(0, 10)}...
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-[#2F7A3C]" />
                    <span className="text-sm font-semibold text-[#2F7A3C]">
                        Tokenized
                    </span>
                </div>
            </div>

            {/* Asset Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 flex-grow mb-6">
                {details.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">{item.label}</p>
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Blockchain Transaction Details */}
            <div className="bg-[#FFF3EE] p-4 rounded-xl border border-[#FFE5D9] mb-6">
                <h3 className="text-xs font-bold uppercase text-[#943410] mb-3 flex items-center">
                    <Wallet className="w-4 h-4 mr-1.5" /> Blockchain Record
                </h3>
                {transactionDetails.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs py-1 border-b border-[#FFE5D9] last:border-b-0">
                        <span className="text-[#943410]">{item.label}:</span>
                        <span className={`font-mono ${item.isHash ? 'text-[#B7410E]' : 'text-[#943410]'}`}>
                            {item.value.substring(0, 20)}...
                        </span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-auto pt-4 border-t border-[#FFE5D9]">
                <button
                    onClick={() => onPreview3D(asset)}
                    className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg rust-gradient text-white hover:opacity-90 transition duration-150 shadow-md flex justify-center items-center"
                >
                    View 3D Model
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-3 rounded-lg bg-[#FFF3EE] text-[#B7410E] hover:bg-[#FFE5D9] transition duration-150 shadow-md flex items-center justify-center disabled:opacity-50 border border-[#FFE5D9]"
                    title="Delete Asset"
                >
                    {isDeleting ? (
                        <SimpleSpinner className="w-5 h-5 border-[#B7410E]" />
                    ) : (
                        <Trash2 className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default AssetCard;