import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Game from './pages/Game'
import Login from './pages/Login'
import GameRandom from './pages/GameRandom'
import { Suspense } from 'react';
import { Layout } from './layout'

function App() {

  return (
    <div className='h-screen'>

        <Suspense fallback={<div>Loading....</div>}>

          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Landing/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/game' element={<Game/>}/>
              <Route path='/game/:gameId' element={
                <Layout><GameRandom/></Layout>
              }/>


            </Routes>
          </BrowserRouter>
        </Suspense>
    </div>
  )
}

export default App
