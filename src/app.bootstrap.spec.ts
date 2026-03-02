import { MODULE_METADATA } from '@nestjs/common/constants';
import 'reflect-metadata';

jest.mock('@nestjs/core', () => ({
  __mockUseGlobalPipes: jest.fn(),
  __mockListen: jest.fn().mockResolvedValue(undefined),
  __mockApp: {
    enableCors: jest.fn(),
    useGlobalPipes: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  },
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => {
  class MockDocumentBuilder {
    setTitle() {
      return this;
    }

    setDescription() {
      return this;
    }

    setVersion() {
      return this;
    }

    build() {
      return { openapi: '3.0.0' };
    }
  }

  return {
    DocumentBuilder: MockDocumentBuilder,
    __mockCreateDocument: jest.fn().mockReturnValue({ openapi: '3.0.0' }),
    __mockSetup: jest.fn(),
    SwaggerModule: {
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
    ApiParam: () => () => undefined,
    ApiProperty: () => () => undefined,
    ApiBody: () => () => undefined,
    ApiOperation: () => () => undefined,
    ApiBadRequestResponse: () => () => undefined,
    ApiConflictResponse: () => () => undefined,
    ApiCreatedResponse: () => () => undefined,
    ApiNotFoundResponse: () => () => undefined,
    ApiOkResponse: () => () => undefined,
    ApiTags: () => () => undefined,
  };
});

type NestCoreMock = {
  NestFactory: {
    create: jest.Mock;
  };
  __mockUseGlobalPipes: jest.Mock;
  __mockListen: jest.Mock;
  __mockApp: {
    enableCors: jest.Mock;
    useGlobalPipes: jest.Mock;
    listen: jest.Mock;
  };
};

type SwaggerMock = {
  SwaggerModule: {
    createDocument: jest.Mock;
    setup: jest.Mock;
  };
  __mockCreateDocument: jest.Mock;
  __mockSetup: jest.Mock;
};

const nestCoreMock = jest.requireMock('@nestjs/core') as NestCoreMock;
const swaggerMock = jest.requireMock('@nestjs/swagger') as SwaggerMock;

const mockUseGlobalPipes = nestCoreMock.__mockUseGlobalPipes;
const mockListen = nestCoreMock.__mockListen;
const mockApp = nestCoreMock.__mockApp;
const mockCreate = nestCoreMock.NestFactory.create;
const mockCreateDocument = swaggerMock.__mockCreateDocument;
const mockSetup = swaggerMock.__mockSetup;

mockApp.useGlobalPipes = mockUseGlobalPipes;
mockApp.listen = mockListen;
mockCreate.mockResolvedValue(mockApp);
swaggerMock.SwaggerModule.createDocument = mockCreateDocument;
swaggerMock.SwaggerModule.setup = mockSetup;

describe('Bootstrap and structural coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('bootstraps the Nest application', async () => {
    process.env.PORT = '4000';

    jest.isolateModules(() => {
      require('./main');
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUseGlobalPipes).toHaveBeenCalledTimes(1);
    expect(mockCreateDocument).toHaveBeenCalledWith(mockApp, {
      openapi: '3.0.0',
    });
    expect(mockSetup).toHaveBeenCalledWith('docs', mockApp, {
      openapi: '3.0.0',
    });
    expect(mockListen).toHaveBeenCalledWith('4000');
  });

  it('exposes module metadata', () => {
    const { CustomersModule } =
      require('./modules/customers/customers.module') as typeof import('./modules/customers/customers.module');
    const { DeliveriesModule } =
      require('./modules/deliveries/deliveries.module') as typeof import('./modules/deliveries/deliveries.module');
    const { StockModule } =
      require('./modules/products/stock.module') as typeof import('./modules/products/stock.module');
    const { TransactionsModule } =
      require('./modules/transactions/transactions.module') as typeof import('./modules/transactions/transactions.module');
    const { AppModule } =
      require('./app.module') as typeof import('./app.module');
    const stockImports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      StockModule,
    );
    const stockProviders = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      StockModule,
    );
    const customerExports = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      CustomersModule,
    );
    const deliveryExports = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      DeliveriesModule,
    );
    const transactionControllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      TransactionsModule,
    );
    const appImports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule);

    expect(stockImports).toHaveLength(1);
    expect(stockProviders).toHaveLength(3);
    expect(customerExports).toHaveLength(1);
    expect(deliveryExports).toHaveLength(1);
    expect(transactionControllers).toHaveLength(1);
    expect(appImports).toHaveLength(6);
  });

  it('instantiates entities and exposes enum values', () => {
    const { Customer } =
      require('./modules/customers/infraestructure/entities/Customer.entity') as typeof import('./modules/customers/infraestructure/entities/Customer.entity');
    const { Delivery } =
      require('./modules/deliveries/infraestructure/entities/Delivery.entity') as typeof import('./modules/deliveries/infraestructure/entities/Delivery.entity');
    const { Product } =
      require('./modules/products/infraestructure/entities/Product.entity') as typeof import('./modules/products/infraestructure/entities/Product.entity');
    const { Transaction, TransactionStatus } =
      require('./modules/transactions/infraestructure/entities/Transaction.entity') as typeof import('./modules/transactions/infraestructure/entities/Transaction.entity');
    const product = new Product();
    product.id = 'prod-1';
    product.name = 'Cafe';
    product.description = 'Cafe de origen';
    product.price = 250000;
    product.stock = 12;
    product.imageUrl = 'https://cdn.example.com/cafe.jpg';
    product.createdAt = new Date();

    const customer = new Customer();
    customer.id = 'cust-1';
    customer.fullName = 'Juan Perez';
    customer.email = 'juan@example.com';
    customer.phone = '+573001234567';
    customer.createdAt = new Date();

    const transaction = new Transaction();
    transaction.id = 'tx-1';
    transaction.status = TransactionStatus.PENDING;
    transaction.amount = 250000;
    transaction.baseFee = 0;
    transaction.deliveryFee = 0;
    transaction.providerTransactionId = null;
    transaction.product = product;
    transaction.customer = customer;
    transaction.createdAt = new Date();

    const delivery = new Delivery();
    delivery.id = 'del-1';
    delivery.address = 'Calle 1';
    delivery.city = 'Bogota';
    delivery.region = 'Cundinamarca';
    delivery.transaction = transaction;
    transaction.delivery = delivery;

    expect(TransactionStatus.APPROVED).toBe('APPROVED');
    expect(TransactionStatus.FAILED).toBe('FAILED');
    expect(transaction.delivery?.transaction.customer.email).toBe(
      'juan@example.com',
    );
  });

  it('exposes the configured data source options', () => {
    const { AppDataSource } =
      require('./database/config/data-source') as typeof import('./database/config/data-source');

    expect(AppDataSource.options.type).toBe('postgres');
    expect(AppDataSource.options.host).toBeDefined();
    expect(AppDataSource.options.database).toBeDefined();
    expect(AppDataSource.options.synchronize).toBe(false);
  });

  it('runs migration up and down queries in the expected order', async () => {
    const { InitialSchema1740787200000 } =
      require('./database/migrations/1740787200000-InitialSchema') as typeof import('./database/migrations/1740787200000-InitialSchema');
    const queryRunner = {
      query: jest.fn().mockResolvedValue(undefined),
    };
    const migration = new InitialSchema1740787200000();

    await migration.up(queryRunner as never);
    await migration.down(queryRunner as never);

    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TYPE transaction_status AS ENUM'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE products'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE customers'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE transactions'),
    );
    expect(queryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE deliveries'),
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      8,
      'DROP TABLE IF EXISTS deliveries',
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      13,
      'DROP TYPE IF EXISTS transaction_status',
    );
  });
});
