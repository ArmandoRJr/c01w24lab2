import React, {useState, useEffect} from "react"
import './App.css';

const baseNote = {title: "", content: ""}

function Dialog({open, initialNote, closeDialog, postNote: postNoteState}) {

    // -- Dialog props --
    const [note, setNote] = useState(baseNote)
    const [status, setStatus] = useState("")

    // -- Dialog functions --
    useEffect(() => {
        !initialNote && setNote(baseNote)
        initialNote && setNote(initialNote)
    }, [initialNote])

    const close = () => {
        setStatus("")
        setNote(baseNote)
        closeDialog()
    }

    // -- Database interaction functions --
    const postNote = async () => {
        if (!note || !note.title || !note.content) {
            return 
        }

        setStatus("Loading...")

        try {
            await fetch("http://localhost:4000/postNote",
                {method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({title: note.title, content: note.content})} )
            .then(async (response) => {
                if (!response.ok) {
                    setStatus(`Error trying to post note`)
                    console.log("Served failed:", response.status)
                } else {
                    await response.json().then((data) => {
                        postNoteState(data.insertedId, note.title, note.content)
                        setStatus("Note posted!") // Can be replaced with close(), if you want!
                    }) 
                }
            })
        } catch (error) {
            setStatus("Error trying to post note")
            console.log("Fetch function failed:", error)
        } 
    }

    const patchNote = (entry) => {
        // Code for PATCH here
    }

    return (
        <dialog open={open} style={{width: "75%"}}>
            <input
                placeholder="Your note title goes here!"
                type="text"
                value={note.title}
                maxLength={30}
                style={{fontSize: "40px", display: "block", width: "100%"}}
                onChange={(e) => setNote({...note, title: e.target.value})}
            />
            <textarea
                placeholder="Your note content goes here!"
                value={note.content}
                rows={5}
                style={{fontSize: "20px", display: "block", width: "100%"}}
                onChange={(e) => setNote({...note, content: e.target.value})}
            />
            <div style={{display: "flex", justifyContent: "space-between", gap: "10px"}}>
                <button
                    onClick={initialNote ? patchNote : postNote}
                    disabled={!note.title || !note.content}>
                    {initialNote ? 'Patch Note' : 'Post Note'}
                </button>
                {status}
                <button
                    style={{justifySelf: "end"}}
                    onClick={() => close()}
                >
                    Close
                </button>
            </div>
        </dialog>
    )

}

export default Dialog;
