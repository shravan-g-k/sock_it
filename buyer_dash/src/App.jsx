import './App.css'
import Home from './Home'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="app">
      <Navbar />
  <Home />
  {/* Temporarily disabled MyScene to isolate blank-page issues. Re-enable after debugging. */}
  {/* <MyScene /> */}
    </div>
  )
}

export default App
