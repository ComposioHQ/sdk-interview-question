export type Candidate = {
  id: string;
  email: string;
  token: string;
  status: 'invited' | 'downloaded' | 'completed';
  created_at: string;
  downloaded_at?: string | null;
  download_count: number;
};

export type Release = {
  id: string;
  tag_name: string;
  name: string;
  download_url: string;
  created_at: string;
  zip_asset_url: string;
};