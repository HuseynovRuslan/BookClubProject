const mockBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    rating: 4.5,
    coverImage:
      "https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=754&fit=clip",
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever.",
    reviews: [
      {
        id: 1,
        username: "BookLover23",
        rating: 5,
        comment: "Absolutely captivating! A must-read!",
        date: "Oct 1, 2025",
      },
      {
        id: 2,
        username: "ReadingNerd",
        rating: 4,
        comment: "Beautiful concept, ending a bit predictable.",
        date: "Sep 28, 2025",
      },
    ],
  },
  {
    id: 2,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    genre: "Mystery",
    rating: 4.8,
    coverImage:
      "https://images.unsplash.com/photo-1739521949473-a703e0536ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description:
      "Rumors of the 'Marsh Girl' haunt Barkley Cove. When Chase Andrews is found dead, locals suspect Kya Clark.",
    reviews: [
      {
        id: 3,
        username: "MysteryFan",
        rating: 5,
        comment: "Gripping from start to finish!",
        date: "Oct 5, 2025",
      },
    ],
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    rating: 4.7,
    coverImage:
      "https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description:
      "Atomic Habits offers a proven framework for improving every day.",
    reviews: [
      {
        id: 4,
        username: "ProductivityGuru",
        rating: 5,
        comment: "Life-changing! The 2-minute rule works wonders.",
        date: "Oct 3, 2025",
      },
    ],
  },
];

export default mockBooks;