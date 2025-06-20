"use client"

import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function EventCategoryNavigation({ currentCategory, department }: { 
  currentCategory?: string,
  department?: string 
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 w-full items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-fit min-w-[150px] font-medium backdrop-blur-sm bg-background/30 border hover:bg-background/40 transition-all duration-200 active:scale-95"
            >
              <span className="text-sm truncate">
                {currentCategory ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) : 'All Events'}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="min-w-[150px] p-2 backdrop-blur-md bg-background/30 border shadow-lg rounded-xl overflow-hidden"
            align="center"
          >
            <DropdownMenuItem asChild className="rounded-lg hover:bg-background/50 focus:bg-background/50 transition-colors">
              <Link href="/events?category=centralized" className="w-full font-medium">Centralized</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg hover:bg-background/50 focus:bg-background/50 transition-colors">
              <Link href="/events?category=technical" className="w-full font-medium">Technical</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg hover:bg-background/50 focus:bg-background/50 transition-colors">
              <Link href="/events?category=cultural" className="w-full font-medium">Cultural</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg hover:bg-background/50 focus:bg-background/50 transition-colors">
              <Link href="/events?category=finearts" className="w-full font-medium">Finearts</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg hover:bg-background/50 focus:bg-background/50 transition-colors">
              <Link href="/events?category=literary" className="w-full font-medium">Literary</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {currentCategory === "technical" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-fit min-w-[150px] font-medium backdrop-blur-sm bg-background/30 border hover:bg-background/40 transition-all duration-200 active:scale-95"
              >
                <span className="text-sm truncate">
                  {department ? department.toUpperCase() : 'Select Department'}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="min-w-[150px] max-h-[300px] overflow-y-auto p-2 backdrop-blur-md bg-background/30 border shadow-lg rounded-xl"
              align="center"
            >
              {[
                ['CSE', 'cse'], ['ISE', 'ise'], ['AIML', 'aiml'], ['ECE', 'ece'],
                ['EEE', 'eee'], ['MECH', 'mech'], ['CIVIL', 'civil'], ['PHY', 'phy'],
                ['CHEM', 'chem'], ['CHTY', 'chty'], ['HUM', 'hum'], ['MATH', 'math'], ['MBA', 'mba']
              ].map(([label, value]) => (
                <DropdownMenuItem 
                  key={value} 
                  asChild 
                  className="rounded-lg hover:bg-background/50 focus:bg-background/50 transition-colors"
                >
                  <Link href={`/events?category=technical&department=${value}`} className="w-full font-medium">
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  return (
    <Tabs value={currentCategory || "all"} className="w-fit">
      <div className="flex flex-col items-center gap-4">
        <TabsList className="mb-4 h-auto p-1 grid grid-cols-3 md:flex md:grid-cols-none gap-1">
          <TabsTrigger value="centralized" asChild className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link href="/events?category=centralized" prefetch>Centralized</Link>
          </TabsTrigger>
          <TabsTrigger value="technical" asChild className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link href="/events?category=technical" prefetch>Technical</Link>
          </TabsTrigger>
          <TabsTrigger value="cultural" asChild className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link href="/events?category=cultural">Cultural</Link>
          </TabsTrigger>
          <TabsTrigger value="finearts" asChild className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link href="/events?category=finearts">Finearts</Link>
          </TabsTrigger>
          <TabsTrigger value="literary" asChild className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link href="/events?category=literary">Literary</Link>
          </TabsTrigger>
        </TabsList>
        
        {currentCategory === "technical" && (
          <Tabs value={department || undefined} className="w-full">
            <TabsList className="mb-4 h-auto p-1 grid grid-cols-4 md:flex md:grid-cols-none gap-1">
              {[
                ['CSE', 'cse'], ['ISE', 'ise'], ['AIML', 'aiml'], ['ECE', 'ece'],
                ['EEE', 'eee'], ['MECH', 'mech'], ['CIVIL', 'civil'], ['PHY', 'phy'],
                ['CHEM', 'chem'], ['CHTY', 'chty'], ['HUM', 'hum'], ['MATH', 'math'], ['MBA', 'mba']
              ].map(([label, value]) => (
                <TabsTrigger 
                  key={value}
                  value={value} 
                  asChild 
                  className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Link href={`/events?category=technical&department=${value}`}>{label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
    </Tabs>
  )
}