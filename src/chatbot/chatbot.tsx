/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react'
import Circle from '../components/atom/circle'
import './chatbot.css'
import { v4 } from 'uuid'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

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
  type MessageArrType = {
    isCreatedByUser: boolean
    text: string
  }
  const [inputValue, setInputValue] = useState('')
  const idsFromApi = JSON.parse(localStorage.getItem('idsFromApi') || '{}')
  const [threadId, setThreadId] = useState(() => {
    return idsFromApi?.threadId || ''
  })
  const [messageIdFromApi, setMessageIdFromApi] = useState(() => {
    return idsFromApi?.messageId || ''
  })
  const [convoIdFromApi, setConvoIdFromApi] = useState(() => {
    return idsFromApi?.conversationId || ''
  })

  const [messageArr, setMessageArr] = useState<MessageArrType[]>()
  const [visible, setVisible] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)
  const [showSendButton, setShowSendButton] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMsgLoading, setIsMsgLoading] = useState(false)
  const scrollableDivRef = useRef<HTMLDivElement>(null)
  async function getChat(options: { headers: Record<string, string> }) {
    try {
      setIsMsgLoading(true)
      const response = await fetch(
        `http://localhost:3080/api/messages/public/${convoIdFromApi}`,
        {
          method: 'GET',
          headers: options.headers,
        },
      )

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // Assuming the server responds with JSON data
      const data = await response.json() // This parses the JSON body of the response into a JavaScript object
      const messageUpdates = data.map((msg: any) => {
        const text =
          msg.text ||
          (msg.content &&
            (msg.content[0]?.text?.value || msg.content[1]?.text?.value)) ||
          ''
        return {
          isCreatedByUser: msg.isCreatedByUser,
          text: text,
        }
      })
      setMessageArr(messageUpdates)

      // Do something with 'data' here (e.g., update state, display messages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setIsMsgLoading(false)
    }
  }

  async function fetchSSE(
    url: string,
    options: {
      payload: Record<string, unknown>
      headers: Record<string, string>
    },
  ) {
    setIsMsgLoading(true)
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
              // console.log('Received data:', parsedData)

              if (parsedData.final) {
                // const arrayLength = parsedData?.responseMessage?.content?.length
                // const arr =
                //   parsedData?.responseMessage?.content[arrayLength - 1]

                setThreadId(parsedData?.responseMessage?.thread_id)
                setMessageIdFromApi(parsedData?.responseMessage?.messageId)
                setConvoIdFromApi(parsedData?.responseMessage?.conversationId)
                const idsFromApi = {
                  threadId: parsedData?.responseMessage?.thread_id,
                  messageId: parsedData?.responseMessage?.messageId,
                  conversationId: parsedData?.responseMessage?.conversationId,
                }
                localStorage.setItem('idsFromApi', JSON.stringify(idsFromApi))
                // const createdBy =
                //   parsedData?.responseMessage?.content[arrayLength - 1].isCreatedByUser
                // const messageUpdate = {
                //   isCreatedByUser: false,
                //   text: arr.text.value,
                // }
                // console.log(messageUpdate, 'NEW MSG')
                // setMessageArr((prevMessages: any) => [
                //   ...(Array.isArray(prevMessages) ? prevMessages : []),
                //   messageUpdate,
                // ])
              } else if (parsedData?.message) {
                setIsMsgLoading(false)
                const messageUpdate = {
                  isCreatedByUser: false,
                  text: parsedData?.text,
                }
                const latestIndex: number =
                  (messageArr?.length && messageArr?.length + 1) || 1
                setMessageArr((prevMessages: any) => {
                  const updatedMessages = Array.isArray(prevMessages)
                    ? [...prevMessages]
                    : []
                  updatedMessages[latestIndex] = messageUpdate
                  return updatedMessages
                })
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
  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter') {
  //     // Handle the input submission
  //     console.log('User input:', inputValue)
  //     // Clear the input field
  //     setInputValue('')
  //   }
  // }

  const sendMessage = async () => {
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
    if (messageArr && messageArr?.length) {
      payload.parentMessageId = messageIdFromApi
      payload.responseMessageId = messageIdFromApi
      payload.thread_id = threadId
      payload.conversationId = convoIdFromApi
    }

    fetchSSE('http://localhost:3080/api/assistants/public', {
      payload,
      headers,
    })
      .then(() => console.log('Streaming completed'))
      .catch(console.error)
    // console.log(res, 'FINAL')
  }
  useEffect(() => {
    const headers = {
      'x-api-key': 'd66e08f6-071c-49f6-8b36-7f5ac081f756',
      'x-user-id': '6763acb8d49b7ec3f78d2f98',
      'Content-Type': 'application/json', // Necessary when sending JSON
    }
    getChat({ headers })
  }, [])
  const startProgress = async () => {
    setInputValue('')
    setShowSendButton(false)

    const messageUpdate = {
      isCreatedByUser: true,
      text: inputValue,
    }
    setMessageArr((prevMessages: any) => [
      ...(Array.isArray(prevMessages) ? prevMessages : []),
      messageUpdate,
    ])

    sendMessage()
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
      let progressValue = 0
      const interval = setInterval(() => {
        progressValue += 50
        setProgress(progressValue)
        if (progressValue >= 100) {
          setShowSendButton(true) // Show send button after typing stops

          clearInterval(interval)
        }
      }, 100) // Adjust the interval time as needed
    }, 600)
  }

  useEffect(() => {
    // Trigger the visibility state after the component mounts
    setTimeout(() => {
      setVisible(true)
    }, 1000)
  }, [])
  const renderedMessages = React.useMemo(() => {
    return (
      messageArr?.length &&
      messageArr?.map((messageItem: any, index: number) => (
        <div key={index}>
          {messageItem?.isCreatedByUser && (
            <div>
              <div className="relative flex gap-4 pl-[49px] pr-[16px] justify-end py-4">
                <div className="receiverCorner">{messageItem.text}</div>
                <div className="h-8 min-w-[32px] bg-[#94A3B8] rounded-full"></div>
              </div>
              {isMsgLoading && messageArr?.length - 1 === index && (
                <div className="flex items-center pl-[49px]">
                  <div className="loader-container">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <p className="text-[#CBD5E1] font-sans text-sm font-medium leading-5 tracking-normal text-left decoration-skip-ink">
                    Replying in a few seconds...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Reply */}
          {!messageItem?.isCreatedByUser && (
            <div className="relative flex gap-4 pr-[49px] pl-[16px] justify-start py-4">
              <div
                className="min-w-[32px] h-8 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #FF007E, #00E5FF)',
                }}
              ></div>

              <div className="leftCorner">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {messageItem?.text?.replace(/\^/g, '')}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ))
    )
  }, [messageArr, isMsgLoading])

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messageArr?.length && scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight
    }
  }, [messageArr, chatVisible])
  const [color, setColor] = useState('bg-blue-500')
  useEffect(() => {
    // Obtain the search string from the current window's URL
    const searchParams = new URLSearchParams(window.location.search)
    // const bgColorQueryParam = searchParams.get('bgColor')
    const queryParams: { [key: string]: string | null } = {}
    searchParams.forEach((value, key) => {
      queryParams[key] = value
    })
    console.log(queryParams, 'queryParams')
    const bgColorQueryParam = queryParams['bgColor']

    // Set state
    console.log(bgColorQueryParam, searchParams, 'bgColorQueryParam')
    if (bgColorQueryParam === 'red') {
      setColor('bg-red-500')
    } else if (bgColorQueryParam === 'yellow') {
      setColor('bg-yellow-500')
    }
  }, [])
  return (
    <>
      {chatVisible ? (
        <div>
          <div className="fixed bottom-[90px] right-[24px] w-[400px] h-[560px] bg-white z-50 flex flex-col rounded-[12px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),_0px_10px_10px_-5px_rgba(0,0,0,0.04)]">
            {/* Header */}
            <div className="relative w-full h-full">
              <div
                className={`${color} text-white py-3 px-4 rounded-t-[12px] text-base font-bold leading-6 tracking-normal flex gap-2 mb-[100px]`}
              >
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
                    <div
                      onClick={() => {
                        setInputValue('')
                        setShowSendButton(false)
                      }}
                      style={{
                        pointerEvents: inputValue === '' ? 'none' : 'auto',
                        opacity: inputValue === '' ? 0.5 : 1,
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer"
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
                    </div>
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
                <div className="scrollable-container" ref={scrollableDivRef}>
                  {messageArr?.length && renderedMessages}
                </div>

                <div className="h-[64px] rounded-b-[12px] mt-auto bg-[#F8FAFC]">
                  <div className="w-full h-[3px] bg-[#E2E8F0] overflow-hidden">
                    {showSendButton && (
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
                      // onKeyDown={startProgress}
                      // onMouseEnter={startProgress}
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
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div
        className={`fixed bottom-5 right-[24px] w-14 h-14 rounded-[20px] bg-purple-600 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out ${
          chatVisible ? 'scale-120' : 'scale-100'
        } shadow-[0px_24px_16px_-5px_rgba(124,58,237,0.16),0px_20px_25px_-5px_rgba(0,0,0,0.2)]`}
        onClick={() => setChatVisible((prevChatVisible) => !prevChatVisible)}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {chatVisible ? (
          <>
            <svg
              width="28"
              height="16"
              viewBox="0 0 28 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M14.001 16C13.7379 16.0015 13.4771 15.9511 13.2336 15.8516C12.99 15.7521 12.7685 15.6055 12.5817 15.4203L0.587882 3.42642C0.211467 3.05001 0 2.53948 0 2.00715C0 1.47482 0.211467 0.964296 0.587882 0.587882C0.964296 0.211467 1.47482 0 2.00715 0C2.53948 0 3.05001 0.211467 3.42642 0.587882L14.001 11.1824L24.5756 0.607872C24.958 0.280387 25.4499 0.109262 25.953 0.128694C26.4561 0.148127 26.9333 0.356685 27.2893 0.712691C27.6453 1.0687 27.8539 1.54593 27.8733 2.04902C27.8927 2.55212 27.7216 3.04402 27.3941 3.42642L15.4003 15.4203C15.0279 15.7896 14.5254 15.9978 14.001 16Z"
                fill="white"
              />
            </svg>
          </>
        ) : (
          <>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <g clip-path="url(#clip0_1690_244)">
                <path
                  d="M3.69016 24.9586C2.62088 24.9586 1.57623 24.6858 0.629477 24.1542C0.142359 23.9033 -0.0463102 23.2757 0.244693 22.8035C1.21156 21.2585 1.5607 19.3699 1.11802 17.5938C0.659179 15.7525 -0.004727 14.2017 2.53718e-05 12.2525C0.0165003 5.41374 5.70865 -0.130372 12.5404 0.00229815C19.1391 0.135206 24.5773 5.68217 24.5774 12.2826C24.5775 20.9028 15.5434 26.955 7.56786 23.6262C6.46856 24.489 5.0868 24.9586 3.69016 24.9586ZM2.39086 22.854C3.89325 23.3206 5.58295 22.9478 6.7415 21.8278C6.88088 21.693 7.05815 21.6041 7.24952 21.5729C7.4409 21.5418 7.63722 21.57 7.81213 21.6536C14.6403 24.9183 22.6764 19.8012 22.6764 12.2826C22.6764 6.67209 18.1122 2.0158 12.5022 1.90285C6.72075 1.788 1.91491 6.47035 1.90097 12.2571C1.89646 14.1085 2.61882 15.5882 3.01358 17.342C3.42949 19.1903 3.21041 21.1448 2.39086 22.854Z"
                  fill="white"
                />
                <path
                  d="M28.3091 32C26.9126 32 25.5307 31.5303 24.4316 30.6676C20.1901 32.4378 15.1448 31.6316 11.6671 28.6283C11.2698 28.2852 11.226 27.685 11.569 27.2876C11.9121 26.8904 12.5123 26.8464 12.9096 27.1896C15.994 29.8533 20.5112 30.4525 24.1872 28.695C24.3622 28.6114 24.5585 28.5832 24.7499 28.6144C24.9412 28.6455 25.1185 28.7344 25.2579 28.8692C26.4163 29.9892 28.1061 30.3622 29.6085 29.8953C28.6417 27.8788 28.5078 25.5686 29.257 23.4299C29.2637 23.4106 29.2711 23.3917 29.279 23.3729C29.8262 22.083 30.1019 20.7121 30.0985 19.2984C30.0925 16.806 29.2633 14.5004 27.7006 12.6307C27.364 12.2278 27.4176 11.6285 27.8204 11.2919C28.223 10.9552 28.8226 11.0089 29.1592 11.4116C30.9838 13.5946 31.9925 16.3939 31.9994 19.2938C32.0035 20.9549 31.6812 22.5669 31.0416 24.0857C30.3698 26.0305 30.6787 28.1127 31.7546 29.8447C32.0458 30.317 31.857 30.9447 31.3697 31.1957C30.4231 31.7271 29.3783 31.9999 28.3091 32Z"
                  fill="white"
                />
                <path
                  d="M12.2881 13.8331C13.1188 13.8331 13.7921 13.1601 13.7921 12.3299C13.7921 11.4998 13.1188 10.8268 12.2881 10.8268C11.4575 10.8268 10.7842 11.4998 10.7842 12.3299C10.7842 13.1601 11.4575 13.8331 12.2881 13.8331Z"
                  fill="white"
                />
                <path
                  d="M6.74811 13.8331C7.57872 13.8331 8.25207 13.1601 8.25207 12.3299C8.25207 11.4998 7.57872 10.8268 6.74811 10.8268C5.91749 10.8268 5.24414 11.4998 5.24414 12.3299C5.24414 13.1601 5.91749 13.8331 6.74811 13.8331Z"
                  fill="white"
                />
                <path
                  d="M17.8292 13.8331C18.6598 13.8331 19.3331 13.1601 19.3331 12.3299C19.3331 11.4998 18.6598 10.8268 17.8292 10.8268C16.9985 10.8268 16.3252 11.4998 16.3252 12.3299C16.3252 13.1601 16.9985 13.8331 17.8292 13.8331Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_1690_244">
                  <rect width="32" height="32" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </>
        )}
      </div>
    </>
  )
}

export default Chatbot
