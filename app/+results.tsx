import React from 'react';
import { useHistory } from 'react-router-dom';

interface ResultsProps {
    score: number;
    onRetry: () => void;
    onNext: () => void;
}

const Results: React.FC<ResultsProps> = ({ score, onRetry, onNext }) => {
    const history = useHistory();

    const handleRetry = () => {
        onRetry();
        history.push('/trace');
    };

    const handleNext = () => {
        onNext();
        history.push('/next-letter');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Results</h1>
            <p>Your score: {score}</p>
            <button onClick={handleRetry} style={{ marginRight: '10px' }}>
                Try Again
            </button>
            <button onClick={handleNext}>
                Do Another One
            </button>
        </div>
    );
};

export default Results;