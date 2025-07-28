import { Subject } from '@/types/exam'

const subjectData: Subject = {
  id: 'bioethics',
  name: '生命倫理',
  description: '生命倫理、関連法規、医療現場でのコミュニケーションに関する知識を問う問題集。',
  categories: [
    {
      id: 'bioethics-ox',
      name: '生命倫理OX問題',
      nameEn: 'Bioethics O/X Quiz',
      description: '生命倫理に関する基本的な知識の正誤を問う問題です。',
      start: 1,
      end: 98,
      questionCount: 0,
      questions: [],
    },
  ],
};

export const subject = subjectData;
export const categories = {
  'bioethics-ox': {
    id: 'bioethics-ox',
    nameEn: 'Bioethics O/X Quiz',
    description: '生命倫理に関する基本的な知識の正誤を問う問題です。',
    start: 1,
    end: 98
  },
};