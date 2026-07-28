export interface Book {
  id: string | number;
  title: string;
  isbn: string;
  author: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
  status: string;
  cover: string;
  description?: string;
  source?: string;
  donatedBy?: string;
  coverUrl?: string; 
}

export interface Member {
  id: string | number;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  department: string;
  year: string;
  status: string;
  borrowedCount: number;
  returnedCount: number;
  joinedAt: string;
}

export interface BorrowRecord {
  id: string | number;
  bookTitle: string;
  memberName: string;
  memberId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
}

export interface Category {
  id: string | number;
  name: string;
  description: string;
  color: string;
  bookCount: number;
  activeBorrows: number;
}

export interface Author {
  id: string | number;
  name: string;
  nationality: string;
  booksCount: number;
  totalBorrows: number;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  activeMembers: number;
  overdueBooks: number;
}

export const CATEGORY_OPTIONS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Literature",
  "History",
  "Engineering",
];

export const CATEGORY_COLORS: Record<string, string> = {
  "Computer Science": "primary",
  Mathematics: "cyan",
  Physics: "emerald",
  Literature: "amber",
  History: "rose",
  Engineering: "violet",
};
