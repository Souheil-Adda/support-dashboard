import { create } from 'zustand';

const useTicketStore = create((set) => ({
    tickets: [],
    loading: false,
    error: null,
    socketStatus: 'disconnected',

    setTickets: (tickets) => set({ tickets }),
    addTicket: (ticket) => set((state) => ({ tickets: [...state.tickets, ticket] })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSocketStatus: (status) => set({ socketStatus: status }),
    updateTicket: (updated) => set((state) => ({
        tickets: state.tickets.map(t => (t._id === updated._id ? updated : t))
    })),

}));

export default useTicketStore;
