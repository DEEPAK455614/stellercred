"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import WalletConnectButton from "./WalletConnectButton";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/verify", label: "Verify" },
    { href: "/docs", label: "Docs" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-purple-600 text-xs font-bold text-white">
              SC
            </div>
            <span className="text-lg font-bold gradient-text">StellarCred</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-emerald-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard/student"
              className={`text-sm font-medium transition-colors ${
                isActive("/dashboard/student")
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/admin"
              className={`text-sm font-medium transition-colors ${
                isActive("/dashboard/admin")
                  ? "text-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Admin
            </Link>
            <WalletConnectButton />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0a0f1e]/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium ${
                  isActive(link.href) ? "text-emerald-400" : "text-gray-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard/student"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-gray-400"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-gray-400"
            >
              Admin
            </Link>
            <WalletConnectButton />
          </div>
        </div>
      )}
    </nav>
  );
}
