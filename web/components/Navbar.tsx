"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@mysten/dapp-kit";

export function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Walrus" width={32} height={32} className="h-8 w-8" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Walrus Hub
                    </span>
                    {/* <Image src="/sui-logo.png" alt="Sui" width={24} height={24} className="h-6 w-6 ml-2" /> */}
                </Link>
                <div className="flex gap-4 text-sm font-medium text-gray-600">
                    <Link href="/" className="hover:text-gray-900 transition-colors">Explore</Link>
                    <Link href="/upload" className="hover:text-gray-900 transition-colors">Upload</Link>
                </div>
            </div>
            <ConnectButton />
        </nav>
    );
}
