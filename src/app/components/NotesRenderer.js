import { useState } from 'react';

export default function NotesRenderer({ notes, itemIndex }) {
    const [expandedNotes, setExpandedNotes] = useState({});

    if (!notes) return null;
    
    // Handle different data types for notes
    let notesString;
    if (typeof notes === 'string') {
        notesString = notes;
    } else if (Array.isArray(notes)) {
        // Handle Sanity's portable text format (array of blocks)
        notesString = notes
            .filter(block => block._type === 'block')
            .map(block => 
                block.children
                    ? block.children.map(child => child.text).join('')
                    : ''
            )
            .join('\n');
    } else if (typeof notes === 'object') {
        // If it's an object, try to extract text content or stringify properly
        notesString = notes.text || notes.content || notes.value || JSON.stringify(notes);
    } else {
        notesString = String(notes);
    }
    
    // Check if the notes contain the +++ delimiter
    if (!notesString.includes('+++')) {
        return <div className="my-2 whitespace-pre-wrap">{notesString}</div>;
    }
    
    const parts = notesString.split('+++');
    const previewText = parts[0].trim();
    const expandedText = parts.slice(1).join('+++').trim();
    const isExpanded = expandedNotes[itemIndex];
    
    return (
        <div className="my-2">
            <span className="whitespace-pre-wrap">{previewText}</span>
            {expandedText && (
                <>
                    {isExpanded && (
                        <span className="whitespace-pre-wrap"> {expandedText}</span>
                    )}
                    <button
                        onClick={() => setExpandedNotes(prev => ({
                            ...prev,
                            [itemIndex]: !prev[itemIndex]
                        }))}
                        className="text-gray-600 hover:text-gray-800 underline text-sm block"
                    >
                        {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                </>
            )}
        </div>
    );
}
