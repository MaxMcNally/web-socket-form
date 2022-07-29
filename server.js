const express = require('express')

const next = require('next')
const { nanoid } = require('nanoid')
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const forms = require("./forms")
app.prepare().then(() => {
    const server = express()
    server.get("/login",(req,res)=>{
        console.log("Logging in")
        res.setHeader('Content-Type', 'application/json');
        res.send({id:nanoid()})
    })
    server.post("/updateForm/:id",(req,res)=>{
        const id = req.params.id
        const key = req.body.key
        const value = req.body.value
        forms[id][key] = value
        return forms
    })
    server.all('*', (req, res) => {
        return handle(req, res)
    })
    require("./ws")
    server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
    })
})