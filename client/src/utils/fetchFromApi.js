

export async function fetchFromApi(apiUrl) {
    try {
      const proxyUrl = `http://localhost:3001/api/proxy?url=${encodeURIComponent(apiUrl)}`;
      const response = await fetch(proxyUrl);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch from API. Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("fetchFromApi error:", error);
      throw error;
    }
  }
  