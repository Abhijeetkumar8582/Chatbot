import React, { useState, useEffect,useRef } from 'react'
import Avatar from '@mui/material/Avatar';
import MicIcon from '@mui/icons-material/Mic';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


function Chatbot() {
    const [IsInputOpen, SetInputOpen] = useState(false);
    const [VoiceGenerated, setVoiceGenerated] = useState("")
    const [userInputArray, setuserInputArray] = useState([])
    const [conversationChat, setConversationChat] = useState([{
        role: 'bot',
        message: "Welcome to my Speech-to-Text bot, currently in its beta phase. This is an AI project I'm actively developing."
    }])
    const bodySectionRef = useRef();
    const [GPTInputArray, setGPTInputArray] = useState(["Welcome to my Speech-to-Text bot, currently in its beta phase. This is an AI project I'm actively developing."])
    const [boxes, setBoxes] = useState([]);

    const msg = new SpeechSynthesisUtterance()
    msg.text = "Hello World"
    useEffect(() => {
      
        bodySectionRef.current.scrollTop = bodySectionRef.current.scrollHeight;
      }, [conversationChat]);
    
    useEffect(() => {
        if ( VoiceGenerated) {
            const utterance = new SpeechSynthesisUtterance(VoiceGenerated);
            window.speechSynthesis.speak(utterance);
        }
    }, [VoiceGenerated]);

    useEffect(() => {
        const boxClasses = ['a', 'b', 'c', 'd'];
        const boxesArray = Array.from({ length: 50 }, (_, index) => (
            <div key={index} className={`box ${boxClasses[index % 4]}`}></div>
        ));

        setBoxes(boxesArray);
    }, []);
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }
    const startListen = () => {
        SetInputOpen(true)
        SpeechRecognition.startListening()
    }

    const stopListen = () => {
        SetInputOpen(false);
        SpeechRecognition.stopListening();
        setuserInputArray((prevUserInputArray) => [...prevUserInputArray, transcript]);
        setConversationChat((prevConversationChat) => [
          ...prevConversationChat,
          {
            role: 'user',
            message: transcript,
          }
        ]);
        GPTFunction();
        bodySectionRef.current.scrollTop = bodySectionRef.current.scrollHeight;

      }
    

    const GPTFunction = () => {
        
        const apiKey = "add_api_key"
        console.log(process.env.OPEN_API)
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        const requestData = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: GPTInputArray[0] }, // Fixed system message content
                { role: "user", content: transcript },
            ],
        };
       

        fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        })
            .then((response) => response.json())
            .then((data) => {
                setVoiceGenerated(data.choices[0].message.content)
                setGPTInputArray((prevUserInputArray) => [...prevUserInputArray, data.choices[0].message.content]);
                setConversationChat((prevConversationChat) => [
                    ...prevConversationChat,
                    {
                        role: 'bot',
                        message: data.choices[0].message.content,
                    }
                ]);
            })
            .catch((error) => {
                console.error(error);
            });

    }
    return (
        <div className='Container'>
            <div className='Chatbot_main_BOX'>
                <div className='head_section'>
                    <div className='head_section_innerSection'>
                        <div className='head_section_image_Section'>
                            <Avatar alt="Remy Sharp" src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/200e8d139737079.6234b0487404d.gif" />
                        </div>
                        <div className='head_section_content_Section'>
                            {/* <div> */}
                            <div>AI Virtual Assistant</div>
                            {/* </div> */}
                        </div>
                    </div>
                </div>
                <div className='body_section'  ref={bodySectionRef}>
                    {conversationChat.map((element, i) => (
                        <div key={i} className={element.role === 'bot' ? 'GPT_response_Main_Div' : 'user_response_Main_div'}>
                            {element.role === 'bot' ? (
                                <div className='GPT_response_Main_Div'>
                                <div className='GPT_response_div'>
                                    <p>{element.message}</p>
                                </div>
                                <div className='GPT_response_Blank_div'></div>
                                </div>
                            ) : (
                                <div className='user_response_Main_div'>
                                    <div className='user_response_first_div'></div>
                                    <div className='user_response_div'>
                                        <p>{element.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                </div>

                <div className='preview_section'>
                    <p>{transcript}</p>
                </div>
                <div className='input_section'>
                    <div className='input_Inner_section'>
                        {IsInputOpen ? (<div style={{ display: 'flex' }}><div className="loader">
                            <div className="loader-inner">
                                {boxes.map((box, index) => (
                                    <React.Fragment key={index}>{box}</React.Fragment>
                                ))}
                            </div>
                            <button className='input_Inner_section_button' onClick={() => stopListen()}><StopCircleIcon style={{ fontSize: '30px' }} /></button>
                        </div></div>) : <button className='input_Inner_section_button' onClick={() => startListen()}> <MicIcon style={{ fontSize: '30px' }} /></button>}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Chatbot;