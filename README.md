# OrangeDot

## Description

OrangeDot is a remote job board web application focused on full-time roles across the United States. It allows users to browse job listings pulled live from an external jobs API, sign up for a newsletter to receive job opportunities directly to their inbox, and stay informed about upcoming US public holidays. It also displays daily inspirational quotes to encourage job search motivation.

The application is built using Node.js and Express on the backend, a Supabase PostgreSQL database for storing user/subscriber information, and HTML, CSS, and JavaScript on the frontend.

## Target Browsers

OrangeDot is designed for desktop browsers and has been tested on the following:

- Google Chrome
- Firefox
- Safari on macOS

---

# Developer Manual

## Audience

This document is intended for future developers taking over the OrangeDot program. It assumes familiarity with web application development, REST APIs, and the command line, but no prior knowledge of the program design.

---

## 1. Installing the Application and Dependencies

### Prerequisites

Ensure the following are installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Supabase](https://supabase.com/) account with a project set up

### Clone the Repository

```bash
git clone https://github.com/vfan1-ui/job-board.git
cd job-board
```

### Install Backend Dependencies

```bash
cd supabase
npm install
```

This installs all dependencies listed in `package.json`, including:

- `express` — web server framework
- `body-parser` — parses incoming JSON request bodies
- `@supabase/supabase-js` — Supabase client for database access
- `dotenv` — loads environment variables from `.env`
- `cors` — enables cross-origin requests from the frontend
- `node-html-parser` — parses the RSS feed from the Jobicy API

### Configure Environment Variables

Create a `.env` file inside the `supabase` folder with the following:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_role_key
```

You can find these values in your Supabase dashboard under **Settings → API**.

### Supabase Database Setup

Your Supabase `users` table should have the following columns:

- id
- created_at
- first-name
- last-name
- user_email
- state

---

## 2. Running the Application on a Server

### Local Development

Start the Express backend from the `supabase` folder:

```bash
cd supabase
node index.js
```

You should see:

```
App is available through port: 3000
```

### Production Deployment (Vercel)

The backend is deployed on Vercel. The `vercel.json` in the project root configures the entry point:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "supabase/index.js",
      "use": "@vercel/node",
      "config": { "includeFiles": ["supabase/**"] }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "supabase/index.js" }
  ]
}
```

Before deploying, add your environment variables in the Vercel dashboard under **Settings → Environment Variables**:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
```

Then deploy with:

```bash
vercel --prod
```

Once deployed, update the `fetch` base URL in `client-side-functions.js` from `http://localhost:3000` to your Vercel deployment URL.

---

## 3. Running Tests

There are no automated tests written for this application at this time. See the Future Development section for plans to add testing.

---

## 4. Server API Endpoints

### `GET /users`
Retrieves all newsletter subscribers from the Supabase `users` table.

- **Response:** `200 OK` — array of user objects
- **Error:** `500` — Supabase query failed

---

### `POST /user`
Creates a new newsletter subscriber and saves them to the Supabase `users` table.

- **Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "state": "NY"
}
```
- **Validation:**
  - All four fields are required
  - `email` must match a valid email format
  - `state` must be a valid two-letter US state abbreviation
- **Response:** `201 Created` — the inserted user record
- **Errors:** `400` — missing or invalid fields, `500` — database error

---

### `GET /jobs`
Fetches and parses the live job listings RSS feed from the Jobicy API and returns them as JSON.

- **External Source:** `https://jobicy.com/feed/job_feed?job_categories=supporting&job_types=full-time&search_region=usa`
- **Response:** `200 OK` — array of job objects with `title`, `company`, `location`, `description`, and `link`
- **Error:** `500` — fetch or parse failed

---

### `GET /holidays`
Fetches the list of US public holidays for the current year from the Nager.Date API.

- **External Source:** `https://date.nager.at/api/v3/PublicHolidays/{year}/US`
- **Response:** `200 OK` — array of holiday objects with `date`, `localName`, and `name`
- **Error:** `500` — fetch failed

---

### `GET /quote`
Fetches a random inspirational quote from the ZenQuotes API.

- **External Source:** `https://zenquotes.io/api/random`
- **Response:** `200 OK` — object with `q` (quote text) and `a` (author)
- **Error:** `500` — fetch failed

---

## 5. Known Bugs and Future Development

### Known Bugs

- **Company, location, and link fields in job listings are currently empty.** The Jobicy RSS feed does not include these fields in a consistently parseable format. The title and description display correctly.
- **The quote section may occasionally fail to load** if the ZenQuotes API rate limits the request. A fallback message is displayed in this case.
- **Logo images in the homepage slider require manual download.** The `logos/` folder must be populated with local image files — see `home.html` for the expected filenames.

### Roadmap for Future Development

- **Fix job listing fields** by investigating the Jobicy XML structure more deeply and mapping the correct tag names for company, location, and apply link.
- **Add pagination to the job board** so users can browse beyond the initial set of listings.
- **Add email delivery** so newsletter subscribers actually receive job emails.
- **Add user authentication** so subscribers can manage or unsubscribe from the newsletter.
- **Provde mobile layout** so navigation is possible on small screens.
- **Add job search and filtering** by keyword, state, or job category on the job board page.