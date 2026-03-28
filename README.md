# MindHarbour

A mental health and support app for refugees and immigrants.

## Getting started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Create a `.env` file

Create a file named `.env` in the root of the project and add your Anthropic API key:

```env
VITE_ANTHROPIC_KEY='your key here'
```

### 3. Install dependencies

```bash
npm install
```

### 4. Open two terminal windows

In the **first terminal**, start the backend server:

```bash
node server.js
```

In the **second terminal**, start the frontend app:

```bash
npm run dev
```

## Notes

* Make sure the `.env` file is in the root folder of the project.
* Replace `'your key here'` with your real Anthropic API key.
* The backend must be running before using features that depend on the API.

## Project purpose

MindHarbour is designed to support refugees and immigrants with:

* mental health check-ins
* document guidance
* practical life process support
* multilingual assistance
