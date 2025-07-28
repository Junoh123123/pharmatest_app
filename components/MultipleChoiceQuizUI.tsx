// components/MultipleChoiceQuizUI.tsx

interface MultipleChoiceQuizUIProps {
  options: string[];
  selectedValue: string[] | string;
  onAnswer: (answer: string[] | string) => void;
  isSubmitted: boolean;
  multiSelect?: boolean; // 이 빈칸에서 복수선택 가능한지
  blankIndex?: number; // 몇 번째 빈칸인지 (0, 1, 2...)
  isMultiBlank?: boolean; // 전체 문제가 여러 빈칸을 가지는지
}

export const MultipleChoiceQuizUI = ({ 
  options, 
  selectedValue, 
  onAnswer, 
  isSubmitted, 
  multiSelect = false,
  blankIndex = 0,
  isMultiBlank = false
}: MultipleChoiceQuizUIProps) => {
  
  console.log(`빈칸 ${blankIndex + 1} - selectedValue:`, selectedValue);
  console.log(`빈칸 ${blankIndex + 1} - multiSelect:`, multiSelect);
  console.log(`빈칸 ${blankIndex + 1} - isMultiBlank:`, isMultiBlank);

  // 현재 빈칸의 선택값들 가져오기
  const getCurrentBlankValues = (): string[] => {
    if (isMultiBlank && Array.isArray(selectedValue)) {
      // 여러 빈칸이 있는 경우: selectedValue는 전체 빈칸들의 배열
      const blankValue = selectedValue[blankIndex];
      if (multiSelect) {
        // 이 빈칸이 복수선택이면 문자열을 배열로 파싱 ("1,2,3" -> ["1","2","3"])
        return typeof blankValue === 'string' && blankValue ? blankValue.split(',') : [];
      } else {
        // 이 빈칸이 단일선택이면 문자열을 배열로 감싸기
        return typeof blankValue === 'string' && blankValue ? [blankValue] : [];
      }
    } else if (multiSelect && Array.isArray(selectedValue)) {
      // 단일 빈칸 복수선택: selectedValue가 선택된 옵션들의 배열
      return selectedValue;
    } else if (typeof selectedValue === 'string') {
      // 단일 빈칸 단일선택: selectedValue가 하나의 문자열
      return selectedValue ? [selectedValue] : [];
    }
    return [];
  };

  // 선택값 업데이트
  const updateSelection = (optionValue: string) => {
    console.log(`빈칸 ${blankIndex + 1} - 선택 업데이트 시작 (옵션 값: ${optionValue})`);
    if (isMultiBlank) {
      const currentArray = Array.isArray(selectedValue) ? [...selectedValue] : [];
      const currentValues = getCurrentBlankValues();

      if (multiSelect) {
        let newValues: string[];
        if (currentValues.includes(optionValue)) {
          newValues = currentValues.filter(v => v !== optionValue);
        } else {
          newValues = [...currentValues, optionValue];
        }
        currentArray[blankIndex] = newValues.join(',');
      } else {
        currentArray[blankIndex] = currentValues.includes(optionValue) ? '' : optionValue;
      }

      console.log(`빈칸 ${blankIndex + 1} - 선택 업데이트 완료 (전체 배열: ${JSON.stringify(currentArray)})`);
      onAnswer(currentArray);
    } else {
      const currentValues = getCurrentBlankValues();
      if (multiSelect) {
        let newValues: string[];
        if (currentValues.includes(optionValue)) {
          newValues = currentValues.filter(v => v !== optionValue);
        } else {
          newValues = [...currentValues, optionValue];
        }
        console.log(`단일 빈칸 복수선택 - 선택값들: ${JSON.stringify(newValues)}`);
        onAnswer(newValues);
      } else {
        const newValue = currentValues.includes(optionValue) ? '' : optionValue;
        console.log(`단일 빈칸 단일선택 - 선택값: ${newValue}`);
        onAnswer(newValue);
      }
    }
  };

  const handleClick = (idx: number) => {
    if (isSubmitted) {
      console.log(`빈칸 ${blankIndex + 1} - 클릭 차단됨 (isSubmitted: true)`);
      return;
    }
    const optionValue = String(idx + 1);
    console.log(`빈칸 ${blankIndex + 1} - 클릭됨 (옵션 값: ${optionValue})`);
    updateSelection(optionValue);
  };

  const currentValues = getCurrentBlankValues();

  return (
    <div className="space-y-4 my-6">
      {/* 디버깅 정보 표시 (개발 중에만 사용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          빈칸 {blankIndex + 1} | 현재값들: [{currentValues.join(', ')}] | 전체: {JSON.stringify(selectedValue)}
        </div>
      )}
      
      {options.map((option, idx) => {
        const optionValue = String(idx + 1);
        const isSelected = currentValues.includes(optionValue);
        
        return (
          <button
            key={`blank-${blankIndex}-option-${idx}-${option}`}
            onClick={() => handleClick(idx)}
            disabled={isSubmitted}
            className={`
              w-full text-left p-4 border-2 rounded-2xl
              transition-all duration-200 ease-out text-lg
              focus:outline-none focus:ring-4
              disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-500
              ${
                isSelected
                  ? 'bg-blue-500 border-blue-600 text-white focus:ring-blue-200'
                  : 'bg-white/50 border-gray-300 hover:border-blue-400 focus:ring-blue-100'
              }
            `}
          >
            <div className="flex items-center">
              {multiSelect ? (
                // 체크박스 스타일 (복수선택)
                <div className={`
                  w-5 h-5 border-2 rounded mr-3 flex items-center justify-center
                  ${isSelected ? 'bg-white border-white' : 'border-gray-400'}
                `}>
                  {isSelected && <div className="w-2 h-2 bg-blue-500 rounded"></div>}
                </div>
              ) : (
                // 라디오버튼 스타일 (단일선택)
                <div className={`
                  w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center
                  ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}
                `}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              )}
              {option}
            </div>
          </button>
        );
      })}
    </div>
  );
};