import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import DeskScene from './DeskScene'

function Layout() {
  return (
    <>
      <DeskScene />
      <div className="site-shell">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout
