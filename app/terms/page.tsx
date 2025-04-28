import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | SDMCET Insignia',
  description: 'Terms and conditions for using SDMCET Insignia services',
};

export default function TermsPage() {
  return (
    <main className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="space-y-6 max-w-4xl">
        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-700 dark:text-gray-300">
            By accessing or using the SDMCET Insignia website and services, you agree to be bound by these Terms of Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Registration and Event Participation</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Users must provide accurate information when registering for events. Participation in events is subject to eligibility criteria specified for each event.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">3. Code of Conduct</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Participants are expected to maintain professional conduct during all Insignia events. Any form of harassment, discrimination, or disruptive behavior will not be tolerated.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Intellectual Property</h2>
          <p className="text-gray-700 dark:text-gray-300">
            All content on the SDMCET Insignia website, including text, graphics, logos, and images, is the property of SDMCET Insignia and is protected by copyright laws.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Limitation of Liability</h2>
          <p className="text-gray-700 dark:text-gray-300">
            SDMCET Insignia shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our website or participation in our events.
          </p>
        </section>
      </div>
    </main>
  );
}