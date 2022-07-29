import React from 'react'
import Head from 'next/head'
import '../styles/global.css'
import { useLogin } from '../hooks/useLogin'
function App({ Component, pageProps }) {
  const id = useLogin()

  return (
    <div>
      <Head>
        <title>Tailwindcss Emotion Example</title>
      </Head>
      <Component {...pageProps} id={id}/>
    </div>  
  )
}

export default App
