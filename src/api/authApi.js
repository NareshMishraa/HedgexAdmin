import { createApi } from "@reduxjs/toolkit/query/react";
import { rtkBaseQuery } from "./baseQuery";

const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: rtkBaseQuery,
  endpoints: (builder) => ({
    // User authentication endpoints
    userLogin: builder.mutation({
      query: ({ email, password }) => ({
        method: "POST",
        url: `admin/send-otp/login`,
        body: { email, password },
      }),
    }),
    verifyLoginOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: `admin/verify-otp/login`,
        method: "POST",
        body: { email, otp },
      }),
    }),
    sendResetPasswordOtp: builder.mutation({
  query: ({ email }) => ({
    url: "admin/send-otp/reset-password",
    method: "POST",
    body: { email },
  }),
}),

verifyResetPasswordOtp: builder.mutation({
  query: ({ email, otp }) => ({
    url: "admin/verify-otp/reset-password",
    method: "POST",
    body: { email, otp },
  }),
}),

resetPassword: builder.mutation({
  query: ({ email, password, confirmPassword }) => ({
    url: "admin/reset-password",
    method: "POST",
    body: { email, password, confirmPassword },
  }),
}),


    getUserDetails: builder.query({
      query: () => ({
        method: "GET",
        url: `/auth/user-details`,
      }),
    }),

    // Wallet management endpoints
    addWallet: builder.mutation({
      query: ({ email, walletAddress }) => ({
        method: "POST",
        url: `/auth/user/addWallets`,
        body: { email, walletAddress },
      }),
    }),
    getAllWallets: builder.mutation({
      query: ({ email }) => ({
        method: "POST",
        url: `/auth/get-wallet-status`,
        body: { email },
      }),
    }),
    getWallets: builder.query({
      query: () => ({
        method: "GET",
        url: `/wallet/get-wallets`,
      }),
    }),

    // Trading and exchange endpoints
    getTokens: builder.query({
      query: () => ({
        method: "GET",
        url: `/auth/token-list`,
      }),
    }),
    getQuoteValue: builder.query({
      query: ({ src, dst, amount }) => ({
        method: "GET",
        url: `/auth/fetchQuote?src=${src}&dst=${dst}&amount=${amount}`,
      }),
    }),
    swapData: builder.mutation({
      query: (body) => ({
        method: "POST",
        url: `/auth/fetch-swap-details`,
        body,
      }),
    }),
    tokenPrice: builder.mutation({
      query: (body) => ({
        method: "POST",
        url: `/auth/fetchTokenPrice`,
        body,
      }),
    }),
    getAllTokenPrice: builder.query({
      query: () => ({
        url: "/auth/all-token-price",
        method: "GET",
      }),
    }),

    // Portfolio and activity endpoints
    addUpdatePortfolio: builder.mutation({
      query: ({ walletAddress, portfolioValue, activeHedges, totalEarnings, successRate }) => ({
        url: "/auth/add-update-portfolio",
        method: "POST",
        body: { walletAddress, portfolioValue, activeHedges, totalEarnings, successRate },
      }),
    }),
    getAllPortfolios: builder.query({
      query: (walletAddress) => ({
        url: "/auth/all-portfolios",
        method: "POST",
        body: { walletAddress },
      }),
    }),
    getAllRecentActivity: builder.query({
      query: ({ walletAddress, page, limit }) => ({
        url: "/auth/all-recent-activities",
        method: "POST",
        body: { walletAddress, page, limit },
      }),
    }),
    getRecentTrades: builder.query({
      query: ({ walletAddress, page, limit }) => ({
        url: "/auth/recent-trades",
        method: "POST",
        body: { walletAddress, page, limit },
      }),
    }),
    // --- KYC: India (Aadhaar/PAN) ---
    sendAadhaarOtp: builder.mutation({
      query: ({ aadhaarNumber }) => ({
        url: `/kyc/adhaar/send-otp`,
        method: 'POST',
        body: { aadhaarNumber },
      }),
    }),
    verifyAadhaarOtp: builder.mutation({
      query: ({ aadhaarNumber, otp }) => ({
        url: `/kyc/adhaar/verify-otp`,
        method: 'POST',
        body: { aadhaarNumber, otp },
      }),
    }),
    verifyPanLink: builder.mutation({
      query: ({ pan }) => ({
        url: `/kyc/verify-pan`,
        method: 'POST',
        body: { pan },
      }),
    }),

    // --- KYC: Video ---
    uploadKycVideo: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('video', file);
        return {
          url: `/kyc/video-upload`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    submitVideoKyc: builder.mutation({
      query: ({ bucket, video }) => ({
        url: `/kyc/video-kyc`,
        method: 'POST',
        body: { bucket, video },
      }),
    }),
    getMigrationDetail: builder.query({
      query: () => ({
        url: "/auth/get-migration-detail",
        method: "POST",
      }),
    }),
    updateWalletStatus: builder.mutation({
      query: (status) => ({
        url: "/auth/wallet-status-update",
        method: "POST",
        body: { status },
      }),
    }),
    getWalletStatus: builder.query({
      query: () => "/auth/get-wallet-status", // GET request by default
    }),
    sendForgotLoginPassword: builder.mutation({
      query: ({ email, flag }) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: { email, flag },
      }),
    }),

  }),
});

export const {
  useUserLoginMutation,
  useVerifyLoginOtpMutation,
  useSendResetPasswordOtpMutation,
  useVerifyResetPasswordOtpMutation,
  useResetPasswordMutation,
  useGetUserDetailsQuery,
  useAddWalletMutation,
  useGetAllWalletsMutation,
  useGetWalletsQuery,
  useGetTokensQuery,
  useGetQuoteValueQuery,
  useSwapDataMutation,
  useTokenPriceMutation,
  useGetAllTokenPriceQuery,
  useAddUpdatePortfolioMutation,
  useGetAllPortfoliosQuery,
  useGetAllRecentActivityQuery,
  useGetRecentTradesQuery,
  useSendAadhaarOtpMutation,
  useVerifyAadhaarOtpMutation,
  useVerifyPanLinkMutation,
  useUploadKycVideoMutation,
  useSubmitVideoKycMutation,
  useGetMigrationDetailQuery,
  useUpdateWalletStatusMutation,
  useGetWalletStatusQuery,
  useSendForgotLoginPasswordMutation,
} = authApi;

export default authApi;
