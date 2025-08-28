'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", id: "nav-home" },
    { href: "/test", label: "Test Components", id: "nav-test" },
    { href: "/files", label: "File Picker", id: "nav-files" },
  ]

  return (
    <nav className="main-navigation border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="nav-container container mx-auto px-4 py-3">
        <div className="nav-content flex items-center justify-between">
          <div className="nav-brand">
            <Link href="/" className="brand-link text-lg font-semibold text-foreground hover:text-primary transition-colors">
              DriveScope
            </Link>
          </div>
          <div className="nav-links flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
                className={cn(
                  item.id,
                  "nav-link transition-colors",
                  pathname === item.href && "nav-active"
                )}
              >
                <Link href={item.href}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
