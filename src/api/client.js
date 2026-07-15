const BASE_URL = "http://localhost:8000/api/v1";

function getAuthHeader() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiClient(endpoint, { body, formData, method = "GET", ...customConfig } = {}) {
  const headers = {
    ...getAuthHeader(),
    ...customConfig.headers,
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method,
    headers,
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  } else if (formData) {
    config.body = formData;
    // Don't set Content-Type for formData, let browser set it with boundary
    delete headers["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  // Handle unauthorized/expired token
  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    window.dispatchEvent(new Event("auth_error"));
    throw new Error("Unauthorized");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "An error occurred");
  }

  return data;
}

export const authApi = {
  login: (email, password) => apiClient("/auth/login", {
    method: "POST",
    body: { email, password }
  }),
  register: (email, password) => apiClient("/auth/register", {
    method: "POST",
    body: { email, password }
  }),
  getMe: () => apiClient("/auth/me")
};

export const interviewApi = {
  start: (specialization, level, mode) => apiClient("/interview/start", {
    method: "POST",
    body: { specialization, level, mode }
  }),
  submitAnswer: (interviewId, questionId, audioBlob) => {
    const formData = new FormData();
    formData.append("video", audioBlob, "answer.webm");
    
    return apiClient(`/interview/${interviewId}/answer/${questionId}/submit`, {
      method: "POST",
      formData
    });
  },
  getDashboard: (interviewId) => apiClient(`/interview/${interviewId}/dashboard`),
  share: (interviewId) => apiClient(`/interview/${interviewId}/share`, {
    method: "POST"
  })
};

export const mentorApi = {
  getShared: (token) => apiClient(`/mentor/share/${token}`),
  submitComment: (questionId, commentText, token) => apiClient("/mentor/comment", {
    method: "POST",
    body: { question_id: questionId, comment_text: commentText, share_token: token }
  })
};
