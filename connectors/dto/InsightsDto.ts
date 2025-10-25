
export interface InsightsDto {
  impressions: number;
  reach: number;
  engagement: number;
  followers: number;
  period: {
    since: Date;
    until: Date;
  };
}
