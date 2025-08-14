import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(
      `/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Login gagal" }));
      
      if (response.status === 401) {
        throw new Error("Email atau password salah");
      }
      if (response.status === 404) {
        throw new Error("User tidak ditemukan");
      }
      if (response.status >= 500) {
        throw new Error("Server error, silakan coba lagi");
      }
      
      throw new Error(errorData.message || "Login gagal");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Tidak dapat terhubung ke server");
    }
    throw error;
  }
};

export const getPublicData = async (endpoint: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const getAdminData = async (endpoint: string, token: string) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const createRequest = async (requestData: any, token: string) => {
  if (!token) {
    throw new Error("Authentication required");
  }
  
  console.log('createRequest called with:', { requestData, hasToken: !!token });
  
  const response = await fetch(`/api/permintaan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });

  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || errorData.message || "Failed to create request");
    } catch (parseError) {
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }
  }

  return await response.json();
};

export const getPermintaan = async (token: string, params?: { page?: number; limit?: number; status?: string }) => {
  if (!token) {
    throw new Error("Authentication required");
  }

  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.status) searchParams.append('status', params.status);

  const url = `/api/permintaan${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to fetch requests" }));
    throw new Error(errorData.error || "Failed to fetch requests");
  }

  return await response.json();
};

export const updatePermintaanStatus = async (id: string, statusData: any, token: string) => {
  if (!token) {
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`/api/permintaan/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(statusData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to update request" }));
    throw new Error(errorData.error || "Failed to update request");
  }

  return await response.json();
};

export const registerUser = async (userData: unknown) => {
  const userDataWithRole = {
    ...(userData as object),
    role: "Pemohon",
  };

  const response = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDataWithRole),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Registration failed" }));
    throw new Error(errorData.message || "Registration failed");
  }

  return await response.json();
};

export const postData = async (
  endpoint: string,
  data: unknown,
  token?: string
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
