# Piggy Pot

A comprehensive DeFi liquidity management and pool analysis platform that provides real-time metrics, risk assessment, and investment recommendations for Uniswap V3 pools.

## 🚀 Features

- **Pool Analysis**: Real-time analysis of Uniswap V3 pools with comprehensive metrics
- **Risk Assessment**: Impermanent loss calculation, token volatility analysis, and correlation assessment
- **Token Quality Evaluation**: Multi-factor token quality scoring and trustworthiness assessment
- **APY Volatility Tracking**: Historical APY analysis and stability scoring
- **Pool Growth Trends**: TVL growth analysis and performance tracking
- **Database Storage**: PostgreSQL-based data persistence with JSONB optimization
- **Automated Updates**: Daily cron jobs for pool data updates
- **REST API**: Comprehensive API endpoints for data retrieval

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database](#database)
- [Cron Jobs](#cron-jobs)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- TypeScript
- bun

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd piggy-pot
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**

   ```bash
   # Run database migrations
   bun run db:migrate

   # Seed initial data (optional)
   bun run db:seed
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   ```

## 📁 Project Structure

```
piggy-pot/
├── src/
│   ├── app/                   # Next.js app router
│   │   └── api/               # API endpoints
│   ├── config/                # Configuration files
│   ├── libs/                  # Core libraries
│   │   ├── database/          # Database models and migrations
│   │   ├── metrics/           # Metrics calculation modules
│   │   ├── subgraph/          # Subgraph data fetching
│   │   └── 1inch/             # 1inch API integration
│   ├── processors/            # Business logic processors
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   └── cron/                  # Cron job scripts
├── docs/                      # Documentation
└── scripts/                   # Build and deployment scripts
```

## 🗄️ Database

The application uses PostgreSQL with JSONB fields for flexible data storage and optimal performance for DeFi analytics.

**Key Features:**

- **JSONB Storage**: Flexible schema for complex pool data
- **Optimized Indexes**: GIN indexes for fast JSONB queries
- **Comprehensive Models**: Full CRUD operations for all entities
- **Migration System**: Version-controlled database schema

**Documentation:**

- [Database Schema & Models](docs/DATABASE.md) - Complete database documentation
- [Database Models README](src/libs/database/models/README.md) - Detailed model documentation

## 🔗 1inch API Integration

The application leverages the 1inch API to enhance token quality assessment and price analysis. This integration is crucial for providing accurate risk assessments and investment recommendations.

**Key Features:**

- **Token Quality Assessment**: Multi-factor evaluation system
- **Real-time Price Data**: Live price feeds for calculations
- **Historical Analysis**: Volatility and trend analysis
- **Professional Integration**: Proper authentication and error handling

**Documentation:**

- [1inch API Integration](docs/1INCH_INTEGRATION.md) - Complete API integration details

## ⏰ Cron Jobs

### Pool Data Update Job

The application includes an automated cron job that runs daily to fetch and update pool data with the latest metrics.

#### Job Details

- **File**: `src/cron/fetchAndUpdatePools.ts`
- **Frequency**: Daily (configurable)
- **Purpose**: Fetch pools, calculate metrics, and update PostgreSQL database

#### What It Does

1. **Fetches Pool Data**: Retrieves Uniswap V3 pools from subgraph
2. **Calculates Metrics**:
   - Token quality assessment
   - Impermanent loss analysis
   - Token correlation analysis
   - Price volatility calculation
   - Pool growth trends
   - APY volatility analysis
3. **Updates Database**: Upserts pool data with latest metrics
4. **Error Handling**: Retry logic with exponential backoff
5. **Logging**: Comprehensive logging for monitoring

#### Usage

```typescript
import { main } from "@/cron/fetchAndUpdatePools";

// Run the cron job
const result = await main();
console.log(`Updated ${result.updatedCount} pools`);
```

#### Manual Execution

```bash
# Run the cron job manually
npm run cron:update-pools

# Or using the script directly
npx tsx src/cron/fetchAndUpdatePools.ts
```

#### Configuration

The cron job can be configured via environment variables:

```env
# Cron job settings
CRON_UPDATE_INTERVAL=86400000  # 24 hours in milliseconds
CRON_MAX_RETRIES=3
CRON_RETRY_DELAY=5000          # 5 seconds
```

#### Monitoring

The job provides detailed logging:

```bash
[INFO] Starting pool fetch and update cron job...
[INFO] Found 20 pools with metrics to update in database
[INFO] Successfully upserted pool 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640
[INFO] Database update completed. Success: 20, Errors: 0
[INFO] Cron job completed successfully. Updated 20 pools.
```

## 🔌 API Endpoints

The application provides comprehensive REST API endpoints for all functionality.

**Key Features:**

- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Responses**: Consistent response format
- **Authentication**: Bearer token authentication
- **Rate Limiting**: Protection against abuse
- **WebSocket Support**: Real-time updates

**Documentation:**

- [API Endpoints](docs/API.md) - Complete API documentation

## 🧪 Development

WIP

### Running Tests

```bash
npm run test
npm run test:watch
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Database Operations

```bash
# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback

# Seed database
npm run db:seed

# Test database connection
npm run db:test
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/piggy_pot

# Chain Configuration
CHAIN_ID=1 # what chain the app will work on

# UUID based on which all other UUIDs will be generated
UUID_NAMESPACE=

# SUBGRAPH
SUBGRAPH_KEY=
UNISWAP_V3_SUBGRAPH_ID=5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV # Uniswap V3 pools subgraph on ETH

# 1INCH
ONE_INCH_API_KEY=

# OpenAI
OPENAI_API_KEY=
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the [documentation](docs/)
- Review the [database documentation](src/libs/database/models/README.md)

---

**Piggy Pot** - Smart DeFi Liquidity Management
