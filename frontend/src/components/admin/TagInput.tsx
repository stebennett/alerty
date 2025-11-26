import { useState, KeyboardEvent } from 'react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="tag-input-container">
      {tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag}
          <button type="button" onClick={() => removeTag(index)}>&times;</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? 'Type and press Enter...' : ''}
      />
    </div>
  );
}
