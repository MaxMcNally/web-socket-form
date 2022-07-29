const WebSocketServer = require("ws").WebSocketServer
const forms = {
    "1" : {},
    "2" : {}
}
const rooms = new Map();
const connections = new Map()
const wss = new WebSocketServer({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
        },
        zlibInflateOptions: {
        chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
    }
});

wss.on("connection", (ws)=>{
    console.log("Connection")
    ws.on('message', message => {
        console.log(`Received message => ${message}`)
        message = JSON.parse(message)
        switch(message.action){
            case "ADD_USER":
                (() => {
                    const {user, formID} = message.payload
                    if(connections.get(ws)) {
                        connections.get(ws).rooms.push(formID)
                    }
                    else {
                        connections.set(ws,{user,rooms:[formID]})
                    }
                    if(!rooms.get(formID)){
                        rooms.set(formID,{
                            users: [{
                                id: user,
                                ws
                            }],
                            form: forms[formID]
                        })
                    }
                    
                    const currentUsers = rooms.get(formID).users
                    if(!currentUsers.find((u)=>{
                        return u.id === user
                    })){
                        const oldMap = rooms.get(formID)
                        oldMap.users = currentUsers.concat([{id:user,ws}])
                        rooms.set(formID, oldMap)
                    }
                    
                    const response = JSON.stringify({
                        users: rooms.get(formID).users.map((user)=> user.id),
                        form: rooms.get(formID).form,
                        message: user + " has joined..."
                    })
                    wss.notifyRoom(formID,response)
                })()
                break
            
            case "UPDATE_FORM":
                (() => {
                    const {formID, key, value} = message.payload
                    forms[formID][key] = value
                    const response = JSON.stringify({form:forms[formID]})
                    wss.notifyRoom(formID,response)
                })()
                break;

            case "STEAL_FOCUS":
                (() => {
                    const {key,id, formID} = message.payload
                    const response = JSON.stringify({focus:{key,id}})
                    wss.notifyRoom(formID,response)
                })()
                break
            
            case "RELEASE_FOCUS":
                (() => {
                    const {key, formID} = message.payload
                    const response = JSON.stringify({blur:key})
                    wss.notifyRoom(formID,response)
                })()
                break
        }
    })
    ws.on("close", (code)=>{
        let usersRooms = connections.get(ws).rooms
        usersRooms.forEach( room => {
            //update room
            const oldRoom = rooms.get(room) 
            oldRoom.users = oldRoom.users.filter((u)=>{
                return u.id !== connections.get(ws).user
            })
            rooms.set(room,oldRoom)
            wss.notifyRoom(room, JSON.stringify(
                {
                    message: connections.get(ws).user + " has left...", 
                    users : rooms.get(room).users.map(user => user.id)
                }
            )
                
        )
       
        })
        connections.delete(ws)
    })
})

//notify members of a room
wss.notifyRoom = function(roomID,msg) {
    const users = rooms.get(roomID).users
    users.forEach((user)=>{ 
        console.log("notifying user", user.id)
        console.log(msg)
        user.ws.send(msg)
    }) 
}

//notify all users in all rooms
wss.broadcast = function broadcast(users, msg) {
    users = rooms.reduce((memo,room)=>{
        memo.push(...room.users)
        return 
    },[])
    users.forEach((user)=>{ 
        user.ws.send(msg)
    })
}