import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | SDMCET Insignia',
  description: 'Learn about SDMCET Insignia - the annual technical symposium',
};

export default function AboutPage() {
  return (
    <main className="container mx-auto py-36 px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">About SDMCET Insignia</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
            <p className="text-gray-700 dark:text-gray-300">
              SDMCET Insignia aims to foster innovation, technical excellence, and leadership among students by providing a platform to showcase their talents and skills.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-2">History</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Established in 2012, SDMCET Insignia has grown to become one of the premier technical symposiums in Karnataka, attracting participants from various engineering colleges across the country.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-2">Our Team</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Insignia is organized by a dedicated team of students from SDM College of Engineering and Technology, with guidance from faculty members and support from alumni.
            </p>
          </section>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <div>
                <h3 className="font-medium">Technical Competitions</h3>
                <p className="text-gray-700 dark:text-gray-300">Challenging contests that test technical knowledge and problem-solving skills</p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <div>
                <h3 className="font-medium">Workshops</h3>
                <p className="text-gray-700 dark:text-gray-300">Hands-on sessions on emerging technologies and tools</p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <div>
                <h3 className="font-medium">Guest Lectures</h3>
                <p className="text-gray-700 dark:text-gray-300">Talks by industry experts and academic leaders</p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <div>
                <h3 className="font-medium">Project Exhibition</h3>
                <p className="text-gray-700 dark:text-gray-300">Showcase of innovative student projects</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}