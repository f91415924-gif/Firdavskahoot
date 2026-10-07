import { Quiz } from '../types/quiz';

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 'quiz-uzb-general-1',
    title: "O'zbekiston va Dunyo Bilimdoni 🌍",
    description: "Tarix, geografiya, madaniyat va umumiy bilimlar bo'yicha qiziqarli savollar to'plami.",
    category: "Umumiy bilim",
    createdAt: Date.now() - 1000000,
    questions: [
      {
        id: 'q1',
        text: "O'zbekiston Respublikasi mustaqillikka erishgan sana qaysi?",
        options: [
          "1991-yil 1-sentyabr",
          "1990-yil 8-dekabr",
          "1992-yil 21-mart",
          "1993-yil 1-sentyabr"
        ],
        correctOptionIndex: 0,
        timeLimit: 20,
        pointsMultiplier: 'standard'
      },
      {
        id: 'q2',
        text: "Yer sharining eng baland cho'qqisi qaysi?",
        options: [
          "K2 (Chogori)",
          "Everest (Jomolungma)",
          "Elbrus",
          "Monblan"
        ],
        correctOptionIndex: 1,
        timeLimit: 20,
        pointsMultiplier: 'standard'
      },
      {
        id: 'q3',
        text: "Alisher Navoiy qaysi asari orqali mashhur 'Xamsa'ni yaratgan?",
        options: [
          "Boburnoma",
          "Devoni Foniy",
          "Xamsa (Besh doston)",
          "Zafarnoma"
        ],
        correctOptionIndex: 2,
        timeLimit: 25,
        pointsMultiplier: 'standard'
      },
      {
        id: 'q4',
        text: "Quyosh sistemasidagi eng katta sayyora qaysi?",
        options: [
          "Mars",
          "Saturn",
          "Neptun",
          "Yupiter"
        ],
        correctOptionIndex: 3,
        timeLimit: 15,
        pointsMultiplier: 'double'
      },
      {
        id: 'q5',
        text: "Samarqanddagi mashhur Registon maydonida nechta madrasa joylashgan?",
        options: [
          "2 ta",
          "3 ta",
          "4 ta",
          "5 ta"
        ],
        correctOptionIndex: 1,
        timeLimit: 20,
        pointsMultiplier: 'double'
      }
    ]
  },
  {
    id: 'quiz-tech-2',
    title: "IT va Zamonaviy Texnologiyalar 💻",
    description: "Dasturlash, sun'iy intellekt va internet texnologiyalari haqidagi intellektual viktorina.",
    category: "Texnologiya",
    createdAt: Date.now() - 500000,
    questions: [
      {
        id: 'q-tech-1',
        text: "World Wide Web (WWW) tizimining ixtirochisi kim?",
        options: [
          "Bill Gates",
          "Tim Berners-Lee",
          "Steve Jobs",
          "Linus Torvalds"
        ],
        correctOptionIndex: 1,
        timeLimit: 20,
        pointsMultiplier: 'standard'
      },
      {
        id: 'q-tech-2',
        text: "Python dasturlash tili o'z nomini nimadan olgan?",
        options: [
          "Piton ilonidan",
          "Monty Python komediya shousidan",
          "Muallifning mushugidan",
          "Qadimgi yunon mifologiyasidan"
        ],
        correctOptionIndex: 1,
        timeLimit: 20,
        pointsMultiplier: 'standard'
      },
      {
        id: 'q-tech-3',
        text: "Veb-brauzerlarda dinamik interfeys yaratishda qaysi til asosiy hisoblanadi?",
        options: [
          "C++",
          "Java",
          "JavaScript",
          "Ruby"
        ],
        correctOptionIndex: 2,
        timeLimit: 15,
        pointsMultiplier: 'standard'
      },
      {
        id: 'q-tech-4',
        text: "GitHub platformasining ramzi (mascoti) qanday maxluq?",
        options: [
          "Octocat (Sakkizoyoq-mushuk)",
          "Penguin (Pingvin)",
          "Dolphin (Delfin)",
          "Fox (Tulki)"
        ],
        correctOptionIndex: 0,
        timeLimit: 20,
        pointsMultiplier: 'double'
      },
      {
        id: 'q-tech-5',
        text: "Bir baytda nechta bit bor?",
        options: [
          "4 bit",
          "8 bit",
          "16 bit",
          "32 bit"
        ],
        correctOptionIndex: 1,
        timeLimit: 15,
        pointsMultiplier: 'double'
      }
    ]
  }
];
