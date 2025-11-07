import './App.css'
import Home from './Home'
import Navbar from './components/Navbar'
import Discovery from './pages/Discovery'
import { Component } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {useState} from 'react'
import SignIn from './components/SignIn'

// Error boundary to catch DevTools errors and prevent blank page
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Filter out DevTools errors - don't treat them as fatal
    const errorString = error?.toString() || '';
    if (errorString.includes('not valid semver') || 
        errorString.includes('react_devtools_backend') ||
        errorString.includes('semver')) {
      // Silently ignore DevTools errors
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log non-DevTools errors
    const errorString = error?.toString() || '';
    if (!errorString.includes('not valid semver') && 
        !errorString.includes('react_devtools_backend') &&
        !errorString.includes('semver')) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [loggedIn,SetLoggedIn]=useState(false)
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={!loggedIn?<SignIn onLogIn={() => SetLoggedIn(true)} />:<Home />} />
            <Route path="/discovery" element={!loggedIn?<SignIn onLogIn={() => SetLoggedIn(true)}/>:<Discovery />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
