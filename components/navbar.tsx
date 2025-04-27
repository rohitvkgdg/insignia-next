"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSession, signIn, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, LogOut, User } from "lucide-react"
import { Navbar as ResizableNavbar, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle } from "@/components/ui/resizable-navbar"

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Events", link: "/events" },
    ...(session ? [{ name: "Profile", link: "/profile" }] : []),
    ...(session?.user?.role === "ADMIN" ? [{ name: "Admin", link: "/admin" }] : [])
  ]

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/registrations" className="cursor-pointer flex w-full">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>My Registrations</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <ResizableNavbar>
      <NavBody>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text">Insignia</span>
          </Link>
          <nav className="hidden md:flex">
            <NavItems items={navItems} />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {status === "authenticated" ? (
            <UserMenu />
          ) : (
            <Button onClick={() => signIn("google")} variant="default">
              Sign In
            </Button>
          )}
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <div className="flex items-center">
          <MobileNavToggle 
            isOpen={isMobileMenuOpen} 
            onClickAction={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          />
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text ml-2">Insignia</span>
          </Link>
          </div>
          <div className="flex items-center">
            {status === "authenticated" ? (
              <UserMenu />
            ) : (
              <Button onClick={() => signIn("google")} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </MobileNavHeader>
        <MobileNavMenu isOpen={isMobileMenuOpen} onCloseAction={() => setIsMobileMenuOpen(false)}>
          <NavItems items={navItems} onItemClick={() => setIsMobileMenuOpen(false)} />
          <div>
            {status === "authenticated" ? (
              <>
                <Link href="/" className="block px-4 text-sm">Home</Link>
                <Link href="/events" className="block px-4 py-2 text-sm">Events</Link>
              </>
            ) : (
              <Button 
                onClick={() => signIn("google")} 
                variant="default"
                className="w-full"
              >
                Sign In
              </Button>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  )
}
