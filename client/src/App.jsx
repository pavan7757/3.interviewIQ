import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'
import { getRedirectResult } from 'firebase/auth'
import { auth } from './utils/firebase'

const defaultServerUrl = "http://localhost:8000"
export const ServerUrl = (
  import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL_PROD || import.meta.env.VITE_API_BASE_URL)
    : import.meta.env.VITE_API_BASE_URL
)?.replace(/\/$/, "") || defaultServerUrl

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const init = async () => {
      try {
        const redirectResult = await getRedirectResult(auth)
        if (redirectResult) {
          const fbUser = redirectResult.user
          const res = await axios.post(
            ServerUrl + "/api/auth/google",
            { name: fbUser.displayName, email: fbUser.email },
            { withCredentials: true }
          )
          dispatch(setUserData(res.data))
          return
        }
      } catch (error) {
        console.log(error)
      }

      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    init()
  }, [dispatch])
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>
      <Route path='/interview' element={<InterviewPage/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>



    </Routes>
  )
}

export default App
