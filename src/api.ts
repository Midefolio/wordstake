// const baseUrl = "http://192.168.225.76:4000/api/v1";
const baseUrl = "https://wordstake-backend.onrender.com/api/v1";

const initializeApi = `${baseUrl}/game/initialize`;
const updateGamerApi = `${baseUrl}/game/updateGamer`;
const getGamerApi = `${baseUrl}/game/getGamer`;
const startGameApi = `${baseUrl}/game/startGame`;
const claimRewardsApi = `${baseUrl}/game/claimRewards`;

export {
  initializeApi,
  updateGamerApi,
  getGamerApi,
  startGameApi,
  claimRewardsApi
};
