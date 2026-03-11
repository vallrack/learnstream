export type Lesson = {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  isFree: boolean;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isFree: boolean;
  instructor: string;
  category: string;
  modules: Module[];
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Mastering Web Development',
    description: 'Learn full-stack web development from scratch using modern tools and frameworks.',
    thumbnail: 'https://picsum.photos/seed/dev/800/450',
    isFree: true,
    instructor: 'Alex Rivers',
    category: 'Development',
    modules: [
      {
        id: 'mod-1',
        title: 'Introduction to HTML & CSS',
        lessons: [
          {
            id: 'les-1',
            title: 'Welcome to the Course',
            content: 'In this lesson, we introduce the fundamentals of web structure using HTML5. We will explore how tags work and why semantic HTML is important for accessibility and SEO.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isFree: true
          },
          {
            id: 'les-2',
            title: 'Styling with CSS3',
            content: 'CSS is the skin of the web. Here we learn about selectors, the box model, and how to create responsive layouts with Flexbox and Grid.',
            videoUrl: 'https://www.youtube.com/embed/y881t8ilMyc',
            isFree: true
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Advanced JavaScript',
        lessons: [
          {
            id: 'les-3',
            title: 'Asynchronous JS',
            content: 'Understanding Promises, Async/Await, and how the Event Loop works is crucial for any professional developer.',
            isFree: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: 'UX Design Mastery',
    description: 'Design beautiful, intuitive interfaces that users love using Figma and user-centric principles.',
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    isFree: false,
    instructor: 'Sarah Jenkins',
    category: 'Design',
    modules: [
      {
        id: 'mod-3',
        title: 'UX Foundations',
        lessons: [
          {
            id: 'les-4',
            title: 'What is UX?',
            content: 'User Experience is more than just how something looks. It is how it works and feels for the user.',
            isFree: true
          }
        ]
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Digital Marketing 101',
    description: 'Grow your business or brand using the power of social media and SEO.',
    thumbnail: 'https://picsum.photos/seed/marketing/800/450',
    isFree: true,
    instructor: 'Mark Thompson',
    category: 'Business',
    modules: [
      {
        id: 'mod-4',
        title: 'Social Media Strategy',
        lessons: [
          {
            id: 'les-5',
            title: 'Platform Basics',
            content: 'Identifying where your audience lives online.',
            isFree: true
          }
        ]
      }
    ]
  }
];
