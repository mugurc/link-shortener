"use client";

export const fetchCache = "force-no-store";

import { useState, useEffect } from "react";
import Link from "next/link";
import EditDialog from "./EditDialog";
import DeleteDialog from "./DeleteDialog";
import { UrlEntry } from "../types/UrlEntry";

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

export default function ListPage() {
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<UrlEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<UrlEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUrlEntries();
  }, []);

  const fetchUrlEntries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/urls");
      if (!response.ok) {
        throw new Error("Failed to fetch URL entries");
      }
      const data = await response.json();
      setUrlEntries(data);
    } catch (err) {
      setError("An error occurred while fetching URL entries");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entry: UrlEntry) => {
    setEditingEntry(entry);
  };

  const handleDelete = (entry: UrlEntry) => {
    setDeletingEntry(entry);
  };

  const handleEditSubmit = async (updatedEntry: UrlEntry) => {
    try {
      const response = await fetch(`/api/urls/${updatedEntry._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry),
      });
      if (!response.ok) {
        throw new Error("Failed to update URL entry");
      }
      setEditingEntry(null);
      fetchUrlEntries();
    } catch (err) {
      console.error("Error updating URL entry:", err);
    }
  };
  const handleDeleteConfirm = async () => {
    if (deletingEntry) {
      try {
        const response = await fetch(`/api/urls/${deletingEntry._id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete URL entry and its statistics");
        }
        setDeletingEntry(null);
        fetchUrlEntries();
      } catch (err) {
        console.error("Error deleting URL entry and its statistics:", err);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center px-4 py-12">
      <div className="max-w-7xl w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl overflow-hidden">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Shortened URLs List
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Short URL
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Original URL
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Statistics
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created At
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {urlEntries.map((entry) => (
                <tr key={entry._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`${entry.shortenedUrl}`}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.shortenedUrl}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {truncate(entry.title || "No title", 30)}
                    </div>
                    {entry.note && (
                      <div className="text-sm text-gray-500" title={entry.note}>
                        {truncate(entry.note, 50)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={entry.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:underline"
                      title={entry.originalUrl}
                    >
                      {truncate(entry.originalUrl, 50)}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/stats/${entry.shortCode}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      View Stats
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
      {editingEntry && (
        <EditDialog
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSubmit={handleEditSubmit}
        />
      )}
      {deletingEntry && (
        <DeleteDialog
          entry={deletingEntry}
          onClose={() => setDeletingEntry(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
