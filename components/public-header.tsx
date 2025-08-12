"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Phone, MessageCircle } from "lucide-react";
import { useContactInfo } from "@/contexts/shop-context";

export function PublicHeader() {
  const { contactInfo, loading } = useContactInfo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-primary-green text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span className="font-hindi">
                  {loading
                    ? "..."
                    : contactInfo?.phone || "फोन नंबर लोड हो रहा है"}
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span className="font-hindi">WhatsApp पर संपर्क करें</span>
              </div>
            </div>
            <div className="font-hindi text-xs">
              {loading ? "..." : contactInfo?.timings || "समय लोड हो रहा है"}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-green font-hindi">
                  {loading
                    ? "लोड हो रहा है..."
                    : contactInfo?.shopName || "दुकान का नाम"}
                </h1>
                <p className="text-xs text-muted-foreground font-hindi">
                  आपके खेत की पूरी ज़रूरत
                </p>
              </div>
            </a>
          </div>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="उत्पाद खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-hindi"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="/"
              className="text-gray-700 hover:text-primary-green font-hindi font-medium"
            >
              होम
            </a>
            <a
              href="/products"
              className="text-gray-700 hover:text-primary-green font-hindi font-medium"
            >
              सभी उत्पाद
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-primary-green font-hindi font-medium"
            >
              हमारे बारे में
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-primary-green font-hindi font-medium"
            >
              संपर्क
            </a>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="उत्पाद खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-hindi"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-4 py-4 space-y-3">
            <a
              href="/"
              className="block py-2 text-gray-700 hover:text-primary-green font-hindi font-medium touch-target"
            >
              होम
            </a>
            <a
              href="/products"
              className="block py-2 text-gray-700 hover:text-primary-green font-hindi font-medium touch-target"
            >
              सभी उत्पाद
            </a>
            <a
              href="/about"
              className="block py-2 text-gray-700 hover:text-primary-green font-hindi font-medium touch-target"
            >
              हमारे बारे में
            </a>
            <a
              href="/contact"
              className="block py-2 text-gray-700 hover:text-primary-green font-hindi font-medium touch-target"
            >
              संपर्क
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
