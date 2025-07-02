import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import './ProjectStatistics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#aa46be', '#f55642', '#8884d8'];

const ProjectStatistics = ({ expenses = [], costSummary = {} }) => {
  const pieData = [...expenses]
    .map((e) => ({ name: e.type || e.name || 'Other', value: e.value || 0 }))
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalWithTax = costSummary.withTax || 0;
  const totalWithoutTax = costSummary.withoutTax || 0;
  const totalSpent = costSummary.totalSpent || 0;
  const totalReceived = costSummary.received || 0;

  const remaining = Math.max(0, totalWithoutTax - totalSpent);

  const receivedData = [
    { name: 'Received', value: totalReceived },
    { name: 'Remaining', value: Math.max(0, totalWithTax - totalReceived) }
  ];

  return (
    <div className="statistics-container">
      <h2>📊 Project Statistics</h2>

      <div className="progress-card">
        <h3>💰 Budget Utilization</h3>
        <p>This bar shows how much of the project budget has been spent so far.</p>

        {totalSpent > totalWithoutTax && (
          <div className="warning-text">
            ⚠️ Warning: Spent amount (Rs.{totalSpent.toLocaleString()}) exceeds the budget (Rs. {totalWithoutTax.toLocaleString()})
          </div>
        )}

        <div className="progress-container">
          <div className="budget-label">
            <strong>Total Budget: Rs. {totalWithoutTax.toLocaleString()}</strong>
          </div>
          <div className="progress-bar">
            <div
              className="progress-spent"
              style={{
                width: `${Math.min((totalSpent / totalWithoutTax) * 100, 100)}%`,
              }}
            />
            <div
              className="progress-remaining"
              style={{
                width: `${Math.min((remaining / totalWithoutTax) * 100, 100)}%`,
              }}
            />
          </div>

          <div className="progress-labels">
            <span className="spent-label">Rs. {totalSpent.toLocaleString()} spent</span>
            <span className="left-label">Rs. {remaining.toLocaleString()} left</span>
          </div>
        </div>
      </div>

      <div className="chart-row-horizontal">
        {/* Expense Distribution Pie Chart */}
        <div className="chart-section card">
          <h3>📦 Expense Distribution</h3>
          <p>Breakdown of how funds are distributed across different expense categories.</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="center-label"
              >
               Rs {totalWithoutTax.toLocaleString()}
              </text>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={3}
                labelLine={false}
                isAnimationActive={true}
                animationDuration={1000}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Received Pie Chart */}
        <div className="chart-section card">
          <h3>🏦 Payment Received</h3>
          <p>Displays how much of the total payment has been received from the client.</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={receivedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={3}
                labelLine={false}
                isAnimationActive={true}
                animationDuration={1000}
                label={({ name, value }) => `${name}: Rs ${value.toLocaleString()}`}
              >
                {receivedData.map((_, index) => (
                  <Cell key={`cell-receive-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart on a new line */}
      <div className="chart-section card full-width-bar-chart">
        <h3>📈 Expense by Type</h3>
        <p>Bar chart showing each expense category and its total value.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pieData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {pieData.map((_, index) => (
                <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectStatistics;
