import React from 'react'
import { useState } from 'react'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'
import ProctoringCamera from '../components/ProctoringCamera'

function InterviewPage() {
    const [step, setStep] = useState(1)
    const [interviewData, setInterviewData] = useState(null)
    const [violations, setViolations] = useState([])

    const handleViolation = (violation) => {
        setViolations((prev) => [...prev, violation])
        console.log('Proctoring violation:', violation)
        // Optional: send to backend
        // axios.post('/api/interview/violation', violation)
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {step === 1 && (
                <Step1SetUp onStart={(data) => {
                    setInterviewData(data);
                    setStep(2)
                }} />
            )}

            {step === 2 && (
                <div className='relative'>
                    {/* Floating proctoring camera - fixed corner during interview */}
                    <div className='fixed top-4 right-4 z-50 w-56'>
                        <ProctoringCamera onViolation={handleViolation} />
                    </div>

                    <Step2Interview
                    interviewData={interviewData}
                    violations={violations}
                    onFinish={(report) => {
                    setInterviewData({ ...report, violations });
                    setStep(3)
    }}
/>
                </div>
            )}

            {step === 3 && (
                <Step3Report report={interviewData} />
            )}

        </div>
    )
}

export default InterviewPage