import React, { useState } from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/userSlice';
function Auth({isModel = false}) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [welcomeName, setWelcomeName] = useState('')

    const handleGoogleAuth = async () => {
        setLoading(true)
        setMessage('')
        setWelcomeName('')
        try {
            const response = await signInWithPopup(auth, provider)
            const firebaseUser = response.user
            const name = firebaseUser.displayName
            const email = firebaseUser.email
            const result = await axios.post(ServerUrl + "/api/auth/google" , {name , email} , {withCredentials:true})
            const authData = result.data
            const loggedUser = authData.user || authData
            if (authData.token) {
                localStorage.setItem("token", authData.token)
            }
            dispatch(setUserData(loggedUser))
            const displayName = loggedUser?.name || firebaseUser.displayName || ''
            setWelcomeName(displayName)
            setTimeout(() => {
                setMessage(displayName ? `Welcome ${displayName}!` : 'Welcome!')
            }, 100)
            setTimeout(() => {
                setMessage('')
                navigate('/')
            }, 1600)
        } catch (error) {
            console.log(error)
            dispatch(setUserData(null))
            setWelcomeName('')
            setMessage('Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className={`
      w-full relative
      ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}
    `}>
        <motion.div 
        initial={{opacity:0 , y:-40}} 
        animate={{opacity:1 , y:0}} 
        transition={{duration:1.05}}
        className={`
        w-full 
        ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
        bg-white shadow-2xl border border-gray-200
      `}>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-black text-white p-2 rounded-lg'>
                    <BsRobot size={18}/>

                </div>
                <h2 className='font-semibold text-lg'>InterviewIQ.AI</h2>
            </div>

            <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                Continue with
                <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                    <IoSparkles size={16}/>
                    AI Smart Interview

                </span>
            </h1>

            <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                Sign in to start AI-powered mock interviews,
        track your progress, and unlock detailed performance insights.
            </p>


            <motion.button 
            onClick={handleGoogleAuth}
            whileHover={{opacity:0.9 , scale:1.03}}
            whileTap={{opacity:1 , scale:0.98}}
            disabled={loading}
            className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md disabled:opacity-70'>
                {loading ? (
                    <span className='h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                ) : (
                    <FcGoogle size={20}/>
                )}
                {loading ? 'Signing in...' : 'Continue with Google'}
            </motion.button>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl border px-4 py-3 shadow-xl ${message.includes('failed') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}
                >
                    <div className='flex items-start gap-2'>
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${message.includes('failed') ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                            {message.includes('failed') ? '!' : '✓'}
                        </div>
                        <div className='text-left'>
                            <p className='text-sm font-semibold'>
                                {welcomeName ? `Welcome ${welcomeName}!` : 'Welcome!'}
                            </p>
                            <p className='mt-1 text-sm'>You’re now signed in to InterviewIQ AI</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>

      
    </div>
  )
}

export default Auth
