import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../db.js';
import { PrevPromptsComponent } from './prevPromptsComponent.jsx';

export function SendPrompt() {
  const [Context, setContext] = useState("");
  const [Prompt, setPrompt] = useState("");
  const [Response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prevPrompts, setPrevPrompts] = useState([])

  useEffect(() => {
    const loadExistingPrompts = async () => {
      try {
        const existingPrompts = await db.gpt_db.toArray();
        setPrevPrompts(existingPrompts);
        
        // Log existing prompts to the console
        console.log("Existing Prompts:", existingPrompts);
      } catch (error) {
        console.error('Error loading existing prompts:', error);
      }
    };
    loadExistingPrompts();
  }, []); // Run once on component mount

  const handleContextChange = (e) => {
    setContext(e.target.value);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleApiRequest = (e) => {
    e.preventDefault();

    if (isLoading) {
      // If a request is already in progress, do nothing
      return;
    }

    setIsLoading(true);

    let data = {
      "context": Context.trim() ? Context.trim() : "no matter what the user says, give short and concise answer",
      "prompt": Prompt.trim()
    };

    if (data.prompt === '') {
      setError('Please enter a prompt');
      setIsLoading(false);
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const backendUrl = '/api/gpt';
    axios.post(backendUrl, data, config)
      .then(async (response) => {
        // Update response state
        setResponse(response.data.res);

        try {
          // Add new prompt to the indexedDB
          const newGpt = await db.gpt_db.add({
            prompt: Prompt,
            response: response.data.res,
          });

          console.log("New Prompt:Response added to the database with id : ", newGpt);
          console.log(db.gpt_db);

          // Use the updated state to ensure you get the correct response
          setPrevPrompts(prevPromptsFunArg => [
            ...prevPromptsFunArg,
            { id: newGpt, Prompt, Response: response.data.res }, // Use response.data.res
          ]);
        } catch (error) {
          console.log("error adding prompt and response", error);
        }
      })
      .finally(() => {
        // Clear loading state and error after the request is complete
        setIsLoading(false);
        setTimeout(() => {
          setError(null);
        }, 5000); // Clear error message after 5 seconds (adjust as needed)
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ margin: '20px', border: '1px solid gray', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#6c757d', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', color: 'white' }}>
        <div>
          <input
            id='Context'
            type="text"
            placeholder="Context (optional)"
            value={Context}
            style={{ margin: '10px', width: '80%', border: 'gray' }}
            onChange={handleContextChange}
          />
        </div>
        <div>
          <input
            id='Prompt'
            type="text"
            placeholder="Prompt"
            value={Prompt}
            style={{ margin: '10px', width: '80%', border: 'gray' }}
            onChange={handlePromptChange}
            required
          />
        </div>
        <div>
          <button style={{ margin: '10px', color: isLoading ? '#757575' : 'white' }} onClick={handleApiRequest} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Send Request'}
          </button>
        </div>
        {error && <p style={{ color: 'red', marginLeft: '10px', marginRight: '10px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>{error}</p>}
        <hr />
        <h3>Response from GPT-3.5-Turbo: </h3>
        <hr />
        <p style={{ marginLeft: '20px', marginRight: '20px' }}>{Response}</p>
      </div>
      {prevPrompts.length > 0 && <h2 style={{ color: 'black', textAlign: 'center', marginLeft: "20px", marginRight: '20px' }}>Previous Prompts:</h2>}
      <PrevPromptsComponent prompts={prevPrompts} />
    </div>
  );
}
