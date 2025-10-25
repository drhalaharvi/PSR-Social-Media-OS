
import { BaseConnector } from '../BaseConnector';
import { CommentDto } from '../dto/CommentDto';
import { InsightsDto } from '../dto/InsightsDto';
import { PostDto } from '../dto/PostDto';

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

export class XConnector extends BaseConnector {
  constructor() {
    super('X (Twitter)');
  }

  async fetchInsights(since: Date, until: Date): Promise<InsightsDto> {
    console.log(`[${this.provider}] Fetching insights`);
    await this.handleRateLimit();
    return { impressions: 50000, reach: 40000, engagement: 2000, followers: 5000, period: { since, until } };
  }

  async createPost(post: PostDto): Promise<{ id: string; }> {
    console.log(`[${this.provider}] Creating post (tweet):`, post);
    await this.handleRateLimit();
    return { id: `x_post_${generateUUID()}` };
  }

  async listComments(postId: string): Promise<CommentDto[]> {
    console.log(`[${this.provider}] Listing comments (replies) for post ${postId}`);
    await this.handleRateLimit();
    return [{
      id: `x_comment_${generateUUID()}`,
      postId,
      author: { id: 'user101', name: 'X User' },
      text: 'Interesting!',
      timestamp: new Date(),
      likes: 100,
    }];
  }

  async replyToComment(commentId: string, text: string): Promise<{ id: string; }> {
    console.log(`[${this.provider}] Replying to comment (tweet) ${commentId} with: "${text}"`);
    await this.handleRateLimit();
    return { id: `x_reply_${generateUUID()}` };
  }
}
