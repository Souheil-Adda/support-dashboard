// CategoryChart.js
import React from 'react';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import useTicketStore from './store';

function CategoryChart() {
    const { tickets } = useTicketStore();

    // Aggregate ticket count per category
    const categoryData = useMemo(() => {
        const counts = {};

        tickets.forEach(ticket => {
            const cat = ticket.category || 'Uncategorized';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        // Convert to array format for Recharts
        return Object.entries(counts).map(([category, count]) => ({
            category,
            count
        }));
    }, [tickets]);

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3>📊 Tickets per Category</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Ticket Count" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default CategoryChart;
