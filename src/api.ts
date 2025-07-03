const baseUrl = "https://wordstake-backend.onrender.com/api/v1";
const appUrl = "https://playwordstake.online";
// const baseUrl = "http://localhost:4000/api/v1";

// const appUrl = "http://localhost:3000";

const initializeApi = `${baseUrl}/game/initialize`;
const updateGamerApi = `${baseUrl}/game/updateGamer`;
const getGamerApi = `${baseUrl}/game/getGamer`;
const startGameApi = `${baseUrl}/game/startGame`;
const claimRewardsApi = `${baseUrl}/game/claimRewards`;
const createMultiplayerApi = `${baseUrl}/multiplayer/create`;
const deleteMultiplayerApi = `${baseUrl}/multiplayer/delete`;
const updateplayerApi = `${baseUrl}/multiplayer/updateplayer`;
const getGameMultiplayerApi = `${baseUrl}/multiplayer/getGame`;
const hostPendingGamesApi = `${baseUrl}/multiplayer/hostPendingGames`;
const addPlayerMultiplayerApi = `${baseUrl}/multiplayer/addPlayer`;
const playGameApi = `${baseUrl}/multiplayer/playGame`;
const updateGameApi = `${baseUrl}/multiplayer/updateGame`;
const loginApi = `${baseUrl}/game/auth/login`;
const signUpApi = `${baseUrl}/game/auth/signup`;

export {
  initializeApi,
  updateGamerApi,
  getGamerApi,
  startGameApi,
  claimRewardsApi,
  signUpApi,
  loginApi,
  createMultiplayerApi,
  deleteMultiplayerApi,
  updateplayerApi,
  getGameMultiplayerApi,
  addPlayerMultiplayerApi,
  appUrl,
  hostPendingGamesApi,
  playGameApi,
  updateGameApi
};
