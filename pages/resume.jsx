import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Resume() {
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [isCaptchaSolved, setIsCaptchaSolved] = useState(false)

  // Generate a weirdly written math problem
  const generateCaptcha = () => {
    const operations = ['plus', 'minus', 'add', 'subtract', 'sum of', 'difference of']
    const weirdNumbers = {
      1: ['one'],
      2: ['two'],
      3: ['three'],
      4: ['four'],
      5: ['five'],
      6: ['six'],
      7: ['seven'],
      8: ['eight'],
      9: ['nine'],
      10: ['ten']
    }

    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const isAddition = Math.random() > 0.5

    // Pick random weird representations
    const weirdNum1 = weirdNumbers[num1][Math.floor(Math.random() * weirdNumbers[num1].length)]
    const weirdNum2 = weirdNumbers[num2][Math.floor(Math.random() * weirdNumbers[num2].length)]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    let question, answer
    if (isAddition || operation.includes('plus') || operation.includes('add') || operation.includes('sum')) {
      question = `What is the ${operation.includes('sum') ? 'sum' : operation.includes('add') ? 'addition' : 'sum'} of ${weirdNum1} and ${weirdNum2}?`
      answer = num1 + num2
    } else {
      // Ensure subtraction doesn't result in negative numbers
      const larger = Math.max(num1, num2)
      const smaller = Math.min(num1, num2)
      const weirdLarger = weirdNumbers[larger][Math.floor(Math.random() * weirdNumbers[larger].length)]
      const weirdSmaller = weirdNumbers[smaller][Math.floor(Math.random() * weirdNumbers[smaller].length)]

      question = `What is the ${operation.includes('difference') ? 'difference' : 'subtraction'} between ${weirdLarger} and ${weirdSmaller}?`
      answer = larger - smaller
    }

    setCaptchaQuestion(question)
    setCaptchaAnswer(answer.toString())
    setUserAnswer('')
    setIsCaptchaSolved(false)
  }

  const checkCaptcha = () => {
    if (userAnswer === captchaAnswer) {
      setIsCaptchaSolved(true)
    } else {
      alert('Incorrect answer. Please try again.')
      generateCaptcha()
    }
  }

  const handleDownload = () => {
    // Open resume PDF in new tab
    window.open('https://ik.imagekit.io/5lec115kqg/Resume_Wasiq_Syed_gkNdZAeyL.pdf?updatedAt=1761056001878', '_blank')
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  return (
    <>
      <Head>
        <title>Resume - Wasiq Syed</title>
      </Head>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-neutral-800/10 shadow-xl rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl text-white font-semibold mb-4">Resume</h1>
              <p className="text-xl text-white/50">Download my resume below</p>
            </div>

            {/* CAPTCHA Section */}
            <div className="mb-8 p-6 bg-neutral-900/50 rounded-lg">
              <h2 className="text-2xl text-white font-semibold mb-4 text-center">Human Verification</h2>
              <p className="text-white/70 mb-4 text-center">
                To download my resume, please solve this simple math problem:
              </p>

              <div className="text-center mb-6">
                <p className="text-xl text-white font-mono bg-neutral-800 p-4 rounded">
                  {captchaQuestion}
                </p>
              </div>

              {!isCaptchaSolved ? (
                <div className="flex flex-col items-center space-y-4">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="px-4 py-2 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:border-blue-500 focus:outline-none w-48 text-center"
                    onKeyPress={(e) => e.key === 'Enter' && checkCaptcha()}
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={checkCaptcha}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      Submit Answer
                    </button>
                    <button
                      onClick={generateCaptcha}
                      className="px-6 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-colors duration-200"
                    >
                      New Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-green-400 text-xl mb-4">✓ Correct! You can now download my resume.</p>
                  <button
                    onClick={handleDownload}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-lg font-semibold"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download Resume
                  </button>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="text-center text-white/60">
              <p>My resume contains detailed information about my experience, skills, and projects.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

