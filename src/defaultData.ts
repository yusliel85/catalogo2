import { CatalogProject, MenuOptionItem } from './types';
import { DEFAULT_PRODUCT_IMAGES } from './defaultImages';

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-5',
    name: 'Cojín de Lino Lavado Boho',
    sku: '繊維-CUS88',
    price: 15.00,
    currency: 'USD',
    category: 'Telas y Textiles',
    description: 'Funda de cojín confeccionada en lino 100% lavado belga con flecos rústicos deshilachados en los bordes. Tacto ultra suave, transpirable y resistente. Cremallera invisible para fácil lavado.',
    dimensions: '45 cm x 45 cm',
    material: 'Lino Lavado',
    moq: 30,
    images: [DEFAULT_PRODUCT_IMAGES.cushion],
    tags: ['Suave', 'Orgánico', 'Textiles', 'Boho-chic'],
    colors: ['Lino Natural', 'Mostaza', 'Terracota', 'Salvia'],
    viewsCount: 78,
    createdAt: 1700000005000
  },
  {
    id: 'prod-4',
    name: 'Mesa de Centro Rústica de Roble',
    sku: '家具-TAB22',
    price: 195.00,
    currency: 'USD',
    category: 'Muebles de Interior',
    description: 'Mesa de centro construida con madera recuperada de roble europeo certificado. Conserva las vetas, texturas y nudos rústicos naturales protegidos con barniz ecológico mate de base acuosa. Patas de horquilla de hierro industrial.',
    dimensions: '110 cm x 60 cm x 45 cm',
    material: 'Roble Recuperado y Hierro',
    moq: 5,
    images: [DEFAULT_PRODUCT_IMAGES.table],
    tags: ['Madera Real', 'Industrial', 'Ecológico', 'Duradero'],
    colors: ['Roble Natural', 'Roble Ahumado'],
    viewsCount: 56,
    createdAt: 1700000004000
  },
  {
    id: 'prod-3',
    name: 'Macetero Geométrico Cerámico',
    sku: '庭-POT12',
    price: 18.00,
    currency: 'USD',
    category: 'Decoración y Jardín',
    description: 'Maceta de cerámica esmaltada de alta cocción con base de madera de bambú natural. Diseño contemporáneo y minimalista con detalles en relieve hexagonal y orificio de drenaje inteligente.',
    dimensions: 'Diámetro 18 cm, Alto 20 cm',
    material: 'Cerámica y Madera de Bambú',
    moq: 50,
    images: [DEFAULT_PRODUCT_IMAGES.pot],
    tags: ['Minimalista', 'Geométrico', 'Elegante', 'Premium'],
    colors: ['Blanco Mate', 'Gris Arena', 'Verde Oliva'],
    viewsCount: 215,
    createdAt: 1700000003000
  },
  {
    id: 'prod-2',
    name: 'Lámpara de Techo de Mimbre',
    sku: '照明-LMP05',
    price: 45.50,
    currency: 'USD',
    category: 'Iluminación',
    description: 'Hermosa lámpara de techo tejida de fibra de ratán / mimbre 100% natural sostenible. Proporciona una luz ambiental cálida con sombras orgánicas proyectadas en las paredes. Apto para bombillas LED E27.',
    dimensions: 'Diámetro 40 cm, Alto 30 cm',
    material: 'Mimbre y Cable Textil',
    moq: 25,
    images: [DEFAULT_PRODUCT_IMAGES.lamp],
    tags: ['Sostenible', 'Naturaleza', 'Tejido', 'Boho'],
    colors: ['Marrón Natural', 'Negro Mate'],
    viewsCount: 89,
    createdAt: 1700000002000
  },
  {
    id: 'prod-1',
    name: 'Silla Acapulco Clásica',
    sku: '家具-CHR01',
    price: 89.99,
    currency: 'USD',
    category: 'Muebles de Exterior',
    description: 'La icónica silla mexicana tejida a mano con hilos de PVC flexible de alta calidad y marco de acero con recubrimiento de polvo negro. Resistente a rayos UV, ideal para jardín, balcón o espacios interiores retro.',
    dimensions: '75 cm x 85 cm x 90 cm',
    material: 'PVC y Acero',
    moq: 10,
    images: [DEFAULT_PRODUCT_IMAGES.chair],
    tags: ['Icónico', 'Tejido', 'Retro', 'Exterior'],
    colors: ['Azul Turquesa', 'Amarillo', 'Negro', 'Coral'],
    viewsCount: 142,
    createdAt: 1700000001000
  }
];

export const DEFAULT_MENU_OPTIONS: MenuOptionItem[] = [
  {
    id: 'favorites',
    label: 'Productos Favoritos',
    iconName: 'Heart',
    visible: true
  },
  {
    id: 'share',
    label: 'Compartir catálogo',
    iconName: 'Share2',
    visible: true
  },
  {
    id: 'whatsapp',
    label: 'Contactar por WhatsApp',
    iconName: 'Phone',
    visible: true,
    content: 'Hola, me interesa ver más detalles de tu catálogo.'
  },
  {
    id: 'company',
    label: 'Información de la empresa',
    iconName: 'Building',
    visible: true
  },
  {
    id: 'about',
    label: 'Información del Catálogo',
    iconName: 'Info',
    visible: true
  },
  {
    id: 'how_it_works',
    label: '¿Cómo funciona?',
    iconName: 'HelpCircle',
    visible: true,
    steps: [
      { title: 'Explora sin compromiso', desc: 'Este es un catálogo 100% de exhibición.' },
      { title: 'Contacta si te gusta', desc: '¿Viste algo que te encantó? Puedes contactarnos y pedir más detalles.' },
      { title: 'Encuentra lo que buscas', desc: 'Usa el buscador por nombre, categoría o material para ir directo al grano.' },
      { title: 'Guarda tus favoritos', desc: 'Haz clic en el corazón ❤️ para marcar tus piezas preferidas y encontrarlas fácilmente después.' },
      { title: 'Comparte con quien quieras', desc: '¿Tienes un amigo al que le encantaría esto? Compártelo directamente por WhatsApp con un solo toque.' }
    ]
  }
];

export const DEFAULT_CUSTOM_MESSAGES = {
  shareCatalog: '¡Hola! Te invito a explorar nuestro catálogo digital interactivo *{nombre_catalogo}*:\n\n🌐 *Ver Catálogo:* {url}',
  shareProduct: '¡Hola! Te comparto este producto de nuestro catálogo:\n\n*{nombre}* ({categoria})\n{descripcion}\n{precio}\n{imagen}\n\n🌐 *Ver en Catálogo:* {url}',
  consultProduct: 'Hola, estoy interesado en consultar sobre el siguiente producto de su catálogo:\n\n*Producto:* {nombre}\n*Categoría:* {categoria}\n{precio}\n{imagen}\n\n🌐 *Enlace:* {url}\n\n¿Podría brindarme más detalles?'
};

export const DEFAULT_PROJECTS: CatalogProject[] = [
  {
    id: 'proj-1',
    name: 'Muestra de Exportación - Primavera',
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
    description: 'Catálogo de exhibición de artículos variados en madera y corte láser. Fotos reales. Pregunta sin compromiso. El detalle perfecto, natural y moderno.\n\nHay regalos que marcan para siempre. Deja tu Huella.',
    products: INITIAL_PRODUCTS,
    categories: ['TODOS', 'Muebles de Exterior', 'Muebles de Interior', 'Iluminación', 'Decoración y Jardín', 'Telas y Textiles'],
    tags: ['Icónico', 'Tejido', 'Retro', 'Exterior', 'Sostenible', 'Naturaleza', 'Boho', 'Minimalista', 'Geométrico', 'Elegante', 'Premium', 'Madera Real', 'Industrial', 'Ecológico', 'Duradero', 'Suave', 'Orgánico', 'Textiles', 'Boho-chic'],
    contact: {
      name: 'Sofía Valenzuela',
      email: 'export@artesaniasglobales.com',
      phone: '+52 55 1234 5678',
      company: 'Artesanías Globales S.A.',
      address: 'Paseo de la Reforma 450, Ciudad de México, México',
      website: 'www.artesaniasglobales.com'
    },
    design: {
      primaryColor: '#8c6d58', // Earth warm tone
      secondaryColor: '#2b3a32', // Deep forest olive
      fontFamily: 'serif',
      footerText: '© 2026 Artesanías Globales S.A. | Reservados todos los derechos.',
      layoutGrid: '2x2'
    },
    favorites: ['prod-1', 'prod-2', 'prod-3'],
    menuOptions: DEFAULT_MENU_OPTIONS,
    messages: DEFAULT_CUSTOM_MESSAGES
  }
];
