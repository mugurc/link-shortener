"use client";

export const fetchCache = "force-no-store";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Statistics } from "../../types/Statistics";

export default function StatsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const shortCode = params?.shortCode;

  useEffect(() => {
    async function fetchStats() {
      if (typeof shortCode !== "string") {
        setError("Invalid short code");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/stats/${shortCode}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [shortCode]);

  if (isLoading || error || !stats || typeof shortCode !== "string") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
          {isLoading && (
            <div className="text-center">Loading statistics...</div>
          )}
          {error && (
            <div className="text-center text-red-500">Error: {error}</div>
          )}
          {(!stats && !isLoading && !error) || typeof shortCode !== "string" ? (
            <div className="text-center">No statistics available</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Statistics for Short URL: {shortCode}
        </h1>

        <div className="bg-gray-50 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Overview
            </h2>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Total Clicks
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {stats.totalClicks}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Unique Clicks
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {stats.uniqueClicks}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Clicks by Country</h2>
          <ul className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
            {Object.entries(stats.clicksByCountry).map(([country, clicks]) => (
              <li key={country} className="px-4 py-3 sm:px-6">
                <span className="font-medium">{country}:</span> {clicks} clicks
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Clicks by Device</h2>
          <ul className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
            {Object.entries(stats.clicksByDevice).map(([device, clicks]) => (
              <li key={device} className="px-4 py-3 sm:px-6">
                <span className="font-medium">{device}:</span> {clicks} clicks
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link href="/list" className="text-blue-500 hover:underline">
            Back to URL List
          </Link>
        </div>
      </div>
    </div>
  );
}
