import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../utils/api"


export const getPaymentScheduleByContract = createAsyncThunk(
    "paymentSchedule/getByContract",
    async (contractId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/payment-schedule/${contractId}`)
            return response.data.schedules || []
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch payment schedule")
        }
    },
)

export const checkOverduePayments = createAsyncThunk("paymentSchedule/checkOverdue", async (_, { rejectWithValue }) => {
    try {
        const response = await api.post(`/payment-schedule/check-overdue`, {})
        return response.data
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to check overdue payments")
    }
})

export const markPaymentAsPaid = createAsyncThunk(
    "paymentSchedule/markAsPaid",
    async ({ scheduleId, paymentDetails }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/payment-schedule/mark-paid/${scheduleId}`,
                paymentDetails
            )
            return response.data.schedule
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to mark payment as paid")
        }
    },
)

export const getAllOverduePayments = createAsyncThunk(
    "paymentSchedule/getAllOverdue",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(`/payment-schedule/overdue`)
            return response.data.overdueSchedules || []
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch overdue payments")
        }
    },
)

export const fetchPaymentSchedule = getPaymentScheduleByContract

const paymentScheduleSlice = createSlice({
    name: "paymentSchedule",
    initialState: {
        currentSchedule: null,
        overduePayments: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearPaymentSchedule: (state) => {
            state.currentSchedule = null
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPaymentScheduleByContract.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getPaymentScheduleByContract.fulfilled, (state, action) => {
                state.loading = false
                state.currentSchedule = action.payload
            })
            .addCase(getPaymentScheduleByContract.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(checkOverduePayments.pending, (state) => {
                state.loading = true
            })
            .addCase(checkOverduePayments.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload.overdueSchedules) {
                    state.overduePayments = action.payload.overdueSchedules
                }
            })
            .addCase(checkOverduePayments.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(markPaymentAsPaid.pending, (state) => {
                state.loading = true
            })
            .addCase(markPaymentAsPaid.fulfilled, (state, action) => {
                state.loading = false
                if (state.currentSchedule && Array.isArray(state.currentSchedule)) {
                    const index = state.currentSchedule.findIndex((item) => item._id === action.payload._id)
                    if (index !== -1) {
                        state.currentSchedule[index] = action.payload
                    }
                }
            })
            .addCase(markPaymentAsPaid.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(getAllOverduePayments.pending, (state) => {
                state.loading = true
            })
            .addCase(getAllOverduePayments.fulfilled, (state, action) => {
                state.loading = false
                state.overduePayments = action.payload
            })
            .addCase(getAllOverduePayments.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearPaymentSchedule } = paymentScheduleSlice.actions
export default paymentScheduleSlice.reducer
