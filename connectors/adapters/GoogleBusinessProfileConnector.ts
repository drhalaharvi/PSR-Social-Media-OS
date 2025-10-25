
import { BaseConnector } from '../BaseConnector';
import { PostDto } from '../dto/PostDto';
import { ReviewDto } from '../dto/ReviewDto';
// GBP doesn't have traditional insights or comments in the same way
import { InsightsDto } from '../dto/InsightsDto';

// Helper function for UUID generation (browser-compatible)
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class GoogleBusinessProfileConnector extends BaseConnector {
  constructor() {
    super('Google Business Profile');
  }

  // Not a primary function for GBP
  async fetchInsights(since: Date, until: Date): Promise<InsightsDto> {
    console.log(`[${this.provider}] Fetching insights`);
     await this.handleRateLimit();
    return { impressions: 5000, reach: 4500, engagement: 300, followers: 0, period: { since, until } };
  }

  async createPost(post: PostDto): Promise<{ id: string; }> {
    console.log(`[${this.provider}] Creating post (update):`, post);
    await this.handleRateLimit();
    return { id: `gbp_post_${generateUUID()}` };
  }

  // Not applicable to GBP
  async listComments(postId: string): Promise<any[]> {
    console.warn(`[${this.provider}] listComments is not applicable.`);
    return [];
  }

  // Not applicable to GBP - Fixed to return valid ID
  async replyToComment(commentId: string, text: string): Promise<{ id: string; }> {
    console.warn(`[${this.provider}] replyToComment is not applicable.`);
    return { id: `gbp_not_applicable_${generateUUID()}` };
  }

  async listReviews(): Promise<ReviewDto[]> {
    console.log(`[${this.provider}] Listing reviews.`);
    await this.handleRateLimit();
    return [{
      id: `gbp_review_${generateUUID()}`,
      authorName: 'Jane Smith',
      rating: 5,
      text: 'Excellent service and friendly staff!',
      timestamp: new Date(),
    }];
  }

  async replyToReview(reviewId: string, text: string): Promise<void> {
    console.log(`[${this.provider}] Replying to review ${reviewId} with: "${text}"`);
    await this.handleRateLimit();
  }
}
