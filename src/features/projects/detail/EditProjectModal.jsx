import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { BASE_URL } from '../../../constants';
import './EditProjectModal.css';

export default function EditProjectModal({ project, onClose, onUpdate }) {
  const [clients, setClients] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDateForSQL = (date) => {
    return new Date(date).toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };

  useEffect(() => {
    const storedClients = JSON.parse(localStorage.getItem('clients') || '{}');
    const clientMap = {};
    storedClients.forEach(client => {
      clientMap[client.id] = client.name;
    });
    setClients(clientMap);
  }, []);

  const initialValues = {
    name: project.name || '',
    description: project.description || '',
    city: project.city || '',
    country: project.country || '',
    unit_name: project.unit_name || '',
    project_manager_name: project.project_manager_name || '',
    project_manager_contact: project.project_manager_contact || '',
    total_amount_with_tax: project.total_amount_with_tax || '',
    total_amount_with_out_tax: project.total_amount_with_out_tax || '',
    po_number: project.po_number || '',
    start_date: project.start_date ? project.start_date.split('T')[0] : '',
    completed: project.completed || false,
    client_id: project.client_id || '',
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Project name is required'),
    client_id: Yup.string().required('Client is required'),
    total_amount_with_tax: Yup.number().required('Amount (incl. tax) is required'),
    total_amount_with_out_tax: Yup.number().required('Amount (excl. tax) is required'),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      ...values,
      end_date: values.completed ? formatDateForSQL(new Date()) : null,
    };

    try {
      const res = await fetch(`${BASE_URL}/project/update/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setSuccess('Project updated successfully');
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <h3>Edit Project</h3>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values }) => (
            <Form className="form-grid">
               <label>Project Name</label> <Field name="name" placeholder="Project Name" />
              <ErrorMessage name="name" component="div" className="error" />

               <label>Description</label> <Field name="description" placeholder="Description" />
                <label>City</label><Field name="city" placeholder="City" />
                <label>Country</label><Field name="country" placeholder="Country" />
                <label>Unit Name</label><Field name="unit_name" placeholder="Unit Name" />
               <label>PM Name</label> <Field name="project_manager_name" placeholder="Manager Name" />
               <label>PM Contact</label> <Field name="project_manager_contact" placeholder="Manager Contact" />
               
               <label>Total Amount</label> <Field name="total_amount_with_out_tax" placeholder="Total without Tax" type="number" />
              <ErrorMessage name="total_amount_with_out_tax" component="div" className="error" />
               <label>Total Amount(inc. tax)</label><Field name="total_amount_with_tax" placeholder="Total with Tax" type="number" />
              <ErrorMessage name="total_amount_with_tax" component="div" className="error" />
                <label>PO Number</label><Field name="po_number" placeholder="PO Number" />
               <label>Start Date</label> <Field name="start_date" type="date" />

            <label className="toggle-switch">
                <Field name="completed">
                    {({ field, form }) => (
                    <input
                        type="checkbox"
                        checked={field.value}
                        onChange={() => form.setFieldValue('completed', !field.value)}
                    />
                    )}
                </Field>
                Completed
            </label>

              {values.completed && (
                <div>
                  <label>End Date</label>
                  <input
                    type="text"
                    value={formatDateForSQL(new Date())}
                    readOnly
                    className="readonly-field"
                  />
                </div>
              )}
              <div >
<label>Client</label>
              <Field as="select" name="client_id">
                <option value="">Select Client</option>
                {Object.entries(clients).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </Field>
              <ErrorMessage name="client_id" component="div" className="error" />
</div>
              {error && <div className="error toast">{error}</div>}
              {success && <div className="success toast">{success}</div>}

              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Project'}
                </button>
                <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
