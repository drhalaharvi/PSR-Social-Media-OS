
import { PostDto } from './dto/PostDto';
import { CommentDto } from './dto/CommentDto';
import { ReviewDto } from './dto/ReviewDto';
import { InsightsDto } from './dto/InsightsDto';

/**
 * Defines the standard interface for all social media connectors.
 * Each method is a placeholder to be implemented by a specific provider adapter.
 */
export abstract class BaseConnector {
  protected provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  /**
   * Fetches analytics and insights data for a connected account.
   * @param since - The start date for the insights period.
   * @param until - The end date for the insights period.
   * @returns A promise that resolves to an InsightsDto object.
   */
  abstract fetchInsights(since: Date, until: Date): Promise<InsightsDto>;

  /**
   * Creates and publishes a new post to the social media platform.
   * @param post - The post data transfer object.
   * @returns A promise that resolves to the created post's ID.
   */
  abstract createPost(post: PostDto): Promise<{ id: string }>;

  /**
   * Lists comments for a specific post.
   * @param postId - The ID of the post to fetch comments for.
   * @returns A promise that resolves to an array of CommentDto objects.
   */
  abstract listComments(postId: string): Promise<CommentDto[]>;

  /**
   * Replies to a specific comment.
   * @param commentId - The ID of the comment to reply to.
   * @param text - The content of the reply.
   * @returns A promise that resolves to the created reply's ID.
   */
  abstract replyToComment(commentId: string, text: string): Promise<{ id: string }>;

  /**
   * Lists reviews for a business profile (e.g., Google Business Profile).
   * Default implementation returns an empty array for platforms that don't support reviews.
   * @returns A promise that resolves to an array of ReviewDto objects.
   */
  async listReviews(): Promise<ReviewDto[]> {
    console.warn(`[${this.provider}] listReviews is not supported.`);
    return [];
  }

  /**
   * Replies to a specific review.
   * Default implementation warns that the feature is not supported.
   * @param reviewId - The ID of the review to reply to.
   * @param text - The content of the reply.
   * @returns A promise that resolves when the reply is posted.
   */
  async replyToReview(reviewId: string, text: string): Promise<void> {
    console.warn(`[${this.provider}] replyToReview is not supported.`, { reviewId, text });
    return;
  }

  /**
   * A mock rate-limit handler. In a real implementation, this would involve
   * respecting API headers, implementing exponential backoff, etc.
   */
  protected async handleRateLimit(): Promise<void> {
    console.log(`[${this.provider}] Simulating rate limit handling...`);
    return new Promise(resolve => setTimeout(resolve, 250));
  }
}
