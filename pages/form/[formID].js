import { useRouter } from "next/router"
import useWebSocket from 'react-use-websocket';
import { useEffect, useState } from "react";
const socketUrl = 'ws://localhost:8080';

export default function Form(props){
    const {id} = props
    const [users,setUsers] = useState([id])
    const [formState,setFormState] = useState({})
    const [blockFocus,setFormFocus] = useState({})
    const [messages, setMessages] = useState([])
    const router = useRouter()
    const { formID } = router.query
    const {
        sendJsonMessage,
        lastJsonMessage,
      } = useWebSocket(socketUrl, {
        onOpen: () => {
            console.log("Socket Open")
        },
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
      });

    useEffect(()=>{
        if(id && formID){
            console.log("Adding ", id, " to room ", formID)
            sendJsonMessage(
                {
                    action: "ADD_USER", 
                    payload: {
                        user:id,
                        formID
                    }
                }
            )
        }
        
    },
    [id,formID])
    useEffect(() => {
        console.log("Server Message")
        console.log(lastJsonMessage)
        if(lastJsonMessage?.users){
            setUsers(lastJsonMessage.users)
            setMessages(null)
        }
        if(lastJsonMessage?.form){
            setFormState(lastJsonMessage.form)
        }
        if(lastJsonMessage?.focus){
            setFormFocus(lastJsonMessage.focus)
        }
        if(lastJsonMessage?.blur){
            setFormFocus(null)
        }
        if(lastJsonMessage?.message){
            console.log(lastJsonMessage?.message)
            setMessages(messages?.concat([lastJsonMessage?.message]) || [lastJsonMessage?.message]) 
            clearTimeout(messageReset)
            const messageReset = setTimeout(()=>{
                setMessages(null)
            },5000)
        }
      }, [lastJsonMessage]);

    const handleChange = (e)=>{
        const value = e.currentTarget.value
        const key = e.currentTarget.name
        sendJsonMessage(
            {
                action: "UPDATE_FORM",
                payload : {
                    formID,
                    key,
                    value
                }
            }
        )
    }
    const handleFocus = (e)=>{
        const key = e.currentTarget.name
        sendJsonMessage(
            {
                action: "STEAL_FOCUS",
                payload : {
                    key,
                    id,
                    formID
                }
            }
        )
    }
    const handleBlur = (e)=>{
        const key = e.currentTarget.name
        sendJsonMessage(
            {
                action : "RELEASE_FOCUS",
                payload:{
                    key,
                    formID
                }
            }
        )
    } 
    return(
        <div className="flex justify-center">
        <form className="flex flex-col h-96 justify-between p-4">
            <h3 className="text-lg font-bold text-center">Form ID: {formID}</h3>
            <input type="text" name="firstname" placeholder="First Name" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} value={formState.firstname} disabled={blockFocus && blockFocus.key === "firstname" && blockFocus.id !== id} className={blockFocus && blockFocus.key === "firstname" && blockFocus.id !== id && "bg-gray-400"}/>
            <input type="text" name="lastname" placeholder="Last Name" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} value={formState.lastname} disabled={blockFocus && blockFocus.key === "lastname" && blockFocus.id !== id} className={blockFocus && blockFocus.key === "lastname" && blockFocus.id !== id && "bg-gray-400"}/>
            <input type="text" name="address" placeholder="Address" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} value={formState.address} disabled={blockFocus && blockFocus.key === "address" && blockFocus.id !== id} className={blockFocus && blockFocus.key === "address" && blockFocus.id !== id && "bg-gray-400"}/>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} value={formState.email} disabled={blockFocus && blockFocus.key === "email" && blockFocus.id !== id} className={blockFocus && blockFocus.key === "email" && blockFocus.id !== id && "bg-gray-400"}/>
            <input type="text" name="phone" placeholder="Phone #" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} value={formState.phone} disabled={blockFocus && blockFocus.key === "phone" && blockFocus.id !== id} className={blockFocus && blockFocus.key === "phone" && blockFocus.id !== id && "bg-gray-400"}/>
            <input type="submit" value="Submit" className="mt-4 border-solid border-2 border-gray-700 cursor-pointer"/>
        </form>
        <div className="p-4">
            <ul>Users: {users.map((user)=>{
                return <li>{user}</li>
            })}
            </ul>
            <div className="p-4 h-64 bg-rose-300 border-2 border-red-900">
                Messages:
                {messages?.map((m)=>{
                    return <p>{m}</p>
                })
            }</div>
        </div>
       
        </div> 
    )
}