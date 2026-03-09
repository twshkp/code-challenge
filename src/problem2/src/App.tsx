import { SwapForm } from './components/SwapForm'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-gradient-to-br from-black via-neutral-950 to-black">
      {/* Ambient glow */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
      <SwapForm />
    </div>
  )
}

export default App
