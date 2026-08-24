import { useState } from 'react';

import './Welcome.css';

function Welcome(props: { onStart: (username: string) => void }) {
    const [value, setValue] = useState('');
    function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        if (value.trim()) {
            props.onStart(value.trim());
        }
    }
    return <div className="welcome-container">
        <h1>Welcome to MIMMIs</h1>
        <p>Please enter your TikTok username to start:</p>
        <form onSubmit={handleSubmit}>
            <input value={value} onChange={(e) => setValue(e.target.value)} />
            <button type="submit">Start</button>
        </form>
    </div>;
};

export default Welcome;