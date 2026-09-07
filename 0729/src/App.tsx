import Nav from './components/Nav'
import Hero from './components/Hero'
import Intro from './components/Intro'
import PickUpSection from './components/PickUpSection'
import MetroMapSection from './components/MetroMapSection'
import Footer from './components/Footer'
import PlusGrid from './components/PlusGrid'

function App() {
  return (
    <>
      <PlusGrid />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Intro />
        <PickUpSection />
        <MetroMapSection />
        <Footer />
      </div>
    </>
  )
}

export default App
