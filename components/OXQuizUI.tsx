// components/OXQuizUI.tsx

interface OXQuizUIProps {
  selectedValue: string | null;
  onAnswer: (answer: 'O' | 'X') => void;
  isSubmitted: boolean;
}

export const OXQuizUI = ({ selectedValue, onAnswer, isSubmitted }: OXQuizUIProps) => {
  return (
    <div className="flex justify-center space-x-4 md:space-x-8 my-6">
      {(['O', 'X'] as const).map(option => (
        <button
          key={option}
          onClick={() => onAnswer(option)}
          disabled={isSubmitted}
          className={`
            w-28 h-28 md:w-36 md:h-36 flex items-center justify-center
            text-4xl md:text-5xl font-bold rounded-full 
            border-4 transition-all duration-200 ease-out
            transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-4
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            ${
              selectedValue === option
                ? (option === 'O' ? 'bg-blue-500 border-blue-600 text-white focus:ring-blue-200' : 'bg-red-500 border-red-600 text-white focus:ring-red-200')
                : 'bg-white/50 border-gray-300 text-gray-700 hover:border-gray-400'
            }
          `}
        >
          {option}
        </button>
      ))}
    </div>
  );
};