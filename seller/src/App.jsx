import React, { useState, useEffect, useCallback, useRef } from 'react';

function App() {
  // --- STATE MANAGEMENT ---
  
  // Form Input State (Controlled Components)
  const [formState, setFormState] = useState({
    unitName: '',
    reraNumber: '',
    // totalFlats: '', <-- REMOVED
    location: '',
    bhkType: '2bhk',
    unitValuation: '',
  });

  // UI/File State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedLegalFiles, setUploadedLegalFiles] = useState(null);
  const [legalHash, setLegalHash] = useState('--- Hash will appear here after upload ---');
  const [digitalTwinFile, setDigitalTwinFile] = useState(null);
  
  // Validation State
  const [validationErrors, setValidationErrors] = useState({});
  const [tokenGenerationSuccessful, setTokenGenerationSuccessful] = useState(true); // Token gen is now always 'successful' since logic is removed
  
  // --- REF MANAGEMENT (for accessing DOM nodes directly) ---
  const fileHasherRef = useRef(null);
  const glbUploaderRef = useRef(null);
  const modelViewerRef = useRef(null);
  const hashingSectionRef = useRef(null);
  const modelContainerRef = useRef(null); 

  // --- HANDLERS ---

  // 1. Controlled Input Change Handler
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
    
    // Clear validation error on change
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: false }));
    }
  };

  // 2. Token Generation Logic (handleFlatsBlur REMOVED)
  // Logic removed as requested previously.

  // 3. Document Hashing Simulation (Callback function for drag/change)
  const simulateHash = (files) => {
    // Generates a random dummy hash string
    let dummyHash = '0x';
    for(let i=0; i<40; i++) {
        dummyHash += Math.floor(Math.random() * 16).toString(16);
    }
    return dummyHash;
  };
  
  const processLegalFiles = useCallback((files) => {
    if (files.length === 0) return;
    
    setLegalHash('**Calculating Hash...**');
    setUploadedLegalFiles(files);
    
    const generatedHash = simulateHash(files);

    setTimeout(() => {
        setLegalHash(`**${generatedHash.substring(0, 10)}...** (${files.length} file(s) loaded)`);
    }, 800);

    setValidationErrors(prev => ({ ...prev, legalDocs: false }));
  }, []); 

  // 4. Digital Twin Loading and Removal Handlers
  const loadDigitalTwin = useCallback((file) => {
    if (file && file.name.toLowerCase().endsWith('.glb') && modelViewerRef.current) {
      setDigitalTwinFile(file);
      setValidationErrors(prev => ({ ...prev, digitalTwin: false }));
    } else {
      alert('Error: Only GLB files are accepted for the Digital Twin.');
      setDigitalTwinFile(null);
    }
  }, []);

  const removeDigitalTwin = () => {
    if (modelViewerRef.current) {
        modelViewerRef.current.removeAttribute('src');
    }
    setDigitalTwinFile(null);
  };
  
  // 5. Final Submission
  const handleRegistration = async (e) => {
    e.preventDefault();
    
    let isValid = true;
    let newErrors = {};

    // --- A. Validate all inputs ---
    Object.keys(formState).forEach(key => {
      // totalFlats validation removed
      if (!formState[key].trim()) {
        newErrors[key] = true;
        isValid = false;
      }
    });

    // --- B. Validate File Requirements ---
    if (!uploadedLegalFiles || uploadedLegalFiles.length === 0) {
      newErrors.legalDocs = true;
      isValid = false;
    }
    if (!digitalTwinFile) {
      newErrors.digitalTwin = true;
      isValid = false;
    }
    // tokenGenerationSuccessful validation removed/adjusted

    setValidationErrors(newErrors);
    
    // Apply error classes to non-controlled sections using refs
    hashingSectionRef.current.classList.toggle('error-section', !!newErrors.legalDocs);
    document.getElementById('twinUploadControl').classList.toggle('error-section', !!newErrors.digitalTwin);


    if (isValid) {
      // --- Collect Data for Future Backend Integration ---
      const formData = {
        ...formState,
        // tokensGenerated field removed
        legalHash: legalHash,
        legalFiles: uploadedLegalFiles,
        digitalTwinFile: digitalTwinFile,
      };

      console.log('--- FORM DATA READY FOR BACKEND SUBMISSION ---');
      console.log(formData);
      
      alert('🎉 Success! All data is valid and ready for blockchain/backend submission.');
    } else {
      alert('❌ Please correct the highlighted errors before submission.');
    }
  };

  // --- USE EFFECTS (FOR DOM LISTENERS) ---
  
  // Legal Docs Drag-and-Drop Effect
  useEffect(() => {
    const section = hashingSectionRef.current;
    if (!section) return;

    const dragHighlight = (e) => { e.preventDefault(); e.stopPropagation(); section.classList.add('drag-highlight'); };
    const dragNormal = (e) => { e.preventDefault(); e.stopPropagation(); section.classList.remove('drag-highlight'); };
    const handleDrop = (e) => { dragNormal(e); processLegalFiles(e.dataTransfer.files); };
    
    // Attach listeners
    section.addEventListener('dragenter', dragHighlight, false);
    section.addEventListener('dragover', dragHighlight, false);
    section.addEventListener('dragleave', dragNormal, false);
    section.addEventListener('drop', handleDrop, false);

    // Cleanup function to remove listeners
    return () => {
      section.removeEventListener('dragenter', dragHighlight, false);
      section.removeEventListener('dragover', dragHighlight, false);
      section.removeEventListener('dragleave', dragNormal, false);
      section.removeEventListener('drop', handleDrop, false);
    };
  }, [processLegalFiles]); 

  // Digital Twin Drag-and-Drop Effect (Modified to use the control block)
  useEffect(() => {
    const container = document.getElementById('twinUploadControl');
    if (!container) return;

    const highlightClass = 'drag-highlight-model';

    const dragHighlight = (e) => { e.preventDefault(); e.stopPropagation(); container.classList.add(highlightClass); };
    const dragNormal = (e) => { e.preventDefault(); e.stopPropagation(); container.classList.remove(highlightClass); };
    const handleDrop = (e) => { dragNormal(e); loadDigitalTwin(e.dataTransfer.files[0]); };

    container.addEventListener('dragenter', dragHighlight, false);
    container.addEventListener('dragover', dragHighlight, false);
    container.addEventListener('dragleave', dragNormal, false);
    container.addEventListener('drop', handleDrop, false);

    return () => {
      container.removeEventListener('dragenter', dragHighlight, false);
      container.removeEventListener('dragover', dragHighlight, false);
      container.removeEventListener('dragleave', dragNormal, false);
      container.removeEventListener('drop', handleDrop, false);
    };
  }, [loadDigitalTwin]);


  // Apply error classes for controlled inputs (based on validationErrors state)
  useEffect(() => {
    Object.keys(formState).forEach(key => {
        const inputElement = document.getElementById(key);
        if (inputElement) {
            inputElement.classList.toggle('error-input', !!validationErrors[key]);
        }
    });
  }, [validationErrors, formState]);
  
  // Helper to handle profile actions and close dropdown
  const handleProfileClick = (action) => {
    setIsDropdownOpen(false); // Always close the dropdown
    alert(`Navigating to: ${action}`);
  };


  return (
    <>
      <header className="main-header">
        <div className="logo-area">
          <span className="material-icons logo-icon">home_work</span> 
          <span className="company-name">SOCK.it</span>
        </div>
        <div className="profile-area">
          <button className="profile-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="material-icons">person_circle</span> My Profile
          </button>
          
          <div className={`profile-dropdown ${isDropdownOpen ? 'show' : ''}`}>
            <button className="dropdown-item" onClick={() => handleProfileClick('Previously Listed Projects')} data-action="projects">
              <span className="material-icons">folder_open</span> Previously Listed Projects
            </button>
            <button className="dropdown-item" onClick={() => handleProfileClick('Account Details')} data-action="account">
              <span className="material-icons">account_balance_wallet</span> Account Details
            </button>
            <button className="dropdown-item logout" onClick={() => handleProfileClick('Log Out')} data-action="logout">
              <span className="material-icons">logout</span> Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <main>
          <h1>🏠 Asset Registration & Digital Twin Capture</h1>
          <p>Enter the core details and required legal documentation for your property unit.</p>

          <form onSubmit={handleRegistration}>
          <div className="content-wrapper">
            
            <div className="left-column">
              {/* 1. Core Property Unit Details */}
              <section className="card">
                <h2>Core Property Unit Details</h2>
                <label htmlFor="unitName">Flat Number</label>
                <input type="text" id="unitName" name="unitName" placeholder="e.g., Flat 12A, Park Tower" required 
                  value={formState.unitName} onChange={handleChange} />

                <label htmlFor="reraNumber">RERA / Official Registration Number</label>
                <input type="text" id="reraNumber" name="reraNumber" placeholder="e.g., TN/12/123/2025" required 
                  value={formState.reraNumber} onChange={handleChange} />

                {/* REMOVED: Label and Input for totalFlats */}
                
                <label htmlFor="location">Location/Address</label>
                <input type="text" id="location" name="location" placeholder="e.g., Bangalore, India" required 
                  value={formState.location} onChange={handleChange} />
                
                <div className="inline-fields">
                  <div className="field-group">
                    <label htmlFor="bhkType">BHK Type</label>
                    <select id="bhkType" name="bhkType" required 
                      value={formState.bhkType} onChange={handleChange}>
                      <option value="1bhk">1 BHK</option>
                      <option value="2bhk">2 BHK</option>
                      <option value="3bhk">3 BHK</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="unitValuation">Unit Valuation (Target Price)</label>
                    <input type="text" id="unitValuation" name="unitValuation" placeholder="e.g 15000000" required 
                      value={formState.unitValuation} onChange={handleChange} />
                  </div>
                </div>
              </section>

              {/* 2. Legal Documentation (Required) */}
              <section className="card">
                <h2>Legal Documentation (Required)</h2>
                {/* ... Legal Docs Content ... */}
                <p>Upload required documents (e.g., Title Deed, Valuation Report). The cryptographic hash will be recorded.</p>
                
                <div className={`hashing-section ${validationErrors.legalDocs ? 'error-section' : ''}`} ref={hashingSectionRef}>
                  <h4>Hashing & Storage</h4>
                  <p>Drag and Drop Files Here</p>
                  <button className="select-files-button" type="button" onClick={() => fileHasherRef.current.click()}>Select Files to Hash</button>
                  <input 
                    type="file" 
                    id="fileHasher" 
                    multiple hidden required 
                    ref={fileHasherRef} 
                    onChange={(e) => processLegalFiles(e.target.files)} 
                  />
                  <p className="immutable-hash">Immutable Hash: <span style={{ color: legalHash.includes('Calculating') ? '#f7a030' : '#008000', fontWeight: 'bold' }}>{legalHash}</span></p>
                </div>
              </section>
            </div>

            <div className="right-column-extended">
              <section className="card block-3-extended">
                <h2>Digital Twin (3D Model) Capture</h2>
                <p>Upload your final digital twin (GLB format) and verify the 3D preview.</p>
                
                <div className="twin-upload-area">
                  
                  {/* NEW BLOCK: File Upload Control */}
                  <div className={`hashing-section ${validationErrors.digitalTwin ? 'error-section' : ''}`} id="twinUploadControl">
                    <h4>GLB File Upload</h4>
                    <p>Drag and Drop GLB file here</p>
                    <button className="select-files-button" type="button" onClick={() => glbUploaderRef.current.click()}>Select GLB File</button>
                    <input type="file" id="glbUploader" accept=".glb" hidden required ref={glbUploaderRef} onChange={(e) => loadDigitalTwin(e.target.files[0])} />
                    
                    {digitalTwinFile && (
                        <p className="verification-message success loaded">
                            <span className="material-icons">check_circle</span>
                            **{digitalTwinFile.name}** is uploaded.
                        </p>
                    )}
                  </div>
                  
                  {/* NEW BLOCK: Model Viewer Preview */}
                  <div className="model-preview-section" ref={modelContainerRef}>
                    <h4>3D Model Preview</h4>
                    <div className="model-viewer-container">
                      
                      <div className="twin-instructions" style={{ display: digitalTwinFile ? 'none' : 'block' }}>
                        <p className="upload-note">3D Preview appears here after upload.</p>
                      </div>

                      <model-viewer 
                        ref={modelViewerRef}
                        src={digitalTwinFile ? URL.createObjectURL(digitalTwinFile) : ""} 
                        alt="3D Digital Twin of Property" 
                        auto-rotate 
                        camera-controls 
                        shadow-intensity="1"
                        id="modelViewer"
                        className={digitalTwinFile ? 'model-loaded' : ''}
                        style={{ 
                          width: '100%', 
                          height: '250px', 
                          backgroundColor: '#000000', 
                          borderRadius: '4px', 
                          marginBottom: '5px' 
                        }}>
                      </model-viewer>
                      
                      {digitalTwinFile && (
                          <button id="removeModelButton" title="Remove Document" type="button" onClick={removeDigitalTwin}>
                              <span className="material-icons">close</span>
                          </button>
                      )}
                    </div>
                    <p className="verification-instruction">Use this viewer to verify the integrity and segmentation of your digital twin.</p>
                  </div>

                </div>
              </section>
            </div>
          </div>

          {/* Moved Registration Button to Center Bottom */}
          <div className="center-button-area">
            <button className="register-button" type="submit">
              <span className="material-icons">gavel</span>
              Register Asset
            </button>
          </div>
          </form>
        </main>
      </div>

      {/* **FOOTER SECTION** - Adjusted for Lower Profile */}
      <footer className="low-profile-footer">
        <p>&copy; 2025 PropAsset Token. All rights reserved. | Powered by Blockchain & Digital Twin Technology</p>
      </footer>
    </>
  );
}

export default App;