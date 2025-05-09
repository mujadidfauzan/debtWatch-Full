import { auth } from "@/firebase"; // Import auth

const API_BASE_URL = "http://localhost:8000"

// Helper function to get Authorization header
const getAuthHeader = async (): Promise<HeadersInit> => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    } catch (error) {
      console.error("Error getting ID token:", error);
      // Handle token refresh errors if necessary (e.g., re-authentication)
      throw new Error("Failed to authenticate request");
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
    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
        throw new Error(errorData.detail || 'Failed to fetch user profile');
    }

    return response.json();
}

export const updateUserProfile = async (userId: string, userData: Partial<UserProfileData>): Promise<{ message: string }> => {
    const headers = await getAuthHeader();
    // Ensure Content-Type is set for PATCH/POST
    headers['Content-Type'] = 'application/json'; 

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(userData),
    });

    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
        throw new Error(errorData.detail || 'Failed to update user profile');
    }

    return response.json();
};

export const getUserTransactions = async (userId: string): Promise<TransactionData[]> => {
    const headers = await getAuthHeader();
    delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}/users/${userId}/transactions`, { headers });

    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
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

export const addUserTransaction = async (userId: string, transactionData: AddTransactionPayload): Promise<{ message: string, id: string }> => {
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

    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
        throw new Error(errorData.detail || 'Failed to add transaction');
    }

    return response.json();
};

//TODO: Nambahin API calls lainnya
