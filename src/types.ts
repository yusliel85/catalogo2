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
  moq?: number;
  images: string[];
  tags: string[];
  colors?: string[];
  createdAt?: number | string;
  views?: number;
  highlighted?: boolean;
}

export interface CatalogDesign {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  footerText?: string;
  layoutGrid: '1x1' | '2x2' | '3x3';
  bannerImage?: string;
  logoImage?: string;       // Tarea 3: Logo/Ícono editable
  subtitle?: string;        // Tarea 3: Subtítulo editable debajo del nombre
}

export interface MenuOptionStep {
  title: string;
  desc: string;
}

export interface MenuOptionItem {
  id: string;
  label: string;
  iconName: string;
  visible: boolean;
  color?: string;
  content?: string;
  steps?: MenuOptionStep[];
}

export interface CustomMessages {
  shareCatalog: string;
  shareProduct: string;
  consultProduct: string;
  contactWhatsapp?: string;
}

export interface CatalogProject {
  id: string;
  name: string;
  subtitle?: string;        // Tarea 3: Soporte también a nivel de proyecto
  createdAt: number;
  description: string;
  products: CatalogProduct[];
  categories: string[];
  tags: string[];
  contact: ContactInfo;
  design: CatalogDesign;
  favorites?: string[];
  menuOptions?: MenuOptionItem[];
  messages?: CustomMessages;
  customBlocks?: CustomBlock[];
}

export interface CustomBlock {
  id: string;
  title: string;
  content: string;
  badge?: string;
  image?: string;
  createdAt?: number | string;
}
