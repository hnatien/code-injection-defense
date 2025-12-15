# UI Desktop Upgrade Instructions

I have updated the React components to use **Tailwind CSS** and **Framer Motion** for a premium "Cyber Security" look.

Because I could not access `npm` in your terminal environment, you must install the new dependencies manually for the UI to work.

## 1. Install Dependencies
Open your terminal in the `v-app` folder and run:

```bash
npm install -D tailwindcss postcss autoprefixer
npm install framer-motion lucide-react clsx tailwind-merge
```

## 2. Start the App
After installation, run the development server as usual:

```bash
npm run dev
```

## Changes Made
- **Login/Register**: Split-screen design, animated backgrounds, and "Split-screen" layout.
- **Search**: Added a **Live SQL Monitor** to visualize the injection query.
- **Dashboard**: New sidebar navigation and card-based layout.
- **Theme**: "Cyber Security" dark mode (Black/Green/Blue).
