/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import Circle from '../components/atom/circle'
import './chatbot.css'
import { v4 } from 'uuid'

const Chatbot: React.FC = () => {
  type Message = {
    text: string
    sender: string
    isCreatedByUser: boolean
    parentMessageId: string
    messageId: string
    error: boolean
    model: string
    assistant_id: string
    endpoint: string
    responseMessageId?: string
    thread_id?: string
    conversationId?: string
  }
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '',
      sender: 'User',
      isCreatedByUser: true,
      parentMessageId: '00000000-0000-0000-0000-000000000000',
      messageId: v4(),
      error: false,
      model: 'gpt-4o',
      assistant_id: 'asst_Rqpzjwm2cFOGtOrOnT6K8DdC',
      endpoint: 'assistants',
      responseMessageId: '',
      thread_id: '',
      conversationId: '',
    },
  ])
  const [threadId, setThreadId] = useState('')
  const [messageIdFromApi, setMessageIdFromApi] = useState('')
  const [messageArr, setMessageArr] = useState<any>()
  const [visible, setVisible] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)
  const [showSendButton, setShowSendButton] = useState(false)
  const [progress, setProgress] = useState(0)

  async function fetchSSE(
    url: string,
    options: {
      payload: Record<string, unknown>
      headers: Record<string, string>
    },
  ) {
    const response = await fetch(url, {
      method: 'POST',
      headers: options.headers,
      body: JSON.stringify(options.payload),
    })

    if (!response.body) {
      throw new Error(
        'ReadableStream not supported in this environment or response.',
      )
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer: string = ''

    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log('Stream closed')
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last partial line (if any)

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice('data:'.length).trim()
            try {
              const parsedData = JSON.parse(data)
              console.log('Received data:', parsedData)
              if (parsedData.final) {
                const arrayLength = parsedData?.runMessages?.length
                const arr = parsedData?.runMessages[arrayLength - 1]

                console.log('Received data final:', arr.thread_id)
                setThreadId(arr.thread_id)
                setMessageIdFromApi(arr.messageId)
                const createdBy =
                  parsedData?.runMessages[arrayLength - 1].isCreatedByUser
                const messageUpdate = {
                  isCreatedByUser: createdBy,
                  text: arr.content[arr.content.length - 1].text.value,
                }
                console.log(messageUpdate, 'NEW MSG')
                setMessageArr((prevMessages: any) => [
                  ...(Array.isArray(prevMessages) ? prevMessages : []),
                  messageUpdate,
                ])
              }
            } catch (error) {
              console.error('Failed to parse JSON:', error)
            }
          }
        }
      }
    }

    await processStream()
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Handle the input submission
      console.log('User input:', inputValue)
      // Clear the input field
      setInputValue('')
    }
  }

  const makeApiCall = async () => {
    const headers = {
      'x-api-key': 'd66e08f6-071c-49f6-8b36-7f5ac081f756',
      'x-user-id': '6763acb8d49b7ec3f78d2f98',
      'Content-Type': 'application/json', // Necessary when sending JSON
    }

    const payload: Message = {
      text: inputValue,
      sender: 'User',
      isCreatedByUser: true,
      parentMessageId: '00000000-0000-0000-0000-000000000000',
      messageId: v4(),
      error: false,
      model: 'gpt-4o',
      assistant_id: 'asst_Rqpzjwm2cFOGtOrOnT6K8DdC',
      endpoint: 'assistants',
    }
    if (messages[0].text !== '') {
      payload.parentMessageId = messageIdFromApi
      payload.responseMessageId = v4()
      payload.thread_id = threadId
      payload.conversationId = v4()
    }

    fetchSSE('http://localhost:3080/api/assistants/public', {
      payload,
      headers,
    })
      .then(() => console.log('Streaming completed'))
      .catch(console.error)
    // console.log(res, 'FINAL')
  }
  const startProgress = async () => {
    setInputValue('')

    let progressValue = 0
    const interval = setInterval(() => {
      progressValue += 50
      setProgress(progressValue)
      if (progressValue >= 100) {
        const messageUpdate = {
          isCreatedByUser: true,
          text: inputValue,
        }
        setMessageArr((prevMessages: any) => [
          ...(Array.isArray(prevMessages) ? prevMessages : []),
          messageUpdate,
        ])
        clearInterval(interval)
      }
    }, 100) // Adjust the interval time as needed

    // if (progressValue === 100) {
    //   setMessageArr((prevMessages: any) => [
    //     ...(Array.isArray(prevMessages) ? prevMessages : []),
    //     messageUpdate,
    //   ])
    // }
    const parentMsgId =
      messages.length > 1
        ? messages[messages.length - 2].messageId
        : '00000000-0000-0000-0000-000000000000'
    if (messages?.[0].text !== '') {
      setMessages([
        ...messages,
        {
          text: inputValue,
          sender: 'User',
          isCreatedByUser: true,
          parentMessageId: parentMsgId,
          messageId: v4(),
          error: false,
          model: 'gpt-4o',
          assistant_id: 'asst_Rqpzjwm2cFOGtOrOnT6K8DdC',
          endpoint: 'assistants',
        },
      ])
    } else {
      setMessages([
        {
          text: inputValue,
          sender: 'User',
          isCreatedByUser: true,
          parentMessageId: parentMsgId,
          messageId: v4(),
          error: false,
          model: 'gpt-4o',
          assistant_id: 'asst_Rqpzjwm2cFOGtOrOnT6K8DdC',
          endpoint: 'assistants',
        },
      ])
    }

    makeApiCall()
  }

  const timeoutRef = useRef<number | null>(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Hide send button immediately during typing
    setShowSendButton(false)

    // Clear previous timer if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Start a new timer
    timeoutRef.current = setTimeout(() => {
      setShowSendButton(true) // Show send button after typing stops
    }, 600)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let svgArrowContainer: any = null // Declare a variable to track the container

  function createSvgArrow() {
    // if (svgArrowContainer) {
    //   return // Exit if the container already exists
    // }
    // Create an SVG element and set its attributes
    // const svgNS = 'http://www.w3.org/2000/svg'
    // const svg = document.createElementNS(svgNS, 'svg')
    // svg.setAttribute('width', '30')
    // svg.setAttribute('height', '30')
    // svg.setAttribute('viewBox', '0 0 24 24')
    // // Create a polygon element for the down arrow and set attributes
    // const polygon = document.createElementNS(svgNS, 'polygon')
    // polygon.setAttribute('points', '12,16 4,8 20,8')
    // polygon.setAttribute('fill', 'white')
    // // Append the polygon to the SVG element
    // svg.appendChild(polygon)
    // Create the container div
    // const containerDiv = document.createElement('div')
    // containerDiv.style.boxShadow =
    //   '0px 24px 16px -5px #7C3AED29, 0px 20px 25px -5px #00000033'
    // const img = document.createElement('img')
    // img.src = '/src/assets/icon/chat.svg' // Replace with the path to your SVG icon
    // img.alt = 'SVG Icon'
    // img.style.width = '24px'
    // img.style.height = '24px'
    // containerDiv.appendChild(img)
    // containerDiv.style.width = '54px'
    // containerDiv.style.height = '54px'
    // containerDiv.style.borderRadius = '18px'
    // containerDiv.style.backgroundColor = '#7C3AED'
    // containerDiv.style.display = 'flex'
    // containerDiv.style.alignItems = 'center'
    // containerDiv.style.justifyContent = 'center'
    // containerDiv.style.transition = 'transform 0.3s ease'
    // containerDiv.style.position = 'fixed'
    // containerDiv.style.bottom = '20px'
    // containerDiv.style.right = '20px'
    // containerDiv.style.cursor = 'pointer'
    // let isChatShown = false
    // containerDiv.onclick = () => {
    //   if (isChatShown) {
    //     isChatShown = false
    //     containerDiv.removeChild(img)
    //     img.src = '/src/assets/icon/chat.svg' // Replace with the path to your SVG icon
    //     img.alt = 'SVG Icon'
    //     img.style.width = '24px'
    //     img.style.height = '24px'
    //     containerDiv.appendChild(img)
    //   } else {
    //     isChatShown = true
    //     containerDiv.removeChild(img)
    //     img.src = '/src/assets/icon/arrow.svg' // Replace with the path to your SVG icon
    //     img.alt = 'SVG Icon'
    //     img.style.width = '24px'
    //     img.style.height = '24px'
    //     containerDiv.appendChild(img)
    //   }
    //   setChatVisible((prevChatVisible) => !prevChatVisible)
    // }
    // containerDiv.onmouseover = () => {
    //   containerDiv.style.transform = 'scale(1.2)'
    // }
    // containerDiv.onmouseout = () => {
    //   containerDiv.style.transform = 'scale(1)'
    // }
    // document.body.appendChild(containerDiv)
    // Save the reference
    // svgArrowContainer = containerDiv
  }
  // Use in useEffect
  // useEffect(() => {
  //   createSvgArrow()
  // }, [])
  useEffect(() => {
    // Trigger the visibility state after the component mounts
    setTimeout(() => {
      setVisible(true)
    }, 1000)
  }, [])
  console.log(messageArr, messageArr?.length, 'MESSAGE_ARR')
  const renderedMessages = React.useMemo(() => {
    return (
      messageArr?.length &&
      messageArr?.map((messageItem: any, index: number) => (
        <div key={index}>
          {messageItem?.isCreatedByUser && (
            <div className="relative flex gap-4 pl-[49px] pr-[16px] justify-end py-4">
              <div className="receiverCorner">{messageItem.text}</div>
              <div className="h-8 min-w-[32px] bg-[#94A3B8] rounded-full"></div>
            </div>
          )}

          {/* AI Reply */}
          {!messageItem?.isCreatedByUser && (
            <div className="relative flex gap-4 pr-[49px] pl-[16px] justify-start py-4">
              <div className="min-w-[32px] h-8 bg-[#94A3B8] rounded-full"></div>
              <div className="leftCorner">{messageItem?.text}</div>
            </div>
          )}
        </div>
      ))
    )
  }, [messageArr])
  return chatVisible ? (
    <div>
      <div className="fixed bottom-[5.75rem] right-5 w-[400px] h-[560px] bg-white z-50 flex flex-col rounded-[12px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),_0px_10px_10px_-5px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="relative w-full h-full">
          <div className="bg-[--primary] text-white py-3 px-4 rounded-t-[12px] text-base font-bold leading-6 tracking-normal flex gap-2 mb-[100px]">
            <div className="w-6 h-6 rounded-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.7999 9.95162V5.48114C20.0953 5.36214 20.3484 5.1575 20.5266 4.89354C20.7048 4.62958 20.8 4.31835 20.8 3.99986C20.8001 3.78972 20.7588 3.5816 20.6784 3.38743C20.5981 3.19325 20.4802 3.01683 20.3316 2.86824C20.183 2.71965 20.0065 2.60182 19.8124 2.52148C19.6182 2.44114 19.4101 2.39987 19.1999 2.40002C18.9898 2.39999 18.7817 2.44135 18.5876 2.52174C18.3935 2.60212 18.2171 2.71996 18.0685 2.86852C17.9199 3.01708 17.802 3.19346 17.7216 3.38758C17.6412 3.58169 17.5998 3.78975 17.5998 3.99986C17.5998 4.67186 18.0141 5.24378 18.5999 5.48114V8.4593C16.8796 6.69146 14.5593 5.59994 11.9999 5.59994C9.44054 5.59994 7.12118 6.69146 5.3999 8.46002V5.48114C5.69522 5.36202 5.94819 5.15735 6.12635 4.89341C6.3045 4.62947 6.39971 4.3183 6.39974 3.99986C6.39987 3.78974 6.35857 3.58164 6.27822 3.38748C6.19786 3.19332 6.08003 3.01691 5.93144 2.86833C5.78286 2.71974 5.60644 2.6019 5.41228 2.52155C5.21813 2.44119 5.01003 2.3999 4.7999 2.40002C4.5898 2.39999 4.38175 2.44135 4.18763 2.52174C3.99352 2.60213 3.81714 2.71997 3.66857 2.86854C3.52001 3.0171 3.40217 3.19348 3.32178 3.3876C3.24139 3.58171 3.20003 3.78976 3.20006 3.99986C3.20006 4.67186 3.61406 5.24378 4.1999 5.48114V9.95234C3.07142 11.6568 2.3999 13.7415 2.3999 15.9999C2.3999 19.0937 6.6983 21.6 11.9999 21.6C17.3032 21.6 21.5999 19.0937 21.5999 15.9999C21.5999 13.7405 20.9279 11.6568 19.7999 9.95162ZM11.9999 17.5997C8.68478 17.5997 5.9999 16.8835 5.9999 15.9999C5.9999 14.1247 6.45782 12.4279 7.1999 11.1999C10.4029 12.306 13.8373 12.2263 16.7999 11.1999C17.5422 12.4279 17.9999 14.125 17.9999 15.9999C17.9999 16.8835 15.3133 17.5997 11.9999 17.5997Z"
                  fill="white"
                />
                <path
                  d="M15.9999 15C15.9999 15.5532 15.553 15.9999 14.9998 15.9999C14.4466 15.9999 13.9998 15.5532 13.9998 15C13.9998 14.4473 14.4466 13.9997 14.9998 13.9997C15.553 13.9997 15.9999 14.4473 15.9999 15ZM9.99968 15C9.99968 15.5532 9.55256 15.9999 8.99984 15.9999C8.44712 15.9999 8 15.5532 8 15C8 14.4473 8.44712 13.9997 8.99984 13.9997C9.55256 13.9997 9.99968 14.4473 9.99968 15Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="flex justify-between w-full">
              <p className="w-full">BJIT AI assistant</p>
              <div className="flex justify-end w-full gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={() => setInputValue('')}
                >
                  <path
                    d="M17 12C17 12.9889 16.7068 13.9556 16.1573 14.7778C15.6079 15.6001 14.827 16.241 13.9134 16.6194C12.9998 16.9978 11.9945 17.0969 11.0245 16.9039C10.0546 16.711 9.16373 16.2348 8.46447 15.5355C7.76521 14.8363 7.289 13.9454 7.09608 12.9754C6.90315 12.0055 7.00217 11.0002 7.3806 10.0866C7.75904 9.17295 8.3999 8.39206 9.22215 7.84265C10.0444 7.29324 11.0111 7 12 7C13.4 7 14.7389 7.55556 15.7444 8.52222L17 9.77778"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M16.9999 7V9.77778H14.2222"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => setChatVisible(false)}
                  className="cursor-pointer"
                >
                  <path
                    d="M17 7L7 17"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7 7L17 17"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {messageArr === undefined && (
            <>
              <Circle />
              <div
                className={`flex flex-col items-center justify-center mt-[25px] gap-1`}
              >
                <p
                  className={`text-[#4F46E5] text-xl font-[700] ${
                    visible ? 'animate-slideUp' : 'opacity-0'
                  }`}
                >
                  AI assistant
                </p>
                <p
                  className={`font-semibold text-[#94A3B8] ${
                    visible ? 'animate-slideUpSlow' : 'opacity-0'
                  } text-[14px] leading-[20px]`}
                >
                  How can I help you? I'm here to help you
                </p>
              </div>
            </>
          )}

          <div className="absolute bottom-0 w-full">
            <div className="scrollable-container">
              {messageArr?.length && renderedMessages}
            </div>

            <div className="h-[64px] rounded-b-[12px] mt-auto bg-[#F8FAFC]">
              <div className="w-full h-[3px] bg-[#E2E8F0] overflow-hidden">
                {progress !== 100 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${progress}%`,
                      background:
                        'linear-gradient(90deg, #FF772E 0%, #0900FF 20%, #00FFA6 50%, #FF07DE 60%, #FFCD07 80%)',
                    }}
                  ></div>
                )}
              </div>
              <div className="flex items-center pt-[10px] pr-[16px]">
                <input
                  className="bg-[#F8FAFC] px-4 border-none outline-none text-onyx text-base font-normal w-full max-w-[90%] placeholder-opacity-100 placeholder-text-placeholder caret-[--primary]"
                  placeholder="Ask a question..."
                  value={inputValue}
                  onChange={handleChange}
                  // onKeyDown={handleKeyDown}
                />
                {inputValue !== '' && (
                  <div
                    className={`w-[40px] h-[40px] bg-[#7C3AED] rounded-[16px] flex items-center justify-center cursor-pointer ${
                      showSendButton ? 'animate-slideSide' : 'opacity-0'
                    }`}
                    onClick={startProgress}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.9845 7.24338L1.32783 0.0930743C1.18698 0.0244373 1.03098 -0.00723248 0.874516 0.0010458C0.718052 0.00932409 0.566268 0.0572782 0.433448 0.140395C0.300629 0.223511 0.191142 0.339056 0.115292 0.476156C0.039443 0.613256 -0.000274304 0.7674 -0.000121632 0.924083L-0.000121632 0.950596C-4.66135e-05 1.07446 0.0152178 1.19785 0.04533 1.318L1.4513 6.94189L1.69598 7.98803C1.74919 8.21525 1.74919 8.45168 1.69598 8.6789L1.4513 9.72505L0.04533 15.3489C0.0152178 15.4691 -4.66135e-05 15.5925 -0.000121632 15.7163L-0.000121632 15.7429C-0.000145725 15.8995 0.0396654 16.0535 0.115568 16.1905C0.191471 16.3275 0.30097 16.443 0.43377 16.526C0.566569 16.609 0.718304 16.6569 0.874705 16.6651C1.03111 16.6734 1.18703 16.6417 1.32783 16.5731L15.9837 9.42204C16.1878 9.32246 16.3599 9.16754 16.4802 8.97495C16.6005 8.78235 16.6643 8.55981 16.6643 8.33271C16.6643 8.10561 16.6005 7.88307 16.4802 7.69048C16.3599 7.49788 16.1886 7.34296 15.9845 7.24338Z"
                        fill="white"
                      />
                      <path
                        d="M1.45129 9.72517C1.47004 9.6502 1.51132 9.58277 1.56956 9.53198C1.6278 9.48119 1.70021 9.44947 1.77703 9.44109L7.95619 8.75477C8.05919 8.74239 8.15409 8.6927 8.22293 8.61509C8.29178 8.53748 8.32979 8.43733 8.32979 8.33359C8.32979 8.22984 8.29178 8.12969 8.22293 8.05208C8.15409 7.97447 8.05919 7.92478 7.95619 7.9124L1.77627 7.22608C1.70148 7.21782 1.63084 7.18747 1.57336 7.1389C1.51589 7.09033 1.47418 7.02574 1.45357 6.95337L1.69598 7.9874C1.74918 8.21461 1.74918 8.45105 1.69598 8.67826L1.45129 9.72517Z"
                        fill="#7C3AED"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* <div className="gradient-text"></div>
//   <div className="h-[64px] border-t-[3px] border-[#E2E8F0] rounded-b-[12px] mt-auto"></div> */}
          {/* <div className="coloredBg">
    <div className='w-20 h-20'></div>{' '}
  </div> */}
          {/* Messages Area */}
          {/* <div className="flex-1 bg-gray-200 p-2 overflow-y-auto">
    <div className="bg-green-100 p-2 my-2 rounded-lg">
      Hello! How can I assist you today?
    </div>
    <div className="bg-blue-100 p-2 my-2 rounded-lg self-end">
      I need help with my account.
    </div>
  </div> */}
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}

export default Chatbot
