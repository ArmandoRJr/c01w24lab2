import React, {useState, useEffect} from "react"
import './App.css';

function App() {

  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState(undefined)


  useEffect(() => {
    const getNotes = async () => {
      try {
        await fetch("http://localhost:4000/getNotes")
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          setNotes(data)
        })

      } catch (error) {
        console.log("Frontend has suffered an error:", error)
      } finally {
        setLoading(false)
      }
    }

    getNotes()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={AppStyle.title}>QuirkNotes</h1>
        <h4 style={AppStyle.text}>The best note-taking app ever </h4>

        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: "center"}}>
          {loading ?
          <>Loading...</>
          : 
          notes ?
          notes.map((entry) => {
            return (<div key={entry._id} style={AppStyle.note}>
              <p style={AppStyle.text}>{entry.title}</p>
              <button>Delete note</button>
            </div>)
          })
          :
          <div style={{color: "red"}}>
            Something has gone horribly wrong!
            We can't get the notes!
          </div>

          }
        </div>

      </header>
    </div>
  );
}

export default App;

const AppStyle = {
  title: {
    margin: "0px"
  }, 
  text: {
    margin: "0px"
  }, 
  note: {
    padding: '20px',
    margin: '20px',
    width: '200px',
    borderStyle: 'dotted',
    borderRadius: '30px',
    borderWidth: 'thin',
    overflowWrap: "break-word"
  },
  noteText: {
    display: 'flex',
    alignItems: 'center',
  },
}