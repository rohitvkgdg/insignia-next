"use client"

import Link from "next/link"
import { Instagram, Facebook, Youtube } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Footer() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
      const loadTimer = setTimeout(() => {
        setIsLoading(false)
      }, 3000)
  
      return () => clearTimeout(loadTimer)
    }, [])
  
    if (isLoading) {
      return null
    }

  return (
    <footer className="bg-transparent backdrop-blur-lg">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="space-y-4">
            <div className="flex items-center">
              <Image src={"/Elements/ins-logo-yellow.webp"} alt="Logo" width={100} height={100}/>
              <h3 className="text-2xl font-bold gradient-text ml-5">Insignia '25</h3>
            </div>
            <p className="text-sm ">A National Level Techno-cultural Fest by SDM College of Engineering & Technology</p>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com/officialinsignia" className=" hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://www.facebook.com/insignia.sdmcet" className=" hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Events</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events?category=centralized" className=" hover:text-primary">
                  Centralized Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=technical" className=" hover:text-primary">
                  Technical Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=cultural" className=" hover:text-primary">
                  Cultural Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=finearts" className=" hover:text-primary">
                  Finearts Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=literary" className=" hover:text-primary">
                  Literary Events
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col space-x-auto space-y-2">
                <p className="text-xl font-semibold">Contact Us</p>
                <p className="text-sm ">
                Anush: <a href="tel:+916366164456" className="hover:text-primary">+91 81975 17399</a>
                </p>
                <p className="text-sm ">
                Shreyas: <a href="tel:+916366164456" className="hover:text-primary">+91 63661 64456</a>
                </p>
                <p className="text-sm ">
                Vikas: <a href="tel:+917676636905" className="hover:text-primary">+91 76766 36905</a>
                </p>
                <p className="text-sm ">
                Shantkumar: <a href="tel:+916362337279" className="hover:text-primary">+91 63623 37279</a>
                </p>
            </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className=" hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className=" hover:text-primary">
                  About
                </Link>
              </li>
            </ul>
            <p className="text-xl font-semibold">Media Handles</p>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com/sdm_media_official" className=" hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://www.youtube.com/@sdmcetmediaofficial" className=" hover:text-primary">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className=" hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className=" hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Insignia. All rights reserved.</p>
          <p className="mt-2 text-md self-center">
            Developed by{" "}
            <Link href="https://instagram.com/ig_rohitvk" className="hover:text-primary mr-1">
              <Instagram className="h-5 w-5 mx-1 pb-1 inline" />
              Rohit Kulkarni
            </Link>
            {" & "}
            <Link href="https://instagram.com/photos_by_sati" className="hover:text-primary">
            <Instagram className="h-5 w-5 mx-1 pb-1 inline" />
            Nikhil Kumar A H
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
