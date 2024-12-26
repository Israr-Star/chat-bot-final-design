import { useEffect } from 'react'
import Chatbot from './chatbot/chatbot'

export default function App() {
  useEffect(() => {
    // Obtain the search string from the current window's URL
    const searchParams = new URLSearchParams(window.location.search)
    const bgColorQueryParam = searchParams.get('bgColor')

    // Set state
    console.log(bgColorQueryParam, 'bgColorQueryParam')
  }, [])
  return (
    <>
      <Chatbot />
    </>
  )
}
