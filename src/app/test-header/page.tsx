"use client";

import CustomHeader from "@/components/layout/CustomHeader";

export default function TestHeaderPage() {
  return (
    <div>
      <CustomHeader />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Test Header Dropdown</h1>
        <p className="text-gray-600 mb-4">
          Hover over the "Profil" or "Layanan" menu items in the header above to see the dropdown menu.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Expected Behavior:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Hover over "Profil" → Should show dropdown with sub-menu items</li>
            <li>• Hover over "Layanan" → Should show dropdown with sub-menu items</li>
            <li>• Dropdown should appear smoothly with fade-in effect</li>
            <li>• Dropdown should disappear when mouse leaves the menu area</li>
          </ul>
        </div>
      </div>
    </div>
  );
}