
# BiteSpeed Intern Task

Backend URL (deployed): https://bitespeedinterntask.onrender.com (Might take a few seconds to send the first request at it restarts the server on render free version.)

## Tech Stack Used
1. NodeJS
2. Express
3. PostgresSQL
4. Prisma (ORM)

## API Endpoints
1. /identify (Functions as mentioned in the task)
2. /create (Used to create new entries in the DB for testing purpose)

## How to run (Locally)

To run this project follow these steps:

1. Clone the Repository

```bash
  git clone https://github.com/Blaster1111/biteSpeedInternTask.git
  cd bitespeed_intern_task
```

2. Install Backend Dependencies

```bash
  npm install
``` 

3. Setup .env Environment Variables

`DATABASE_URL=postgresql://<username>:<password>@<host>/<database>`

4. Apply DB Migrations (Using Prisma)

`npx prisma migrate dev --name init`

5. Run the Backend

```bash
  npm run dev
``` 
 
Now the server will start working on localhost:3000 you can open that on browser and see.


