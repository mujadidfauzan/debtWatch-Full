const API_BASE_URL = "http://localhost:8000"

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
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
        throw new Error(errorData.detail || 'Failed to fetch user profile');
    }

    return response.json();
}

export const updateUserProfile = async (userId: string, userData: Partial<UserProfileData>): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
    });

    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
        throw new Error(errorData.detail || 'Failed to update user profile');
    }

    return response.json();
};

export const getUserTransactions = async (userId: string): Promise<TransactionData[]> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/transactions`);

    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
        throw new Error(errorData.detail || 'Failed to fetch user transactions');
    }

    return response.json();
};

export const addUserTransaction = async (userId: string, transactionData: Omit<TransactionData, 'id' | 'created_at'>): Promise<{ message: string, id: string }> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData),
    });

    if(!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Network response was not ok'}));
        throw new Error(errorData.detail || 'Failed to add transaction');
    }

    return response.json();
};

//TODO: Nambahin API calls lainnya
