
import { BaseConnector } from '../BaseConnector';
import { PostDto } from '../dto/PostDto';
import { ReviewDto } from '../dto/ReviewDto';
// GBP doesn't have traditional insights or comments in the same way
import { InsightsDto } from '../dto/InsightsDto';

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
    return { id: `gbp_post_${crypto.randomUUID()}` };
  }

  // Not applicable to GBP
  async listComments(postId: string): Promise<any[]> {
    console.warn(`[${this.provider}] listComments is not applicable.`);
    return [];
  }

  // Not applicable to GBP
  async replyToComment(commentId: string, text: string): Promise<{ id: string; }> {
    console.warn(`[${this.provider}] replyToComment is not applicable.`);
    return { id: '' };
  }

  async listReviews(): Promise<ReviewDto[]> {
    console.log(`[${this.provider}] Listing reviews.`);
    await this.handleRateLimit();
    return [{
      id: `gbp_review_${crypto.randomUUID()}`,
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
