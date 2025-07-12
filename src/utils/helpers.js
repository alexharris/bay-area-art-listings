// Helper function to extract text from Sanity portable text format
// This function can handle various portable text structures and convert them to searchable strings
export function extractPortableTextContent(portableText) {
    if (!portableText) return '';
    
    // If it's already a string, return as-is
    if (typeof portableText === 'string') {
        return portableText;
    } 
    
    // If it's an array (typical Sanity portable text format)
    if (Array.isArray(portableText)) {
        return portableText
            .filter(block => block && block._type === 'block')
            .map(block => {
                if (block.children && Array.isArray(block.children)) {
                    return block.children
                        .filter(child => child && typeof child.text === 'string')
                        .map(child => child.text)
                        .join('');
                }
                return '';
            })
            .filter(text => text.length > 0) // Remove empty strings
            .join('\n');
    } 
    
    // If it's an object, try to extract text content
    if (typeof portableText === 'object') {
        // Try common text properties
        if (portableText.text) return String(portableText.text);
        if (portableText.content) return String(portableText.content);
        if (portableText.value) return String(portableText.value);
        
        // If it has children property (single block)
        if (portableText.children && Array.isArray(portableText.children)) {
            return portableText.children
                .filter(child => child && typeof child.text === 'string')
                .map(child => child.text)
                .join('');
        }
        
        // Fallback to JSON stringification (for debugging purposes)
        return JSON.stringify(portableText);
    }
    
    // Fallback for any other type
    return String(portableText);
}