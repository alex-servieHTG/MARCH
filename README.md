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

## Create Projects in DB

make sure you have the connection string in the env vars as described above. Also make sure that you have the .csv file containing all the project information.

```
npx ts-node prisma/migrate.ts
```

To connect the images that are stored on Imagekit, use the main() function

```
npx ts-node prisma/pullImages.js
```
