export interface Artwork {
  id: number;
  title: string;
  description?: string;
  image_path: string;
  order_number: number;
  created_at?: string;
  updated_at?: string;
  image_url: string;
}


export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published';
  published_at?: string;
  cover_image?: string;
  cover_image_url?: string;
  is_external?: boolean;
  external_url?: string;
  title_en?: string;
  content_en?: string;
  read_time?: number;
  created_at: string;
  updated_at?: string;
}


export interface Certificate {
  id: number;
  name: string;
  title?: string;
  issuer: string;
  issue_date?: string;
  start_date?: string;
  end_date?: string;
  expiration_date?: string;
  has_no_expiration?: boolean;
  credential_id?: string;
  credential_url?: string;
  credential_link?: string;
  image_path?: string;
  is_featured: boolean;
  order_number: number;
  type?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
}


export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at?: string;
  updated_at?: string;
}


export interface Experience {
  id: number;
  title: string;
  role?: string;
  company_name: string;
  location?: string;
  employment_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  order_number: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}


export interface Photo {
  id: number;
  title: string;
  description?: string;
  image_path: string;
  order_number: number;
  created_at?: string;
  updated_at?: string;
  image_url: string;
}


export interface SocialMedia {
  id: number;
  platform_name: string;
  url: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileAbout {
  id: number;
  name: string;
  job_title: string;
  about_description: string;
  is_available_for_work: boolean;
  photo_path?: string;
  secondary_image?: string;
  cv_path?: string;
  hidden_skill_categories?: string[];
  default_skill_category?: string;
  skill_categories_order?: string[];
  skill_categories_info?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
  photo_url?: string;
  secondary_image_url?: string;
  cv_url?: string;
}

export interface Profile {
  about: ProfileAbout;
  social_media: SocialMedia[];
}


export interface ProjectImage {
  id: number;
  project_id: number;
  image_path: string;
  order_number: number;
  created_at?: string;
  updated_at?: string;
  image_url: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomTechStack {
  name: string;
  icon_url: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  client_name?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  url?: string;
  github_url?: string;
  repository_link?: string;
  live_demo_link?: string;
  technologies?: string[];
  is_featured: boolean;
  order_number: number;
  category_id?: number;
  thumbnail_path?: string;
  thumbnail_url?: string;
  type?: string;
  status?: string;
  team_size?: number;
  custom_tech_stacks?: CustomTechStack[];
  skills?: any[];
  created_at?: string;
  updated_at?: string;
  
  category?: ProjectCategory;
  images?: ProjectImage[];
}


export interface Skill {
  id: number;
  name: string;
  identifier: string;
  category: string | null;
  order_number: number;
  note: string | null;
  is_active_on_home: boolean | number;
  created_at?: string;
  updated_at?: string;
}


export interface VisitorStat {
  id: number;
  device_id: string;
  ip_address?: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  visit_count: number;
  last_visit: string;
  created_at?: string;
  updated_at?: string;
}



// --- PAYLOAD TYPES ---
export interface ReorderPayload {
  ordered_ids: (string | number)[];
}

export interface SkillPayload {
  name: string;
  identifier: string;
  category?: string;
  order_number?: number;
  note?: string;
  is_active_on_home?: boolean | number;
}

export interface BulkDeletePayload {
  ids: (string | number)[];
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface VisitorPayload {
  device_id: string;
  ip_address?: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
}

export interface AdminLoginPayload {
  email: string;
  password?: string;
}

export interface AdminLoginResponse {
  token: string;
  user?: any;
}
