import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SDMCET Insignia',
  description: 'Privacy Policy for SDMCET Insignia',
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 max-w-4xl">
        <section>
          <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
          <p className="text-gray-700 dark:text-gray-300">
            This Privacy Policy describes how SDMCET Insignia collects, uses, and shares your personal information when you use our website.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
          <p className="text-gray-700 dark:text-gray-300">
            When you register for our events, we collect your name, email address, phone number, and college/institution information to facilitate your participation.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We use your information to process your registrations, send you updates about events, and improve our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">Data Security</h2>
          <p className="text-gray-700 dark:text-gray-300">
            We implement appropriate security measures to protect your personal information from unauthorized access and breaches.
          </p>
        </section>
      </div>
    </main>
  );
}