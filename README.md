This project contains MARCH's voting dashboard. It uses Next.js with Prisma as the database interface layer. 

### Getting Started 

With postgres running, add a `DATABASE_URL` environment variable to your `.env` file: 

```
# .env 
DATABASE_URL=postgres://postgres@127.0.0.1/march
```

Now, we can install dependencies, generate any necessary table definitions in the database, and seed the database with test data: 

```
bun install
bun run prisma generate
bun run prisma db seed 
bun run dev
```

Now the app should be running on `http://localhost:3000`. 

