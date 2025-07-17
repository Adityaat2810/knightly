import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Game from './pages/Game'
import Login from './pages/Login'

function App() {

  return (
    <div className='h-screen bg-slate-900'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Landing/>}/>
           <Route path='/login' element={<Login/>}/>
          <Route path='/game' element={<Game/>}/>

        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
