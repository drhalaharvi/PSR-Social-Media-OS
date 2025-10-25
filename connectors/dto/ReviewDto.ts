
export interface ReviewDto {
  id: string;
  authorName: string;
  rating: number; // e.g., 1 to 5
  text: string;
  timestamp: Date;
}
