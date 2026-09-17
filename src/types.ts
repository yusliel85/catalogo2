export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
  website?: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
  categories?: string[];
  description: string;
  dimensions?: string;
  material?: string;
  moq?: number; // Minimum Order Quantity
  images: string[]; // Base64 or URLs
  image?: string; // Legacy fallback single image
  tags?: string[];
  colors?: string[];
  primaryImageIndex?: number;
  viewsCount?: number;
  createdAt?: number;
}

export interface CatalogDesign {
  primaryColor: string; // Hex
  secondaryColor: string; // Hex
  fontFamily: 'serif' | 'sans' | 'mono';
  bannerImage?: string; // Base64 header banner
  logoImage?: string; // Base64 logo
  footerText?: string;
  layoutGrid: '2x2' | '3x3' | 'list';
  shareUrl?: string;
  bannerSubtitle?: string; // Subtítulo del banner de cabecera
  customBlocks?: any[];
}

export interface MenuOptionItem {
  id: string; // 'favorites' | 'share' | 'whatsapp' | 'company' | 'about' | 'how_it_works'
  label: string;
  iconName: string;
  visible: boolean;
  content?: string; // For customized content (e.g., custom sharing text, customized about description)
  steps?: { title: string; desc: string }[]; // Specifically for 'how_it_works' steps
}

export interface CustomMessages {
  shareCatalog?: string;
  shareProduct?: string;
  consultProduct?: string;
}

export interface CatalogProject {
  id: string;
  name: string;
  createdAt: number;
  description?: string;
  products: CatalogProduct[];
  categories: string[];
  tags?: string[];
  contact: ContactInfo;
  design: CatalogDesign;
  favorites: string[]; // List of product IDs favorited for the current presentation
  menuOptions?: MenuOptionItem[];
  messages?: CustomMessages;
}

export interface QuoteRequest {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  notes?: string;
}

export interface CartQuote {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  items: QuoteRequest[];
  date: number;
  status: 'pending' | 'responded';
}
