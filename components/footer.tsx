import Link from "next/link"
import { Instagram, Facebook, Twitter, X } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-transparent backdrop-blur-lg">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex">
              <Image src={"/Elements/ins-logo-yellow.svg"} alt="Logo" width={30} height={30}/>
              <h3 className="text-lg font-bold gradient-text">Insignia</h3>
            </div>
            <p className="text-sm text-muted-foreground">A National Level Techno-cultural Fest by SDM College of Engineering & Technology</p>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com/officialinsignia" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://www.facebook.com/insignia.sdmcet" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
            <div className="flex flex-col space-x-4">
              <p className="text-sm text-muted-foreground">Contact us on:</p>
                <p className="text-sm text-muted-foreground">
                Shreyas: <a href="tel:+916366164456" className="hover:text-primary">+91 63661 64456</a>
                </p>
                <p className="text-sm text-muted-foreground">
                Vikas: <a href="tel:+917676636905" className="hover:text-primary">+91 76766 36905</a>
                </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Events</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events?category=centralized" className="text-muted-foreground hover:text-primary">
                  Centralized Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=technical" className="text-muted-foreground hover:text-primary">
                  Technical Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=cultural" className="text-muted-foreground hover:text-primary">
                  Cultural Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=finearts" className="text-muted-foreground hover:text-primary">
                  Finearts Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=literary" className="text-muted-foreground hover:text-primary">
                  Literary Events
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Insignia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
