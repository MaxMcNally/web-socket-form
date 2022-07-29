import {useState,useEffect} from "react"


//Mock login for demo purposes
export function useLogin(){
    const [id, setID] = useState(null)

    useEffect(()=>{
        if(localStorage.getItem("id") && localStorage.getItem("id") !== null){
            setID(localStorage.getItem("id"))
        }
        else {
            fetch("/login",{
                method : "GET",
    
            }).then(async (response)=>{
                const result = await response.json()
                console.log("Assigning ID", result.id)
                localStorage.setItem('id', result.id);
                setID(result.id)
                
                
            }).catch((e)=>{
    
            })
        }

    },[])
    return id
}