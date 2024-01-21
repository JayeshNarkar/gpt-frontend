import React from 'react';

const PrevPromptsComponent = React.memo(({ prompts }) => {
  const reversedPrompts = prompts.slice().reverse();
  console.log(reversedPrompts);

  return (
    <div>
      {reversedPrompts.map((prevPrompt) => (
        <div key={prevPrompt.id} style={{ margin: '20px', border: '1px solid gray', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#6c757d', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', color: 'white' }}>
          <h3>{prevPrompt.Prompt || prevPrompt.prompt}</h3>
          <hr />
          <p style={{ marginLeft: '20px', marginRight: '20px' }}>{prevPrompt.response || prevPrompt.Response}</p>
        </div>
      ))}
    </div>
  );
});

export { PrevPromptsComponent };
