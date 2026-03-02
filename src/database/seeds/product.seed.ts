import 'reflect-metadata';
import {
  Product,
  ProductRoastLevel,
} from '../../modules/products/infraestructure/entities/Product.entity';
import { AppDataSource } from '../config/data-source';

const products: Partial<Product>[] = [
  {
    name: 'Etiopía Yirgacheffe – Grano Entero',
    description:
      'Café de origen único cultivado a 1900–2200 msnm en la región de Yirgacheffe, Etiopía. ' +
      'Tostión media-clara que resalta notas de jazmín, bergamota y arándano. ' +
      'Ideal para métodos de filtrado como V60, Chemex o cold brew.',
    price: 28000,
    stock: 50,
    imageUrl: '/static/products/etiopia-yirgacheffe.jpg',
    image: '/static/products/etiopia-yirgacheffe.jpg',
    roastLevel: ProductRoastLevel.LIGHT,
    origin: 'Yirgacheffe, Etiopía',
    weight: 340,
    notes: ['jazmin', 'bergamota', 'arandano'],
  },
  {
    name: 'Colombia Supremo – Grano Entero',
    description:
      'Selección de granos supremo de fincas cafeteras del Huila y Nariño, Colombia. ' +
      'Tostión media con perfil equilibrado de caramelo, chocolate negro y ciruela. ' +
      'Excelente para espresso, prensa francesa y aeropress. Bolsa de 500 g.',
    price: 45000,
    stock: 60,
    imageUrl: '/static/products/colombia-supremo.jpg',
    image: '/static/products/colombia-supremo.jpg',
    roastLevel: ProductRoastLevel.MEDIUM,
    origin: 'Huila y Nariño, Colombia',
    weight: 500,
    notes: ['caramelo', 'chocolate negro', 'ciruela'],
  },
  {
    name: 'Guatemala Antigua – Molido Medio',
    description:
      'Café guatemalteco de la región volcánica de Antigua, procesado en húmedo. ' +
      'Tostión media con notas de cacao, azúcar morena y suave acidez cítrica. ' +
      'Molido ideal para cafetera de goteo, moka y prensa francesa. Bolsa de 250 g.',
    price: 25000,
    stock: 45,
    imageUrl: '/static/products/guatemala-antigua-molido.jpg',
    image: '/static/products/guatemala-antigua-molido.jpg',
    roastLevel: ProductRoastLevel.MEDIUM,
    origin: 'Antigua, Guatemala',
    weight: 250,
    notes: ['cacao', 'azucar morena', 'citricos'],
  },
  {
    name: 'Brasil Santos – Blend Espresso',
    description:
      'Blend premium de granos santos brasileños de las regiones de Cerrado y Mogiana. ' +
      'Tostión media-oscura con cuerpo cremoso, notas de avellana, chocolate con leche y bajo amargor. ' +
      'Perfecto para espresso y cappuccino. Presentación de 1 kg para uso intensivo.',
    price: 75000,
    stock: 30,
    imageUrl: '/static/products/brasil-santos-blend.jpg',
    image: '/static/products/brasil-santos-blend.jpg',
    roastLevel: ProductRoastLevel.MEDIUM_DARK,
    origin: 'Cerrado y Mogiana, Brasil',
    weight: 1000,
    notes: ['avellana', 'chocolate con leche', 'cuerpo cremoso'],
  },
  {
    name: 'Kenia AA – Grano Entero',
    description:
      'Café de especialidad clasificación AA de las tierras altas de Kenia. ' +
      'Tostión clara que potencia su distintiva acidez brillante con notas de grosella negra, ' +
      'tomate y cítricos. Recomendado para V60 y Chemex. Bolsa de 250 g.',
    price: 32000,
    stock: 40,
    imageUrl: '/static/products/kenia-aa.jpg',
    image: '/static/products/kenia-aa.jpg',
    roastLevel: ProductRoastLevel.LIGHT,
    origin: 'Tierras altas de Kenia',
    weight: 250,
    notes: ['grosella negra', 'tomate', 'citricos'],
  },
  {
    name: 'Costa Rica Tarrazú – Molido Fino',
    description:
      'Café de altura de la región de Tarrazú, reconocida por producir algunos de los mejores ' +
      'cafés de Costa Rica. Tostión media con notas de durazno, miel y caramelo toffee. ' +
      'Molido fino ideal para espresso y moka. Bolsa de 250 g.',
    price: 30000,
    stock: 35,
    imageUrl: '/static/products/costa-rica-tarrazu.jpg',
    image: '/static/products/costa-rica-tarrazu.jpg',
    roastLevel: ProductRoastLevel.MEDIUM,
    origin: 'Tarrazú, Costa Rica',
    weight: 250,
    notes: ['durazno', 'miel', 'caramelo toffee'],
  },
  {
    name: 'Sumatra Mandheling – Grano Entero',
    description:
      'Café de proceso natural (dry process) de las tierras altas del lago Toba, Indonesia. ' +
      'Tostión oscura con cuerpo robusto, notas de tierra húmeda, cedro y chocolate amargo. ' +
      'Ideal para prensa francesa, espresso y cold brew largo. Bolsa de 500 g.',
    price: 52000,
    stock: 25,
    imageUrl: '/static/products/sumatra-mandheling.jpg',
    image: '/static/products/sumatra-mandheling.jpg',
    roastLevel: ProductRoastLevel.DARK,
    origin: 'Lago Toba, Indonesia',
    weight: 500,
    notes: ['tierra humeda', 'cedro', 'chocolate amargo'],
  },
  {
    name: 'Blend de la Casa – Molido',
    description:
      'Mezcla equilibrada desarrollada por nuestros baristas con granos de Colombia, Brasil y Honduras. ' +
      'Tostión media-oscura con perfil versátil: notas de chocolate con leche, nuez y panela. ' +
      'Funciona en todos los métodos de preparación. Bolsa de 500 g.',
    price: 38000,
    stock: 80,
    imageUrl: '/static/products/blend-casa.jpg',
    image: '/static/products/blend-casa.jpg',
    roastLevel: ProductRoastLevel.MEDIUM_DARK,
    origin: 'Colombia, Brasil y Honduras',
    weight: 500,
    notes: ['chocolate con leche', 'nuez', 'panela'],
  },
];

async function runSeed() {
  let initialized = false;

  try {
    await AppDataSource.initialize();
    initialized = true;
    console.log('Database connection established.');

    const productRepo = AppDataSource.getRepository(Product);
    const existing = await productRepo.count();
    if (existing > 0) {
      console.log(`Seed skipped: ${existing} products already exist.`);
      return;
    }

    await productRepo.save(products);
    console.log(`Seed complete: ${products.length} products inserted.`);
  } finally {
    if (initialized) {
      await AppDataSource.destroy();
    }
  }
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
