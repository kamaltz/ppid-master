"use client";

import { useState } from "react";
import { seedAllData, seedRequests, seedInformasi, seedPages } from "@/lib/seedData";

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeedAll = async () => {
    setIsSeeding(true);
    setMessage("Uploading data to database...");
    try {
      await seedAllData();
      setMessage("✅ All data uploaded successfully!");
    } catch (error) {
      setMessage("❌ Failed to upload data");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedRequests = async () => {
    setIsSeeding(true);
    setMessage("Uploading requests...");
    try {
      await seedRequests();
      setMessage("✅ Requests uploaded successfully!");
    } catch (error) {
      setMessage("❌ Failed to upload requests");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedInformasi = async () => {
    setIsSeeding(true);
    setMessage("Uploading informasi...");
    try {
      await seedInformasi();
      setMessage("✅ Informasi uploaded successfully!");
    } catch (error) {
      setMessage("❌ Failed to upload informasi");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Database Seeder</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6">
          Upload dummy data to database for testing and development.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleSeedAll}
            disabled={isSeeding}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {isSeeding ? "Uploading..." : "Upload All Data"}
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={handleSeedRequests}
              disabled={isSeeding}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Upload Requests
            </button>
            
            <button
              onClick={handleSeedInformasi}
              disabled={isSeeding}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Upload Informasi
            </button>
          </div>
        </div>
        
        {message && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}