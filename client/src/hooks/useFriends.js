import { useState, useCallback } from "react";
import api from "../utils/api";

/**
 * useFriends
 *
 * Custom React hook for managing friendship features:
 * - Fetching friends and requests
 * - Sending, accepting, rejecting, and removing requests
 * - Querying friendship status
 */
export const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch paginated friend list
   */
  const getFriends = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/friends", {
        params: { page, limit },
      });
      if (response.data.success) {
        if (page === 1) {
          setFriends(response.data.friends);
        } else {
          setFriends((prev) => [...prev, ...response.data.friends]);
        }
        return response.data;
      }
    } catch (err) {
      console.error("Error getting friends:", err);
      setError("לא הצלחנו לטעון את רשימת החברים");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch received friend requests
   */
  const getReceivedRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/friends/requests/received");
      if (response.data.success) {
        setReceivedRequests(response.data.requests);
        return response.data.requests;
      }
    } catch (err) {
      console.error("Error getting received requests:", err);
      setError("לא הצלחנו לטעון את בקשות החברות");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch sent friend requests
   */
  const getSentRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/friends/requests/sent");
      if (response.data.success) {
        setSentRequests(response.data.requests);
        return response.data.requests;
      }
    } catch (err) {
      console.error("Error getting sent requests:", err);
      setError("לא הצלחנו לטעון את הבקשות שנשלחו");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a new friend request
   */
  const sendFriendRequest = useCallback(
    async (receiverId) => {
      setRequestLoading(true);
      setError(null);
      try {
        const response = await api.post("/api/friends/send-request", {
          receiverId,
        });
        if (response.data.success) {
          getSentRequests();
          return { success: true, message: "בקשת חברות נשלחה בהצלחה" };
        }
      } catch (err) {
        console.error("Error sending friend request:", err);
        const errorMessage =
          err.response?.data?.error || "לא הצלחנו לשלוח את בקשת החברות";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setRequestLoading(false);
      }
    },
    [getSentRequests]
  );

  /**
   * Accept a pending friend request
   */
  const acceptFriendRequest = useCallback(
    async (requestId) => {
      setRequestLoading(true);
      setError(null);
      try {
        const response = await api.put(`/api/friends/accept/${requestId}`);
        if (response.data.success) {
          setReceivedRequests((prev) =>
            prev.filter((req) => req.id !== requestId)
          );
          getFriends();
          return { success: true, message: "בקשת החברות אושרה" };
        }
      } catch (err) {
        console.error("Error accepting friend request:", err);
        const errorMessage =
          err.response?.data?.error || "לא הצלחנו לאשר את בקשת החברות";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setRequestLoading(false);
      }
    },
    [getFriends]
  );

  /**
   * Reject a pending friend request
   */
  const rejectFriendRequest = useCallback(async (requestId) => {
    setRequestLoading(true);
    setError(null);
    try {
      const response = await api.put(`/api/friends/reject/${requestId}`);
      if (response.data.success) {
        setReceivedRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );
        return { success: true, message: "בקשת החברות נדחתה" };
      }
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      const errorMessage =
        err.response?.data?.error || "לא הצלחנו לדחות את בקשת החברות";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setRequestLoading(false);
    }
  }, []);

  /**
   * Remove an existing friend
   */
  const removeFriend = useCallback(async (friendId) => {
    setRequestLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/api/friends/remove/${friendId}`);
      if (response.data.success) {
        setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
        return { success: true, message: "החבר הוסר בהצלחה" };
      }
    } catch (err) {
      console.error("Error removing friend:", err);
      const errorMessage =
        err.response?.data?.error || "לא הצלחנו להסיר את החבר";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setRequestLoading(false);
    }
  }, []);

  /**
   * Get current friendship status with user
   */
  const getFriendshipStatus = useCallback(
    (userId) => {
      if (friends.some((friend) => friend._id === userId)) return "friends";
      if (sentRequests.some((req) => req.receiver._id === userId))
        return "sent";
      if (receivedRequests.some((req) => req.sender._id === userId))
        return "received";
      return "none";
    },
    [friends, sentRequests, receivedRequests]
  );

  /**
   * Get request ID from a received request
   */
  const getFriendRequestId = useCallback(
    (userId) => {
      const receivedRequest = receivedRequests.find(
        (req) => req.sender._id === userId
      );
      return receivedRequest?.id || null;
    },
    [receivedRequests]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const friendsCount = friends.length;
  const receivedRequestsCount = receivedRequests.length;
  const sentRequestsCount = sentRequests.length;

  return {
    friends,
    receivedRequests,
    sentRequests,
    loading,
    requestLoading,
    error,
    friendsCount,
    receivedRequestsCount,
    sentRequestsCount,
    getFriends,
    getReceivedRequests,
    getSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriendshipStatus,
    getFriendRequestId,
    clearError,
  };
};
