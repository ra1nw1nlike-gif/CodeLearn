export const DEFAULT_COURSE_TITLE = "Основи Python";
export const CONDITIONALS_COURSE_TITLE = "Умовні оператори Python";

export const courses = [
  {
    title: DEFAULT_COURSE_TITLE,
    aliases: ["Python Basics"],
    description:
      "Базовий курс про введення даних, числа, арифметику та формат відповіді для автоперевірки.",
    tasks: [
      { id: 1, title: "Сума двох чисел" },
      { id: 2, title: "Квадрат числа" },
    ],
    theoryIntro:
      "Перед практичними завданнями повторіть базові принципи введення, обробки чисел та точного формату виводу. Саме ці теми будуть потрібні для задач курсу.",
    theory: [
      {
        title: "Введення та виведення даних",
        text:
          "У Python програма часто отримує дані від користувача через input(). Функція input() завжди повертає рядок, тому для чисел потрібно явно виконати перетворення типу.",
        code:
          'name = input()\n' +
          'print("Привіт,", name)\n\n' +
          'age = int(input())\n' +
          'print(age + 1)',
      },
      {
        title: "Робота з числами",
        text:
          "Для арифметичних задач важливо правильно зчитати числа і застосувати потрібну операцію. Оператор + додає, * множить, а ** підносить число до степеня.",
        code:
          'a, b = map(int, input().split())\n' +
          'print(a + b)\n\n' +
          'n = int(input())\n' +
          'print(n * n)',
      },
      {
        title: "Формат відповіді",
        text:
          "Автоматична перевірка порівнює результат програми з очікуваним виводом. Тому варто виводити саме те, що просить умова: без зайвих слів, підказок або додаткових чисел.",
        code:
          '# Правильно для задачі на суму:\n' +
          'a, b = map(int, input().split())\n' +
          'print(a + b)\n\n' +
          '# Неправильно для автотесту:\n' +
          'print("Сума дорівнює", a + b)',
      },
      {
        title: "Типові помилки",
        text:
          "Найчастіше помилки виникають через неправильне перетворення типів, зайвий текст у print(), або через те, що програма читає не всі вхідні дані. Перед практикою перевірте ці три речі.",
        code:
          'x = int(input())\n' +
          'print(x ** 2)\n\n' +
          '# Якщо в одному рядку два числа:\n' +
          'x, y = map(int, input().split())',
      },
    ],
    quiz: [
      {
        question: "Що робить input() у Python?",
        options: [
          "Виводить текст",
          "Створює цикл",
          "Зчитує введення користувача",
          "Закриває програму",
        ],
        correctIndex: 2,
      },
      {
        question: "Який тип даних повертає input() без додаткового перетворення?",
        options: ["Рядок", "Ціле число", "Список", "Логічне значення"],
        correctIndex: 0,
      },
      {
        question: "Як правильно зчитати два цілі числа з одного рядка?",
        options: [
          "a, b = input(int)",
          "a, b = map(int, input().split())",
          "a + b = input()",
          "print(input())",
        ],
        correctIndex: 1,
      },
      {
        question: "Що виведе print(4 * 4)?",
        options: ["8", "12", "16", "44"],
        correctIndex: 2,
      },
      {
        question: "Чому в автоперевірці не варто виводити зайвий текст?",
        options: [
          "Бо Python не підтримує текст",
          "Бо перевірка порівнює точний результат виводу",
          "Бо print() працює тільки з числами",
          "Бо input() перестане працювати",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    title: CONDITIONALS_COURSE_TITLE,
    aliases: [],
    description:
      "Курс про if, else, elif, оператори порівняння та логічні оператори Python.",
    tasks: [
      { id: 10, title: "Парне чи непарне" },
      { id: 11, title: "Більше число" },
      { id: 12, title: "Оцінка студента" },
      { id: 13, title: "Калькулятор" },
    ],
    theoryIntro:
      "У цьому курсі ви навчитеся керувати виконанням програми за допомогою умов. Теорія пояснює if, else, elif, оператори порівняння та логічні оператори.",
    theory: [
      {
        title: "if",
        text: "if використовується для перевірки умови.",
        code:
          'age = 18\n\n' +
          'if age >= 18:\n' +
          '    print("Повнолітній")',
      },
      {
        title: "else",
        text: "else виконується коли умова false.",
        code:
          'num = -1\n\n' +
          'if num > 0:\n' +
          '    print("Додатне")\n' +
          'else:\n' +
          '    print("Не додатне")',
      },
      {
        title: "elif",
        text: "elif дозволяє перевіряти кілька умов.",
        code:
          'score = 85\n\n' +
          'if score >= 90:\n' +
          '    print("A")\n' +
          'elif score >= 70:\n' +
          '    print("B")\n' +
          'else:\n' +
          '    print("C")',
      },
      {
        title: "Оператори порівняння",
        text:
          "Оператори порівняння повертають True або False і допомагають створювати умови.",
        code:
          '==  # дорівнює\n' +
          '!=  # не дорівнює\n' +
          '>   # більше\n' +
          '<   # менше\n' +
          '>=  # більше або дорівнює\n' +
          '<=  # менше або дорівнює',
      },
      {
        title: "Логічні оператори",
        text:
          "and, or та not дозволяють поєднувати кілька умов або змінювати їхній логічний результат.",
        code:
          'age = 20\n' +
          'has_ticket = True\n\n' +
          'if age >= 18 and has_ticket:\n' +
          '    print("Можна увійти")\n\n' +
          'if not has_ticket:\n' +
          '    print("Потрібен квиток")',
      },
    ],
    quiz: [
      {
        question: "Що робить if?",
        options: [
          "Створює цикл",
          "Перевіряє умову",
          "Створює список",
          "Закриває програму",
        ],
        correctIndex: 1,
      },
      {
        question: "Що робить else?",
        options: [
          "Виконується якщо умова false",
          "Запускає функцію",
          "Імпортує бібліотеку",
          "Завершує цикл",
        ],
        correctIndex: 0,
      },
      {
        question: "Що робить elif?",
        options: [
          "Дозволяє кілька перевірок умов",
          "Створює змінну",
          "Читає input",
          "Запускає while",
        ],
        correctIndex: 0,
      },
      {
        question: 'Який оператор означає "не дорівнює"?',
        options: ["==", "!=", ">=", "<="],
        correctIndex: 1,
      },
    ],
  },
];

export function getCourseByTitle(courseTitle) {
  if (!courseTitle) return courses[0];

  return (
    courses.find((course) => (
      course.title === courseTitle || course.aliases?.includes(courseTitle)
    )) || courses[0]
  );
}

export function getCourseTitleFromLocation(location) {
  const params = new URLSearchParams(location.search);
  return location.state?.courseTitle || params.get("courseTitle") || DEFAULT_COURSE_TITLE;
}

export function getCoursePath(path, courseTitle) {
  return `${path}?courseTitle=${encodeURIComponent(courseTitle)}`;
}

export function findCourseProgress(progressCourses, course) {
  return progressCourses.find((progressCourse) => (
    progressCourse.title === course.title || course.aliases?.includes(progressCourse.title)
  ));
}
