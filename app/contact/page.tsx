import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | SDMCET Insignia',
  description: 'Contact SDMCET Insignia for queries or support',
};

export default function ContactPage() {
  return (
    <main className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Get in Touch</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Have questions about Insignia? We're here to help. Fill out the form or use the contact details below to reach out to us.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Email:</span> info@sdmcetinsignia.com
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Phone:</span> +91 1234567890
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Address:</span> SDM College of Engineering and Technology, Dharwad, Karnataka, India
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input type="text" id="name" className="w-full px-4 py-2 border rounded-md" placeholder="Your Name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input type="email" id="email" className="w-full px-4 py-2 border rounded-md" placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
              <textarea id="message" rows={4} className="w-full px-4 py-2 border rounded-md" placeholder="Your message..."></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}