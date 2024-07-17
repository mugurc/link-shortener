"use client";

export const fetchCache = "force-no-store";

import { useState, FormEvent, useEffect } from "react";
import { ChevronRightIcon, LinkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { debounce } from "lodash";
import toast from "react-hot-toast";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [shortUrl, setShortUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
  const [isCustomCodeAvailable, setIsCustomCodeAvailable] =
    useState<boolean>(true);
  const [domain, setDomain] = useState<string>("");
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [isFetchingTitle, setIsFetchingTitle] = useState<boolean>(false);

  useEffect(() => {
    const domains = process.env.NEXT_PUBLIC_VALID_DOMAINS?.split(",") || [];
    setAvailableDomains(domains);
    if (domains.length > 0) {
      setDomain(domains[0]);
    }
  }, []);

  useEffect(() => {
    if (domain && customCode) {
      checkCustomCode(customCode);
    }
  }, [domain]);

  const validateUrl = debounce(async (url: string) => {
    if (!url) {
      setIsUrlValid(true);
      return;
    }
    const response = await fetch("/api/validate-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const { valid } = await response.json();
    setIsUrlValid(valid);
    if (valid) {
      fetchTitle(url);
    }
  }, 300);

  const fetchTitle = async (url: string) => {
    setIsFetchingTitle(true);
    try {
      const response = await fetch("/api/fetch-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Failed to fetch title");

      const { title } = await response.json();
      if (title) setTitle(title);
    } catch (error) {
      console.error("Error fetching title:", error);
    } finally {
      setIsFetchingTitle(false);
    }
  };

  const checkCustomCode = debounce(async (code: string) => {
    if (!code || !domain) {
      setIsCustomCodeAvailable(true);
      return;
    }
    const response = await fetch("/api/check-short-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortCode: code, domain }),
    });
    const { available } = await response.json();
    setIsCustomCodeAvailable(available);
    if (!available) {
      toast.error(
        "This short code is already in use for the selected domain. Please choose another."
      );
    }
  }, 300);

  useEffect(() => {
    validateUrl(url);
  }, [url]);

  useEffect(() => {
    if (domain) {
      checkCustomCode(customCode);
    }
  }, [customCode, domain]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isUrlValid || (customCode && !isCustomCodeAvailable) || !domain) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          title,
          note,
          customCode,
          domain,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      const data: { shortenedUrl: string } = await response.json();
      setShortUrl(data.shortenedUrl);
      toast.success("URL shortened successfully!");
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            URL Shortener
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Customize your short link with additional information
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  isUrlValid ? "border-gray-300" : "border-red-500"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter your long URL here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {!isUrlValid && (
                <p className="mt-2 text-sm text-red-600">
                  Please enter a valid URL
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium text-gray-700"
              >
                Select Domain
              </label>
              <select
                id="domain"
                name="domain"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  if (customCode) {
                    checkCustomCode(customCode);
                  }
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {availableDomains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  isFetchingTitle ? "bg-gray-100" : ""
                }`}
                placeholder={
                  isFetchingTitle
                    ? "Fetching title..."
                    : "Enter a title (optional, auto-fetched if left blank)"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                readOnly={isFetchingTitle}
              />
              {isFetchingTitle && (
                <p className="mt-2 text-sm text-gray-500">
                  Fetching title, please wait...
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700"
              >
                Note
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="customCode"
                className="block text-sm font-medium text-gray-700"
              >
                Custom Short Code
              </label>
              <input
                id="customCode"
                name="customCode"
                type="text"
                className={`mt-1 block w-full px-3 py-2 border ${
                  isCustomCodeAvailable ? "border-gray-300" : "border-red-500"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter a custom short code (optional)"
                value={customCode}
                onChange={(e) => {
                  setCustomCode(e.target.value);
                  checkCustomCode(e.target.value);
                }}
              />
              {!isCustomCodeAvailable && (
                <p className="mt-2 text-sm text-red-600">
                  This short code is already in use
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={
                isLoading ||
                !isUrlValid ||
                (customCode && !isCustomCodeAvailable) ||
                !domain
              }
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ||
                !isUrlValid ||
                (customCode && !isCustomCodeAvailable) ||
                !domain
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <LinkIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              {isLoading ? "Shortening..." : "Shorten URL"}
            </button>
          </div>
        </form>

        {shortUrl && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your shortened URL:
            </h3>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(shortUrl)}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                Copy
              </button>
            </div>
          </div>
        )}
        <div className="mt-6 text-center">
          <Link href="/list" className="text-indigo-600 hover:text-indigo-500">
            View all shortened URLs
          </Link>
        </div>
      </div>
    </div>
  );
}
