document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Element References ---
    const registerButton = document.getElementById('registerButton');
    const formInputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
    const totalFlatsInput = document.getElementById('totalFlats');
    
    // Header/Profile elements
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');

    // Legal Document elements
    const hashingSection = document.querySelector('.hashing-section');
    const fileHasherInput = document.getElementById('fileHasher');
    const immutableHashDisplay = document.querySelector('.immutable-hash');
    const selectFilesButton = document.querySelector('.select-files-button');

    // Digital Twin elements
    const modelViewerContainer = document.querySelector('.model-viewer-container');
    const modelViewer = document.getElementById('modelViewer');
    const twinInstructions = document.querySelector('.twin-instructions'); 
    const twinModelStatus = document.querySelector('.verification-message.loaded');
    const modelRemoveButton = document.getElementById('removeModelButton');

    let digitalTwinLoaded = false;
    let tokenGenerationSuccessful = false;
    let uploadedLegalFiles = null;
    let uploadedGlbFile = null;


    // --- 2. Header Dropdown Logic ---
    profileButton.addEventListener('click', () => {
        profileDropdown.classList.toggle('show');
    });

    window.addEventListener('click', (event) => {
        if (!event.target.closest('.profile-area')) {
            profileDropdown.classList.remove('show');
        }
    });

    document.querySelectorAll('.dropdown-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            alert(`Action triggered: ${action.toUpperCase()} - This would navigate to the respective page.`);
            profileDropdown.classList.remove('show');
        });
    });


    // --- 3. Token Generation Logic ---
    totalFlatsInput.addEventListener('blur', () => {
        const flats = parseInt(totalFlatsInput.value);
        if (flats > 0) {
            // System Logic: Generate X number of tokens based on total flats
            const tokensPerApartment = 100000; 
            const totalTokens = flats * tokensPerApartment;
            alert(`Token System Alert: Successfully generated ${totalTokens.toLocaleString()} utility tokens for this apartment based on ${flats} units.`);
            tokenGenerationSuccessful = true;
            totalFlatsInput.classList.remove('error-input');
        } else if (totalFlatsInput.value.trim()) {
            totalFlatsInput.classList.add('error-input');
            alert('Error: Total Flats must be a positive number.');
            tokenGenerationSuccessful = false;
        }
    });


    // --- 4. Legal Document Hashing Simulation ---
    
    // Simple hash simulation function (no actual crypto API usage in this final file)
    const simulateHash = (files) => {
        const hashLength = 40;
        let dummyHash = '0x';
        for(let i=0; i<hashLength; i++) {
            dummyHash += Math.floor(Math.random() * 16).toString(16);
        }
        return dummyHash;
    }

    const processLegalFiles = async (files) => {
        if (files.length === 0) return;
        
        immutableHashDisplay.innerHTML = 'Immutable Hash: **Calculating Hash...**';
        immutableHashDisplay.style.color = '#f7a030'; 
        immutableHashDisplay.style.fontWeight = 'bold';
        
        uploadedLegalFiles = files; 
        
        const generatedHash = simulateHash(files);

        setTimeout(() => {
            immutableHashDisplay.innerHTML = `Immutable Hash: **${generatedHash.substring(0, 10)}...** (${files.length} file(s) loaded)`;
            immutableHashDisplay.style.color = '#008000';
            immutableHashDisplay.style.fontWeight = 'bold';
        }, 800);
    };

    // Click/Change Listener
    selectFilesButton.addEventListener('click', () => { fileHasherInput.click(); });
    fileHasherInput.addEventListener('change', (event) => { processLegalFiles(event.target.files); });
    
    // Drag-and-Drop Listeners for Legal Docs
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        hashingSection.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        hashingSection.addEventListener(eventName, () => { hashingSection.classList.add('drag-highlight'); }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        hashingSection.addEventListener(eventName, () => { hashingSection.classList.remove('drag-highlight'); }, false);
    });
    hashingSection.addEventListener('drop', (e) => { processLegalFiles(e.dataTransfer.files); }, false);


    // --- 5. Digital Twin (GLB) Drag & Drop & Remove Logic ---

    const loadDigitalTwin = (file) => {
        if (file.name.toLowerCase().endsWith('.glb')) {
            const fileURL = URL.createObjectURL(file);
            modelViewer.setAttribute('src', fileURL);
            digitalTwinLoaded = true;
            uploadedGlbFile = file; 
            
            // UI Update: Hide instructions, Show status and remove button
            twinInstructions.style.display = 'none';
            twinModelStatus.style.display = 'flex';
            twinModelStatus.querySelector('span').innerHTML = `**${file.name}** loaded for preview.`;
            modelViewer.classList.add('model-loaded'); 
        } else {
            alert('Error: Only GLB files (GLB format) are accepted for the Digital Twin.');
            digitalTwinLoaded = false;
        }
    };
    
    const removeDigitalTwin = () => {
        modelViewer.removeAttribute('src');
        digitalTwinLoaded = false;
        uploadedGlbFile = null;
        
        // UI Update: Show instructions, Hide status and remove button
        twinInstructions.style.display = 'block';
        twinModelStatus.style.display = 'none';
        modelViewer.classList.remove('model-loaded');
        // Resetting the model viewer background
        modelViewer.style.backgroundColor = 'black'; 
    };

    modelRemoveButton.addEventListener('click', removeDigitalTwin);
    

    // Drag-and-Drop Listeners for Digital Twin
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        modelViewerContainer.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        modelViewerContainer.addEventListener(eventName, () => { modelViewerContainer.classList.add('drag-highlight-model'); }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        modelViewerContainer.addEventListener(eventName, () => { modelViewerContainer.classList.remove('drag-highlight-model'); }, false);
    });
    modelViewerContainer.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0]; 
        if (file) { loadDigitalTwin(file); }
    }, false);


    // --- 6. Form Validation ---
    const validateField = (input) => {
        if (!input.value.trim() || (input.type === 'number' && parseInt(input.value) <= 0)) {
            input.classList.add('error-input');
            return false;
        }
        input.classList.remove('error-input');
        return true;
    };

    formInputs.forEach(input => {
        input.addEventListener('blur', () => { validateField(input); });
        input.addEventListener('input', () => { input.classList.remove('error-input'); });
    });


    // --- 7. Final Submission ---
    registerButton.addEventListener('click', async (e) => {
        e.preventDefault();
        registerButton.disabled = true;
        registerButton.textContent = 'Validating...';

        let isValid = true;
        
        // 1. Validate all core property inputs
        formInputs.forEach(input => {
            if (!validateField(input)) { isValid = false; }
        });

        // 2. Validate Token Generation
        if (!tokenGenerationSuccessful) {
             if (validateField(totalFlatsInput)) { 
                totalFlatsInput.dispatchEvent(new Event('blur')); // Attempt to trigger token logic
                if (!tokenGenerationSuccessful) isValid = false;
             } else { isValid = false; }
        }
        
        // 3. Validate Legal Documentation & Digital Twin File Presence
        const isLegalDocLoaded = uploadedLegalFiles && uploadedLegalFiles.length > 0;
        if (!isLegalDocLoaded) { 
            hashingSection.classList.add('error-section'); 
            isValid = false; 
            alert('❌ Legal documentation is required.');
        } else { 
            hashingSection.classList.remove('error-section'); 
        }

        if (!digitalTwinLoaded) { 
            modelViewerContainer.classList.add('error-section'); 
            isValid = false; 
            alert('❌ Digital Twin (GLB file) is required.');
        } else { 
            modelViewerContainer.classList.remove('error-section'); 
        }

        if (isValid) {
            // --- Collect Data for Future Backend Integration ---
            const formData = {
                unitName: document.getElementById('unitName').value,
                reraNumber: document.getElementById('reraNumber').value,
                totalFlats: parseInt(totalFlatsInput.value),
                location: document.getElementById('location').value,
                bhkType: document.getElementById('bhkType').value,
                unitValuation: document.getElementById('unitValuation').value,
                tokensGenerated: parseInt(totalFlatsInput.value) * 100000,
                legalHash: immutableHashDisplay.textContent.split('**')[1].trim(),
                legalFiles: uploadedLegalFiles,
                digitalTwinFile: uploadedGlbFile,
            };

            console.log('--- FORM DATA READY FOR BACKEND SUBMISSION ---');
            console.log(formData);
            
            // Final Success Alert
            alert('🎉 Success! All data is valid and ready to be sent to your chosen backend (e.g., Supabase/Flask).');
        } else {
            alert('❌ Please correct the highlighted errors before submission.');
        }

        registerButton.disabled = false;
        registerButton.innerHTML = '<span class="material-icons">gavel</span> Register Asset for Verification & Tokenization';
    });
});