import { auth } from '@/firebase'; // Import auth

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get Authorization header
const getAuthHeader = async (): Promise<HeadersInit> => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    } catch (error) {
      console.error('Error getting ID token:', error);
      // Handle token refresh errors if necessary (e.g., re-authentication)
      throw new Error('Failed to authenticate request');
    }
  } else {
    // Handle case where user is not logged in
    // Depending on the endpoint, you might allow the request without auth
    // or throw an error.
    // For protected endpoints, throwing an error is usually appropriate.
    // For now, just return Content-Type, backend will handle lack of auth.
    return { 'Content-Type': 'application/json' };
    // Or throw new Error("User not logged in");
  }
};

export interface UserProfileData {
  full_name: string;
  email: string;
  age: number;
  occupation: string;
  marital_status: string;
  location: string;
  phone?: string;
  gender?: string;
  dependents?: number;
  assets?: string;
  activeDebt?: string;
  pushNotifications?: boolean;
  darkTheme?: boolean;
}

export interface TransactionData {
  id: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
  note: string;
  created_at: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfileData> => {
  const headers = await getAuthHeader();
  // Remove Content-Type for GET request if it causes issues, though usually fine
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to fetch user profile');
  }

  return response.json();
};

export const updateUserProfile = async (userId: string, userData: Partial<UserProfileData>): Promise<{ message: string }> => {
  const headers = await getAuthHeader();
  // Ensure Content-Type is set for PATCH/POST
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to update user profile';
    try {
      // Try to get more specific error from response body
      const errorData = await response.json();
      errorDetail = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      // If parsing JSON fails, use the response text
      try {
        const textResponse = await response.text();
        errorDetail = `Server responded with status ${response.status}: ${textResponse || 'No additional error message provided.'}`;
      } catch (textErr) {
        errorDetail = `Server responded with status ${response.status}, but failed to get response text.`;
      }
    }
    console.error('Error in updateUserProfile:', response.status, response.statusText, errorDetail);
    throw new Error(errorDetail);
  }

  return response.json();
};

export const getUserTransactions = async (userId: string): Promise<TransactionData[]> => {
  const headers = await getAuthHeader();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/users/${userId}/transactions`, { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to fetch user transactions');
  }

  return response.json();
};

// Type adjustment: addUserTransaction expects payload without id/created_at,
// but our payload now includes created_at as a Date object.
// Let's adjust the API function slightly for clarity.
interface AddTransactionPayload {
  amount: number;
  category: string;
  note?: string;
  type: 'income' | 'expense';
  created_at: Date; // Expect Date object from frontend
}

export const addUserTransaction = async (userId: string, transactionData: AddTransactionPayload): Promise<{ message: string; id: string }> => {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';

  // Convert Date object to ISO string for JSON payload
  const payload = {
    ...transactionData,
    created_at: transactionData.created_at.toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/users/${userId}/transactions`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to add transaction');
  }

  return response.json();
};

// Debt/Loan API interfaces and functions
export interface DebtItem {
  id: string;
  namaUtang: string;
  cicilanTotalBulan: number;
  cicilanSudahDibayar: number;
  bunga: number | string;
  cicilanPerbulan: number;
  is_active?: boolean;
}

export type NewDebtPayload = Omit<DebtItem, 'id'>;

export const getUserDebts = async (userId: string): Promise<DebtItem[]> => {
  const headers = await getAuthHeader();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/users/${userId}/loans`, { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to fetch user debts');
  }

  return response.json();
};

export const addUserDebt = async (userId: string, debtData: NewDebtPayload): Promise<{ message: string; id: string }> => {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/users/${userId}/loans`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      ...debtData,
      is_active: debtData.cicilanSudahDibayar < debtData.cicilanTotalBulan,
      created_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to add debt');
  }

  return response.json();
};

export const updateUserDebt = async (userId: string, debtId: string, debtData: Partial<DebtItem>): Promise<{ message: string }> => {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/users/${userId}/loans/${debtId}`, {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify({
      ...debtData,
      is_active: debtData.cicilanSudahDibayar !== undefined && debtData.cicilanTotalBulan !== undefined ? debtData.cicilanSudahDibayar < debtData.cicilanTotalBulan : undefined,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to update debt');
  }

  return response.json();
};

export const deleteUserDebt = async (userId: string, debtId: string): Promise<{ message: string }> => {
  const headers = await getAuthHeader();

  const response = await fetch(`${API_BASE_URL}/users/${userId}/loans/${debtId}`, {
    method: 'DELETE',
    headers: headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to delete debt');
  }

  return response.json();
};

export interface AssetItem {
  id: string;
  displayName: string; // Changed from name to displayName to match Question_Asset.tsx
  jumlah: number;
  hargaJual: number[];
  isCustom?: boolean; // Added to match Question_Asset.tsx
  created_at?: string; // Made optional
}

export const updateUserAssets = async (userId: string, assets: AssetItem[]) => {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/users/${userId}/assets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ assets }),
  });

  if (!response.ok) throw new Error('Failed to update assets');
  return response.json();
};

export const getUserAssets = async (userId: string): Promise<AssetItem[]> => {
  const headers = await getAuthHeader();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/users/${userId}/assets`, { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to fetch user assets');
  }

  // Transform the API response to match our expected format if needed
  const assets = await response.json();
  return assets.map((asset: any) => ({
    id: asset.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    displayName: asset.name || asset.displayName || 'Unknown Asset',
    jumlah: asset.jumlah || 0,
    hargaJual: asset.hargaJual || [],
    isCustom: asset.isCustom || false,
    created_at: asset.created_at,
  }));
};

// Chat room interfaces
export interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
  last_message?: string;
  last_message_time?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  archived?: boolean;
}

// Get user's chat rooms
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  const headers = await getAuthHeader();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/users/${userId}/chatrooms`, { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to fetch chat rooms');
  }

  return response.json();
};

// Create a new chat room
export const createChatRoom = async (userId: string, name: string): Promise<ChatRoom> => {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/users/${userId}/chatrooms`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, created_at: new Date().toISOString() }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to create chat room');
  }

  return response.json();
};

// Get messages for a specific chat room
export const getChatMessages = async (userId: string, roomId: string): Promise<ChatMessage[]> => {
  const headers = await getAuthHeader();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/users/${userId}/chatrooms/${roomId}/messages`, { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to fetch chat messages');
  }

  return response.json();
};

// Send a message to a chat room
export const sendChatMessage = async (userId: string, roomId: string, message: string): Promise<ChatMessage> => {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/users/${userId}/chatrooms/${roomId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, timestamp: new Date().toISOString() }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to send message');
  }

  return response.json();
};

// Update chat message (for archive/unarchive)
export const updateChatMessage = async (userId: string, roomId: string, messageId: string, updates: Partial<ChatMessage>): Promise<{ message: string }> => {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/users/${userId}/chatrooms/${roomId}/messages/${messageId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || 'Failed to update message');
  }

  return response.json();
};
