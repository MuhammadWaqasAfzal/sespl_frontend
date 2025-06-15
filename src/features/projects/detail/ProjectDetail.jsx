import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProjectDetail.css';
import { BASE_URL } from '../../../utils/constants';
import AddPaymentModal from './payment/PaymentModal';
import EditProjectModal from './EditProjectModal';
import AddExpenseModal from './expense/AddExpenseModal';
import ProjectStatistics from './statistics/ProjectStatistics';
import GeneralInfo from './generalInfo/GeneralInfo';
import PaymentsSection from './payment/PaymentSection';
import ExpensesSection from './expense/ExpenseSection';
import DocumentsSection from './document/DocumentSection';

export default function ProjectDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const projectFromLocation = location.state?.project;
  const [project, setProject] = useState(projectFromLocation);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensesTypes, setExpensesTypes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [costSummary, setCostSummary] = useState({});

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  useEffect(() => {
    const localDesignation = localStorage.getItem('designations');
    if (localDesignation) setDesignations(JSON.parse(localDesignation));
  }, []);

  useEffect(() => {
    if (project?.id) {
      loadAllProjectData();
    }
  }, [project?.id]);

  const loadAllProjectData = async () => {
    try {
      const latestProject = await fetchProjectDetails();
      const types = await fetchExpenseTypes();
      const [paymentsData, expensesData] = await fetchPaymentsAndExpenses(latestProject.id);

      setProject(latestProject);
      setExpensesTypes(types);
      setPayments(paymentsData);
      setExpenses(expensesData);

      updateStats(expensesData, paymentsData, types, latestProject);

      getProjectDocuments(latestProject.id);
    } catch (err) {
      console.error("Failed to load project data:", err);
    }
  };

  const fetchProjectDetails = async () => {
    const res = await fetch(`${BASE_URL}/project/get/${project.id}`);
    const data = await res.json();
    return data.statusCode === 200 ? data.data : project;
  };

  const fetchExpenseTypes = async () => {
    const cached = localStorage.getItem('expenses');
    if (cached) {
      const types = JSON.parse(cached);
      return types;
    }
    const res = await fetch(`${BASE_URL}/expense/getAll`);
    const data = await res.json();
    const types = data.data || [];
    localStorage.setItem('expenses', JSON.stringify(types));
    return types;
  };

  const fetchPaymentsAndExpenses = async (projId) => {
    const [paymentsRes, expensesRes] = await Promise.all([
      fetch(`${BASE_URL}/payment/get/${projId}`),
      fetch(`${BASE_URL}/projectExpense/get/${projId}`)
    ]);

    const paymentsData = (await paymentsRes.json()).data || [];
    const expensesData = (await expensesRes.json()).data || [];

    return [paymentsData, expensesData];
  };

  const getProjectDocuments = (projId) => {
    fetch(`${BASE_URL}/projectDocuments/getAll/${projId}`)
      .then(res => res.json())
      .then(data => { setDocuments(data.data || []); 
                  console.log(data.data);}
                );

  };

  const updateStats = (expenseList, paymentList, typeList, projectData) => {
    const typeTotals = {};
    let totalSpent = 0;

    expenseList.forEach(e => {
      const matchedType = typeList.find(t => t.id === e.expense_id);
      const type = matchedType?.type || 'Other';
      typeTotals[type] = (typeTotals[type] || 0) + parseFloat(e.amount || 0);
      totalSpent += parseFloat(e.amount || 0);
    });

    const breakdown = Object.entries(typeTotals).map(([type, value]) => ({ type, value }));
    const totalReceived = paymentList.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    setExpenseBreakdown(breakdown);
    setCostSummary({
      totalSpent,
      withTax: parseFloat(projectData?.total_amount_with_tax) || 0,
      withoutTax: parseFloat(projectData?.total_amount_with_out_tax) || 0,
      received: totalReceived
    });
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      const res = await fetch(`${BASE_URL}/payment/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = payments.filter(p => p.id !== id);
        setPayments(updated);
        updateStats(expenses, updated, expensesTypes, project);
      } else {
        alert('Failed to delete payment.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting payment');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`${BASE_URL}/projectExpense/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = expenses.filter(e => e.id !== id);
        setExpenses(updated);
        updateStats(updated, payments, expensesTypes, project);
      } else {
        alert('Failed to delete expense.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting expense');
    }
  };

  if (!project) {
    return <p>No project data found. <button onClick={() => navigate('/home')}>Go back</button></p>;
  }

  return (
    <div className="full-bg project-detail-container">
      <ProjectStatistics expenses={expenseBreakdown} costSummary={costSummary} />
      <GeneralInfo project={project} onEdit={() => setShowEditModal(true)} />
      <PaymentsSection payments={payments} onAdd={() => setShowPaymentModal(true)} onDelete={handleDeletePayment} />
      <ExpensesSection expenses={expenses} expenseTypes={expensesTypes} designations={designations} onAdd={() => setShowExpenseModal(true)} onDelete={handleDeleteExpense} />
      <DocumentsSection documents={documents} projectId={project.id} onRefresh={() => getProjectDocuments(project.id)} />

      {showPaymentModal && (
        <AddPaymentModal projectId={project.id} onClose={() => setShowPaymentModal(false)} onSave={loadAllProjectData} />
      )}
      {showEditModal && (
        <EditProjectModal project={project} onClose={() => setShowEditModal(false)} onUpdate={loadAllProjectData} />
      )}
      {showExpenseModal && (
        <AddExpenseModal projectId={project.id} onClose={() => setShowExpenseModal(false)} onSave={loadAllProjectData} />
      )}
    </div>
  );
}
