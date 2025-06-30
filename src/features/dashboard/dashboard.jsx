import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { BASE_URL } from "../../utils/constants";
import Helper from '../../utils/hepler';
import Loader from'../../utils/Loader';

import {
  Bar,
  Line,
  Doughnut,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  PointElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  PointElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/statistics/dashboard`,{
    headers: {
      'Content-Type': 'application/json',
      'company_id': Helper.getCompanyId()
    }
  })
      .then((res) => res.json())
      .then((data) => setStats(data.data))
      .catch((err) => console.error("Failed to load stats", err));
  }, []);

if (!stats) {
  return <Loader />;
}


  const pieData = {
    labels: ["Ongoing", "Completed"],
    datasets: [
      {
        label: "Projects",
        data: [stats.ongoingProjects, stats.completedProjects],
        backgroundColor: ["#007bff", "#28a745"],
      },
    ],
  };

  const sortedExpenseTypes = [...stats.charts.expenseByType]
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total));

  const expenseTypeData = {
    labels: sortedExpenseTypes.map((item) => item.type),
    datasets: [
      {
        label: "Expense by Type",
        data: sortedExpenseTypes.map((item) => item.total),
        backgroundColor: sortedExpenseTypes.map(
          (_, i) =>
            `hsl(${(i * 360) / sortedExpenseTypes.length}, 70%, 60%)`
        ),
      },
    ],
  };

  const monthlyExpenseData = {
    labels: stats.charts.monthlyExpenses.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Expenses",
        data: stats.charts.monthlyExpenses.map((item) => item.total),
        backgroundColor: "#6f42c1",
      },
    ],
  };

  const projectExpenseData = {
    labels: stats.charts.expensesPerProject.map((p) => p.project_name),
    datasets: [
      {
        label: "Expense Per Project",
        data: stats.charts.expensesPerProject.map((p) => p.total),
        backgroundColor: "#ffc107",
      },
    ],
  };

  const paymentClientData = {
    labels: stats.charts.paymentsPerClient.map((c) => c.client_name),
    datasets: [
      {
        label: "Payments by Client",
        data: stats.charts.paymentsPerClient.map((c) => c.total),
        backgroundColor: "#17a2b8",
      },
    ],
  };

  const clientProjectData = {
    labels: stats.charts.projectsPerClient.map((c) => c.client_name),
    datasets: [
      {
        label: "Projects by Client",
        data: stats.charts.projectsPerClient.map((c) => c.project_count),
        backgroundColor: "#fd7e14",
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">Dashboard Overview</h1>

      <div className="stats-cards">
        {[
          { label: "Total Projects", value: stats.totalProjects },
          { label: "Ongoing Projects", value: stats.ongoingProjects },
          { label: "Completed Projects", value: stats.completedProjects },
          { label: "Total Clients", value: stats.totalClients },
          { label: "Total Employees", value: stats.totalEmployees },
          { label: "Total Expenses", value: `Rs. ${Number(stats.totalExpenses).toLocaleString()}` },
          { label: "Total Payments", value: `Rs. ${Number(stats.totalPayments).toLocaleString()}` },
        ].map((item, index) => (
          <div className={`card card-${index}`} key={item.label}>
            <p className="card-label">{item.label}</p>
            <p className="card-value">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-box scrollable-chart">
          <h3>Project Completion Status</h3>
          <div className="scroll-wrapper">
            <Doughnut
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
              width={300}
              height={300}
            />
          </div>
        </div>

        <div className="chart-box scrollable-chart">
          <h3>Expense by Type</h3>
          <div className="scroll-wrapper">
            <Bar data={expenseTypeData} />
          </div>
        </div>

        <div className="chart-box scrollable-chart">
          <h3>Monthly Expenses</h3>
          <div className="scroll-wrapper">
            <Line data={monthlyExpenseData} />
          </div>
        </div>

        <div className="chart-box scrollable-chart">
          <h3>Expense per Project</h3>
          <div className="scroll-wrapper">
            <Bar data={projectExpenseData} />
          </div>
        </div>

        <div className="chart-box scrollable-chart">
          <h3>Payments by Client</h3>
          <div className="scroll-wrapper">
            <Bar data={paymentClientData} />
          </div>
        </div>

        <div className="chart-box scrollable-chart">
          <h3>Projects by Client</h3>
          <div className="scroll-wrapper">
            <Bar data={clientProjectData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
