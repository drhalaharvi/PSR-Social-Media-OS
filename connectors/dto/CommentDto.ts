
export interface CommentDto {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    profilePictureUrl?: string;
  };
  text: string;
  timestamp: Date;
  likes: number;
}
