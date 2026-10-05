/**
 * API Service for PIXEL STUDY BUDDY
 * Communicates with FastAPI backend with error normalization and 6-message history trimming.
 */

// Set VITE_API_URL at build time (Vercel env var). Falls back to the local backend in dev only.
const API_BASE = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '')
).replace(/\/+$/, '');

if (!API_BASE) {
  console.error('VITE_API_URL is not set — the app cannot reach the backend.');
}

const SERVER_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const CONNECT_ERROR = import.meta.env.DEV
  ? 'Cannot connect to backend server. Make sure FastAPI is running on port 8000.'
  : 'Cannot connect to the server. Please try again in a moment.';

/**
 * Normalizes error responses by reading `detail` from JSON bodies.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Error ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data && data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

/**
 * Uploads a document (PDF, DOCX, PPTX, TXT, MD) to /upload
 * @param {File} file 
 * @returns {Promise<{ doc_id: string, filename: string, num_sections: number, num_chunks: number }>}
 */
export async function uploadDocument(file) {
  // Vercel Functions reject request bodies over 4.5 MB before they reach the backend
  if (file.size > SERVER_MAX_UPLOAD_BYTES) {
    throw new Error(
      `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). The server accepts files up to 4 MB.`
    );
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError') { // network failure (wording differs per browser)
      throw new Error(CONNECT_ERROR);
    }
    throw err;
  }
}

/**
 * Sends a question to /chat
 * Sends ONLY the last 6 messages as history
 * @param {string} docId 
 * @param {string} question 
 * @param {Array<{ role: 'user'|'assistant', content: string }>} history 
 * @returns {Promise<{ answer: string, sources: Array<{ text: string, source: string, score: number|null }> }>}
 */
export async function sendChat(docId, question, history = []) {
  // Trim to last 6 messages and retain only role and content
  const trimmedHistory = history.slice(-6).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc_id: docId,
        question: question.trim(),
        history: trimmedHistory,
      }),
    });
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError') { // network failure (wording differs per browser)
      throw new Error(CONNECT_ERROR);
    }
    throw err;
  }
}

/**
 * Deletes a document from the backend vector store
 * @param {string} docId 
 * @returns {Promise<{ deleted: string }>}
 */
export async function deleteDocument(docId) {
  try {
    const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    });
    return await handleResponse(res);
  } catch (err) {
    if (err.name === 'TypeError') { // network failure (wording differs per browser)
      throw new Error(CONNECT_ERROR);
    }
    throw err;
  }
}

/**
 * Deletes a document while the page is closing (tab closed, refresh, navigation).
 * sendBeacon is delivered even after the page unloads; a regular fetch might be cancelled.
 * @param {string} docId
 */
export function endSession(docId) {
  const url = `${API_BASE}/documents/${encodeURIComponent(docId)}/delete`;
  if (navigator.sendBeacon?.(url)) return;
  fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
}

/**
 * Checks server health
 * @returns {Promise<{ status: string }>}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await handleResponse(res);
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}
