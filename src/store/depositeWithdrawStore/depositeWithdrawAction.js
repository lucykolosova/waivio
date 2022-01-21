import { createAsyncActionType } from '../../client/helpers/stateHelpers';
import {
  converHiveEngineCoins,
  getDepositWithdrawPair,
  getHiveEngineCoins,
} from '../../waivioApi/ApiClient';
import { openTransfer, toggleDepositModal } from '../walletStore/walletActions';

export const GET_DEPOSIT_WITHDRAW_PAIR = createAsyncActionType(
  '@depositWithdraw/GET_DEPOSIT_WITHDRAW_PAIR',
);

export const getDepositWithdrawPairs = () => ({
  type: GET_DEPOSIT_WITHDRAW_PAIR.ACTION,
  payload: getDepositWithdrawPair().then(async res => {
    const coinList = await getHiveEngineCoins();

    return [
      ...res.map(pair => {
        const curr = coinList.find(coin => coin.symbol === pair.from_coin_symbol);

        return {
          ...pair,
          ...curr,
        };
      }),
      {
        from_coin_symbol: 'HIVE',
        to_coin_symbol: 'SWAP.HIVE',
        display_name: 'HIVE',
        account: 'honey-swap',
        memo: {
          id: 'ssc-mainnet-hive',
          json: { contractName: 'hivepegged', contractAction: 'buy', contractPayload: {} },
        },
      },
    ].sort((a, b) => (b.display_name > a.display_name ? -1 : 1));
  }),
});

export const SET_TOKEN_PAIR = createAsyncActionType('@depositWithdraw/SET_TOKEN_PAIR');

export const setTokenPair = (pair, destination) => (dispatch, getState, { steemConnectAPI }) => {
  if (pair.from_coin_symbol === 'HIVE') {
    return dispatch({
      type: SET_TOKEN_PAIR.ACTION,
      payload: steemConnectAPI
        .hiveEngineDepositWithdraw(destination, {
          userName: destination,
          type: 'deposit',
          from_coin: pair.from_coin_symbol,
          to_coin: pair.to_coin_symbol,
          ex_rate: 1,
          pair: 'HIVE -> SWAP.HIVE',
          destination,
          ...pair,
        })
        .then(() => {
          dispatch(toggleDepositModal());
          dispatch(openTransfer(pair.account, 0, pair.from_coin_symbol, pair.memo));
        }),
    });
  }

  return dispatch({
    type: SET_TOKEN_PAIR.ACTION,
    payload: converHiveEngineCoins({
      from_coin: pair.from_coin_symbol,
      to_coin: pair.to_coin_symbol,
      destination,
    }).then(res => {
      steemConnectAPI.hiveEngineDepositWithdraw(destination, {
        userName: destination,
        type: 'deposit',
        from_coin: pair.from_coin_symbol,
        to_coin: pair.to_coin_symbol,
        destination,
        ...res,
      });

      return { ...pair, ...res };
    }),
  });
};

export const RESET_TOKEN_PAIR = '@depositWithdraw/RESET_TOKEN_PAIR';

export const resetSelectPair = () => ({
  type: RESET_TOKEN_PAIR,
});
