import React, {useState, useEffect} from "react"
import './App.css';
import Dialog from "./Dialog";

function App() {

  // -- Backend-related state --
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState(undefined)

  // -- Dialog props-- 
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogNote, setDialogNote] = useState(null)

  
  // -- Database interaction functions --
  useEffect(() => {
    const getNotes = async () => {
      try {
        await fetch("http://localhost:4000/getNotes")
        .then(async (response) => {
          if (!response.ok) {
            console.log("Served failed:", response.status)
          } else {
              await response.json().then((data) => {
              getNoteState(data)
          }) 
          }
        })
      } catch (error) {
        console.log("Fetch function failed:", error)
      } finally {
        setLoading(false)
      }
    }

    getNotes()
  }, [])

  const deleteNote = (entry) => {
    // Code for DELETE here
  }

  
  // -- Dialog functions --
  const editNote = (entry) => {
    setDialogNote(entry)
    setDialogOpen(true)
  }

  const postNote = () => {
    setDialogNote(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogNote(null)
    setDialogOpen(false)
  }

  // -- State modification functions -- 
  const getNoteState = (data) => {
    setNotes(data)
  }

  const postNoteState = (_id, title, content) => {
    setNotes((prevNotes) => [...prevNotes, {_id, title, content}])
  }

  const deleteNoteState = () => {
    // Code for modifying state after DELETE here
  }

  const patchNoteState = (_id, title, content) => {
    // Code for modifying state after PATCH here
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={dialogOpen ? {opacity: "20%", pointerEvents: "none"} : {}}>
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
                <button onClick={() => editNote(entry)}>Edit note</button>
                {<button onClick={() => deleteNote(entry)}>Delete note</button>}
                
              </div>)
            })
            :
            <div style={{color: "red"}}>
              Something has gone horribly wrong!
              We can't get the notes!
            </div>
            }
          </div>

          <button onClick={postNote}>Post Note</button>

        </div>

        <Dialog
          open={dialogOpen}
          initialNote={dialogNote}
          closeDialog={closeDialog}
          postNote={postNoteState}
          // patchNote={patchNoteState}
          />

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