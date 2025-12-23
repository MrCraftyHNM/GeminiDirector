import { ReferenceDoc } from "../types";

/**
 * LOGIC LAYER (Read-Only)
 * This service previously handled AI execution.
 * It is now a strict data access layer for the Knowledge Base.
 */

export const formatCodeForDisplay = (doc: ReferenceDoc): string => {
  // In a real app, this might do syntax highlighting or formatting.
  // For now, it ensures the snippet is clean.
  return doc.codeSnippet.trim();
};

export const getDocById = (docs: ReferenceDoc[], id: string): ReferenceDoc | undefined => {
  return docs.find(d => d.id === id);
};
