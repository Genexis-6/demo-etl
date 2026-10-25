import "./globals.css";

export const metadata = {
  title: "ETL Pipeline Studio · Real-Time Concurrent Scraper",
  description: "High-performance async ETL pipeline showcase with concurrency control, resilience, and real-time streaming.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F5FA] text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
