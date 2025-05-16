// client/src/services/fixturesApi.js
import api from '../utils/api';

class FixturesApi {
  constructor() {
    this.baseURL = '/api/fixtures';
  }

  /**
   * Fetch fixtures for a specific season
   * @param {number} seasonId - The season ID (4644 for Ligat HaAl, 4966 for Leumit)
   * @param {string} season - The season string (e.g., '2024-2025')
   * @param {boolean} forceRefresh - Whether to force refresh the cache
   * @param {string} format - Response format ('processed', 'raw', 'regular', 'playoff')
   * @returns {Promise<Object>} Fixtures data
   */
  async getFixtures(seasonId, season = '2024-2025', forceRefresh = false, format = 'processed') {
    try {
      const response = await api.get(this.baseURL, {
        params: {
          seasonId: seasonId.toString(),
          season,
          force: forceRefresh.toString(),
          format
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch fixtures');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching fixtures:', error);
      throw error;
    }
  }

  /**
   * Get only regular season fixtures
   */
  async getRegularSeasonFixtures(seasonId, season = '2024-2025', forceRefresh = false) {
    return this.getFixtures(seasonId, season, forceRefresh, 'regular');
  }

  /**
   * Get only playoff fixtures
   */
  async getPlayoffFixtures(seasonId, season = '2024-2025', forceRefresh = false) {
    return this.getFixtures(seasonId, season, forceRefresh, 'playoff');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching cache stats:', error);
      throw error;
    }
  }

  /**
   * Clear fixtures cache
   * @param {string} pattern - Optional pattern to match for selective clearing
   */
  async clearCache(pattern = null) {
    try {
      const url = `${this.baseURL}/cache${pattern ? `?pattern=${pattern}` : ''}`;
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      const response = await api.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking API health:', error);
      throw error;
    }
  }

  /**
   * Utility method to separate fixtures by season type
   * @param {Array} fixtures - Array of fixture objects
   * @returns {Object} Object with regularFixtures and playoffFixtures arrays
   */
  separateFixturesBySeason(fixtures) {
    const regularFixtures = fixtures.filter(fixture => fixture.season === 'regular');
    const playoffFixtures = fixtures.filter(fixture => fixture.season === 'playoff');
    
    return {
      regularFixtures: regularFixtures.sort((a, b) => new Date(a.date) - new Date(b.date)),
      playoffFixtures: playoffFixtures.sort((a, b) => new Date(a.date) - new Date(b.date)),
      allFixtures: fixtures.sort((a, b) => new Date(a.date) - new Date(b.date))
    };
  }

  /**
   * Group fixtures by round
   * @param {Array} fixtures - Array of fixture objects
   * @returns {Object} Object with fixtures grouped by round number
   */
  groupFixturesByRound(fixtures) {
    return fixtures.reduce((groups, fixture) => {
      const round = fixture.round;
      if (!groups[round]) {
        groups[round] = [];
      }
      groups[round].push(fixture);
      return groups;
    }, {});
  }

  /**
   * Find upcoming fixtures for a specific team
   * @param {Array} fixtures - Array of fixture objects
   * @param {string} teamName - English team name
   * @param {number} limit - Maximum number of fixtures to return
   * @returns {Array} Array of upcoming fixtures for the team
   */
  getUpcomingFixturesForTeam(fixtures, teamName, limit = 5) {
    const now = new Date();
    
    return fixtures
      .filter(fixture => fixture.homeTeam === teamName || fixture.awayTeam === teamName)
      .filter(fixture => {
        const [year, month, day] = fixture.date.split('-');
        let matchDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        if (fixture.time) {
          const [hours, minutes] = fixture.time.split(':');
          matchDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          matchDateTime.setHours(23, 59, 59, 999);
        }
        
        return matchDateTime >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  }

  /**
   * Find fixtures for a specific date range
   * @param {Array} fixtures - Array of fixture objects
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of fixtures in the date range
   */
  getFixturesInDateRange(fixtures, startDate, endDate) {
    return fixtures.filter(fixture => {
      const fixtureDate = new Date(fixture.date);
      return fixtureDate >= startDate && fixtureDate <= endDate;
    });
  }
}

// Export a singleton instance
export default new FixturesApi();