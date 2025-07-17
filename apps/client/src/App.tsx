import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Game from './pages/Game'
import Login from './pages/Login'
import GameRandom from './pages/GameRandom'
import { Suspense } from 'react';

function App() {

  return (
    <div className='h-screen bg-slate-900'>

        <Suspense fallback={<div>Loading....</div>}>

          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Landing/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/game' element={<Game/>}/>
              <Route path='/game/random' element={<GameRandom/>}/>


            </Routes>
          </BrowserRouter>
        </Suspense>
    </div>
  )
}

export default App
