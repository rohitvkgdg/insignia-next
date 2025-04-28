import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | SDMCET Insignia',
  description: 'Frequently asked questions about SDMCET Insignia',
};

export default function FAQPage() {
  return (
    <main className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">What is SDMCET Insignia?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            SDMCET Insignia is the annual technical symposium organized by the students of SDM College of Engineering and Technology.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-2">When and where is it held?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Insignia is typically held in the SDMCET campus. Please check the current event details for specific dates and venue information.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-2">How can I participate?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You can register for events through our website. Navigate to the Events section, choose your preferred events, and follow the registration process.
          </p>
        </div>
      </div>
    </main>
  );
}